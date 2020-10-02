import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const makePdf = async (req: any, res: any) => {
  try {
    const filename = req.body.filename || req.query.filename;
    const pdfPath = path.join(__dirname, filename + '.pdf');
    const pdfDoc = new PDFDocument();

    console.log('NAME', pdfPath, __dirname);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + filename + '" '
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.status(201);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    await pdfDoc.pipe(res);
    const content = await req.body.content;
    pdfDoc.text('este es mi primer pdf');
    pdfDoc.end();
  } catch (err) {
    res.status(400).json({ message: 'An error occured in process' });
  }
};
