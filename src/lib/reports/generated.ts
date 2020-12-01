import { getManager } from 'typeorm';
import Report from '../../modules/pxp/entity/Report';


export const generateReport = async (req: any, res: any) => {
  
  
  console.log('[REPORT]', req.params);
  const report:any = await getManager().findOne(Report, {
    where: {
      reportId: req.params.id
    }
  });
  console.log(report);

  if (report) {
    const q = await getManager().query(report.query);
    console.log(q);
  }
  
  return res.send(report)
};