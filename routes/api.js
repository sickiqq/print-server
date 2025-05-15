const express = require('express');
const router = express.Router();
const printer = require('../services/escPosPrinterService'); // Corrected import
const path = require('path');

router.post('/print', async (req, res) => {
  try {
    const order = req.body; // Order data sent from the client
    await printer.printReceipt(order);
    res.json({ success: true, message: 'Boleta enviada a la impresora' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/print-test', async (req, res) => {
  try {
    await printer.printTestReceipt();
    res.json({ success: true, message: 'Boleta de prueba enviada' });
  } catch (error) {
    console.error("Error en /print-test:", error.message);
    res.status(500).json({ success: false, message: `Error al imprimir: ${error.message}` });
  }
});

router.get('/status', (req, res) => {
  res.json({ 
    connected: printer.isConnected,
    message: printer.isConnected ? 'Impresora conectada' : 'Impresora desconectada'
  });
});

// New route to preview the PDF
router.get('/preview-test-receipt', async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, '../services/test-receipt.pdf');
    await printer.generateTestReceiptPDF(pdfPath); // Generate the PDF
    res.sendFile(pdfPath); // Serve the PDF for preview
  } catch (error) {
    console.error('Error al generar la previsualización:', error.message);
    res.status(500).json({ success: false, message: `Error al generar la previsualización: ${error.message}` });
  }
});

module.exports = router;