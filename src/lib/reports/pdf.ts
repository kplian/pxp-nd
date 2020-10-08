import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getManager } from 'typeorm';
import { Company } from '../../modules/cereals-nd/entity/Company';


export const makePdf = async (req: any, res: any) => {
  try {
    const doc: any = new jsPDF({ orientation: 'landscape' });
    const filename = req.body.filename || req.query.filename;
    const pdfPath = path.join(__dirname, filename + '.pdf');

    const { module, model } = req.query;
    
    const data = await getManager().find(Company);

    function createHeaders(keys: any) {
      var result = [];
      for (var i = 0; i < keys.length; i += 1) {
        result.push({
          id: keys[i],
          name: keys[i],
          prompt: keys[i],
          width: 65,
          align: 'center',
          padding: 0
        });
      }
      return result;
    }
    
    var headers = createHeaders([
      'id',
      'coin',
      'game_group',
      'game_name',
      'game_version',
      'machine',
      'vlt'
    ]);


    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + filename + '.pdf" '
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    
    doc.text('LIST COMPANIES', 10, 10);
    doc.autoTable({
      columns: [
        { header: 'Id', dataKey: 'companyId' },
        { header: 'Nombre', dataKey: 'name' },
        { header: 'Nombre Comercial', dataKey: 'comercialName' }
      ],
      body: data
    });

    console.log('NAME', doc.output());

    res.end(doc.output());
    // doc.save(pdfPath + '.pdf');
  } catch (err) {
    res.status(400).json({ message: 'An error occured in process' });
  }
};
