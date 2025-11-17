import PDFDocument from "pdfkit";
import markdown from "markdown-it";

export default function generatePDFReport(md) {
  return new Promise((resolve) => {
    const pdf = new PDFDocument();
    const chunks = [];
    const html = markdown().render(md);

    pdf.text(html, { align: "left" });

    pdf.on("data", chunks.push.bind(chunks));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.end();
  });
}
