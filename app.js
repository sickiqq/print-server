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

// Print a test receipt on server start
const testOrder = {
  order_number: "TEST-0001",
  items: [
    { product_name: "Producto A", quantity: 1, unit_price: 1000, total_price: 1000 },
    { product_name: "Producto B", quantity: 2, unit_price: 1500, total_price: 3000 }
  ],
  subtotal: 4000,
  tax: 760,
  total: 4760
};

printer.printReceipt(testOrder)
  .then(() => console.log('Boleta de prueba enviada a la impresora'))
  .catch(err => console.error('Error al imprimir boleta de prueba:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Servidor de impresión corriendo en http://localhost:${PORT}`);
});