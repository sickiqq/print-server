const express = require('express');
const router = express.Router();
const printer = require('../services/escPosPrinterService');

router.post('/print', async (req, res) => {
  try {
    const order = req.body;
    await printer.printReceipt(order);
    res.json({ success: true, message: 'Boleta enviada a la impresora' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;