import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { getManager } from 'typeorm';
import roboto from './fonts/Roboto-Regular-normal.js';
import { getEntity, parseParams } from './helper';

const buildHeader = (doc:any, title:string) => {
  // doc.setTextColor(40);//optional
  // doc.setFontStyle('normal');//optional
  doc.setFontSize(16);
  doc.text(title.toLocaleUpperCase(), 100, 10, 'center');
  doc.line(12, 12, 200, 12); // horizontal line
};

 
const buildFooter = (doc: any, user: any) => {
  doc.setFontSize(12);
  doc.text('Usuario: ' + user.username, 10, 290);
  doc.text( moment().format('LLL'), 150, 290);
};

const buildParams = (doc: any, filters: any) => {
  doc.setFontSize(10);
  let init = 20;
  Object.keys(filters).forEach(key => {
    const filter = filters[key];
    doc.text( filter.label + ': ', 24, init);
    doc.text(filter.value.toString(), 50, init);
    init += 4;
  });
};

export const setRobotoFont = (doc: any) => {
  doc.addFileToVFS('Roboto-Regular.ttf', roboto);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
};

const totalRender = (columns: any = [], totals:any = {}) => {
  return columns.map((column:any) => {
    if (totals[column.dataKey]) {
      return totals[column.dataKey];
    }
    return '';
  })
}

const footStyles = {
  fillColor: '#e8e8e8',
  textColor: '#2a2a2b',
  fontSize: 11,
}
export const makePdf = async (req: any, res: any) => {
  try {
    let data, params: any = null;
    let filters = {};
    if (!req.reportData) {
      // s-params
      params  = await parseParams(req);
      const Entity = await getEntity(params.module, params.entity);
      data = await getManager().find(Entity);
      // e-params
    } else {
      data = req.reportData.data;
      params = {
        ...req.report
      };
      filters = req.reportData.filters || {};
    }
    
    const doc: any = new jsPDF({filters: ['ASCIIHexEncode']});
    const pdfPath = path.join(__dirname, params.filename + '.pdf');
    const pageNumber = doc.internal.getNumberOfPages();

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
    buildParams(doc, filters);
    doc.autoTable({
      columns: params.columns,
      margin: { top: 20 + 4 * Object.keys(filters).length },
      body: data,
      foot: [totalRender(params.columns, req.reportData.totals)],
      footStyles
    });
    

  /*** DETAIL REPORT START***/
    const detail = req.reportDetailData;
    if (detail) {
      doc.autoTable({
        columns: detail.columns,
        margin: { top: 20 },
        body: detail.data,
        foot: [totalRender(detail.columns, req.reportDetailData.totals)],
        footStyles
      });
    }
    
    /*** DETAIL REPORT END ***/
    doc.setPage(pageNumber);

    buildFooter(doc, req.user)
    res.end(doc.output());
    // doc.save(pdfPath + '.pdf');
  } catch (err) {
    console.log(err);
    
    res.status(400).json({ message: 'An error occured in process' });
  }
};
