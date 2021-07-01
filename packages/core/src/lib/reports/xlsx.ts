import XLSX from 'xlsx';
import { getManager, Entity } from 'typeorm';
import moment from 'moment';
import { getEntity, parseParams } from './helper';
import _ from 'lodash';

const generateTable = (data: any, columns: any) => {
  const heads = _.map(columns, 'header');
  const keys = _.map(columns, 'dataKey');
  const table = [
    heads,
  ]
  data.forEach((item: any) => {
    const aux: any = [];
    keys.forEach(key => aux.push(item[key]));
    table.push(aux);
  });
  return table;
};

export const makeXlsx = async (req: any, res: any) => { 
  try {

      let data, params: any;
      if (!req.reportData) {
        // s-params
        params  = await parseParams(req);
        const Entity = await getEntity(params.module, params.entity);
        data = await getManager().find(Entity, {
          // select: keys,
        });
        // e-params
      } else {
        data = req.reportData.data;
        params = {
          ...req.report
        }
      }
        
    const table = generateTable(data, params.columns)
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    /*** DETAIL REPORT START***/
    const detail = req.reportDetailData;
    if (detail) {
      const tableDetail = generateTable(detail.data, detail.columns)
      const wsd = XLSX.utils.aoa_to_sheet(tableDetail);
      XLSX.utils.book_append_sheet(wb, wsd, 'Detail');
    }

    // write options
    const wopts: any = { bookType: 'xlsx', bookSST: false, type: 'base64' };
    const buffer = XLSX.write(wb, wopts);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="'+ params.filename + '_' + moment().format('DD-MM-YYYY_hh.mm.ss') +'.xlsx" '
      );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.end(new Buffer(buffer, 'base64'));
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'An error occured in process' });
  }
}