const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class EscPosPrinterService {
  constructor(printerName) {
    this.printerName = printerName || process.env.PRINTER_NAME || 'POS-80C';
    this.tempFilePath = path.join(os.tmpdir(), 'receipt-raw.txt');
  }

  async printReceipt(order) {
    try {
      if (!order || !Array.isArray(order.items)) {
        throw new Error('Invalid order format: "items" must be an array.');
      }

      const escPosCommands = this.generateEscPosCommands(order);
      await fs.writeFile(this.tempFilePath, escPosCommands, 'binary');
      await this._sendToPrinter();
    } catch (error) {
      throw error;
    } finally {
      await this._cleanTempFile();
    }
  }

  async _sendToPrinter() {
    return new Promise((resolve, reject) => {
      exec(`COPY /B "${this.tempFilePath}" "\\\\127.0.0.1\\${this.printerName}"`, (error) => {
        if (error) {
          reject(new Error(`Print failed: ${error.message}`));
          return;
        }
        resolve();
      });
    });
  }

  async _cleanTempFile() {
    try {
      // Agregamos un pequeño delay para asegurar que el archivo no esté en uso
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const exists = await fs.access(this.tempFilePath)
        .then(() => true)
        .catch(() => false);
      
      if (exists) {
        await fs.unlink(this.tempFilePath)
          .catch(error => {
            // Si el archivo está en uso, lo ignoramos silenciosamente
            if (error.code !== 'EBUSY' && error.code !== 'ENOENT') {
              console.warn('No se pudo eliminar el archivo temporal:', error.message);
            }
          });
      }
    } catch (error) {
      // Ignoramos errores de limpieza ya que no son críticos
      if (error.code !== 'ENOENT') {
        console.debug('Error al limpiar archivo temporal:', error.code);
      }
    }
  }

  generateEscPosCommands(order) {
    const sanitizeText = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-CL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const header = [
        '\x1B\x40',
        '\x1B\x61\x01',
        '\x1D\x21\x11',
        `#${order.order_number}\n`,
        '\x1D\x21\x00',
        '================================\n',
        '\x1D\x21\x01',
        sanitizeText('COMPROBANTE DE VENTA\n'),
        '\x1D\x21\x00',
        `Fecha: ${order.created_at ? formatDate(order.created_at) : new Date().toLocaleString()}\n`,
        `Mesa: ${sanitizeText(order.table_name || 'Sin Asignar')}\n`,
        '================================\n',
    ];

    const items = order.items.map((item) => {
        const name = sanitizeText(item.product_name).substring(0, 30);
        const quantity = item.quantity;
        const unitPrice = item.unit_price.toFixed(2);
        const totalPrice = item.total_price.toFixed(2);
        const instructions = item.special_instructions
            ? `  Nota: ${sanitizeText(item.special_instructions)}\n`
            : '';
        return `${name}\n${quantity} x $${unitPrice} = $${totalPrice}\n${instructions}`;
    });

    const totals = [
        '\n--------------------------------\n',
        `SUBTOTAL: $${order.subtotal.toFixed(2)}\n`,
        `IVA 19%: $${order.tax.toFixed(2)}\n`,
        '\x1D\x21\x01',
        `TOTAL: $${order.total.toFixed(2)}\n`,
        '\x1D\x21\x00',
    ];

    const footer = [
        '\n================================\n',
        '¡Gracias por su compra!\n',
        '\x1B\x64\x03',
        '\x1B\x64\x03',
        '\x1B\x69',
    ];

    return [...header, ...items, ...totals, ...footer].join('');
  }
}

module.exports = new EscPosPrinterService();