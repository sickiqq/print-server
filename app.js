require('dotenv').config();
const express = require('express');
const cors = require('cors');
const printer = require('./services/escPosPrinterService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de impresión corriendo en http://localhost:${PORT}`);
});