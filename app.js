require('dotenv').config();
const express = require('express');
const cors = require('cors');
const printer = require('./services/escPosPrinterService'); // Use EscPosPrinterService

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Print a confirmation receipt on server start
const confirmationMessage = {
  order_number: "CONFIRM-0001",
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  message: "La impresora está activa y lista para usar."
};

printer.printReceipt(confirmationMessage)
  .then(() => console.log('Confirmación de impresora enviada correctamente'))
  .catch(err => console.error('Error al imprimir confirmación de impresora:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Servidor de impresión corriendo en http://localhost:${PORT}`);
});