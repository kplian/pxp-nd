import XLSX from 'xlsx';
import { getManager, Entity } from 'typeorm';
import moment from 'moment';
import { getEntity, parseParams } from './helper';
import _ from 'lodash';
import { authRouter } from 'auth/auth-routes';

export const makeXlsx = async (req: any, res: any) => { 
  try {
     // s-params
     
     const params: any = await parseParams(req);
     const Entity = await getEntity(params.module, params.entity);
     // e-params
     
     
     const heads = _.map(params.columns, 'header');
     const keys = _.map(params.columns, 'dataKey');
     console.log(heads, keys);
    
    const data = await getManager().find(Entity, {
      select: keys,
    });

    const wb = XLSX.utils.book_new();
    const table = [
      heads,
    ]
    
    data.forEach((item: any) => {
      const aux: any = [];
      keys.forEach(key => aux.push(item[key]));

      table.push(aux);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, 'test');

    // write options
    const wopts: any = { bookType: 'xlsx', bookSST: false, type: 'base64' };
    const buffer = XLSX.write(wb, wopts);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="'+ params.filename +'.xlsx" '
      );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.end(new Buffer(buffer, 'base64'));
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'An error occured in process' });
  }
}