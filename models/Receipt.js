class Receipt {
  constructor(data) {
    this.header = data.header || 'BOLETA';
    this.orderNumber = data.orderNumber || '';
    this.date = data.date || new Date().toLocaleString();
    this.table = data.table || '';
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.tax = data.tax || 0;
    this.total = data.total || 0;
  }
}

module.exports = Receipt;