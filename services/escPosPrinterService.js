const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class EscPosPrinterService {
  constructor(printerName) {
    this.printerName = printerName || process.env.PRINTER_NAME || 'POS-80-Series';
    this.tempFilePath = path.join(os.tmpdir(), 'receipt-raw.txt');
  }

  async printReceipt(order) {
    try {
      // Validate order structure
      if (!order || !Array.isArray(order.items)) {
        throw new Error('Invalid order format: "items" must be an array.');
      }

      const escPosCommands = this.generateEscPosCommands(order);

      // Create temporary file
      await fs.writeFile(this.tempFilePath, escPosCommands, 'binary');

      // Send to printer
      await this._sendToPrinter();
    } catch (error) {
      console.error('Error printing receipt:', error.message);
      throw error;
    } finally {
      // Clean temporary file
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
      // Check if the file exists before attempting to delete it
      await fs.access(this.tempFilePath);
      await fs.unlink(this.tempFilePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Could not delete temp file:', error.message);
      }
    }
  }

  generateEscPosCommands(order) {
    const sanitizeText = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const header = [
      '\x1B\x40', // Initialize printer
      '\x1B\x61\x01', // Center alignment
      '\x1D\x21\x11', // Double font size
      sanitizeText('COMPROBANTE DE VENTA\n'),
      '\x1D\x21\x00', // Reset font size
      '================================\n',
      `Orden #${order.order_number}\n`,
      `Fecha: ${new Date().toLocaleString()}\n`,
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
      '\x1D\x21\x01', // Double height for total
      `TOTAL: $${order.total.toFixed(2)}\n`,
      '\x1D\x21\x00', // Reset font size
    ];

    const footer = [
      '\n================================\n',
      '¡Gracias por su compra!\n',
      '\x1B\x64\x03', // Feed 3 lines
      '\x1B\x64\x03', // Feed 3 lines
      '\x1B\x69', // Cut paper
    ];

    return [...header, ...items, ...totals, ...footer].join('');
  }
}

module.exports = new EscPosPrinterService();