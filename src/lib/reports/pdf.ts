import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { getManager } from 'typeorm';
import roboto from './fonts/Roboto-Regular-normal.js';
import { getEntity, parseParams } from './helper';
// import { Company } from '../../modules/cereals-nd/entity/Company';

const buildHeader = (doc:any, title:string) => {
  // doc.setTextColor(40);//optional
  // doc.setFontStyle('normal');//optional
  doc.setFontSize(16);
  doc.text(title, 100, 10, 'center');
  doc.line(12, 12, 200, 12); // horizontal line
};


const buildFooter = (doc: any, user: any) => {
  console.log(user);
  
  doc.setFontSize(12);
  doc.text('Usuario: ' + user.username, 10, 290);
  doc.text( moment().format('LLL'), 150, 290);
};

const setRobotoFont = (doc: any) => {
  doc.addFileToVFS('Roboto-Regular.ttf', roboto);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
};


export const makePdf = async (req: any, res: any) => {
  try {

    // s-params
    const params: any  = parseParams(req);
    const Entity = await getEntity(params.module, params.entity);
    // e-params

    const doc: any = new jsPDF({filters: ['ASCIIHexEncode']});
    const pdfPath = path.join(__dirname, params.filename + '.pdf');

    const data = await getManager().find(Entity);
    
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + params.filename + '.pdf" '
      );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
      
    
    // CONFIGURATION PDF
    // Optional - set properties on the document
    doc.setProperties({
      title: params.filename,
      subject: 'Generated Report',
      author: 'Kplian',
      keywords: 'generated, javascript, web 2.0',
      creator: 'MEEE'
    });
    

    setRobotoFont(doc);
    doc.setFontSize(12);

    buildHeader(doc, params.filename);
    doc.autoTable({
      columns: params.columns,
      margin: { top: 20 },
      body: data
    });

    buildFooter(doc, req.user)
    res.end(doc.output());
    // doc.save(pdfPath + '.pdf');
  } catch (err) {
    console.log(err);
    
    res.status(400).json({ message: 'An error occured in process' });
  }
};
