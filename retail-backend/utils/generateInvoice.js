const PDFDocument = require("pdfkit");

const generateInvoice = (res, order) => {

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Smart Retail Invoice", { align: "center" });

  doc.moveDown();
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Amount: ₹${order.totalAmount}`);
  doc.text(`Status: ${order.status}`);

  doc.end();
};

module.exports = generateInvoice;