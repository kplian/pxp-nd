import { query } from 'express';
import { getManager } from 'typeorm';
import Report from '../../modules/pxp/entity/Report';
import ReportGroup from '../../modules/pxp/entity/ReportGroup';
import { startsWith, replace, get, set} from 'lodash';
import { makePdf } from './pdf';
import { makeXlsx } from './xlsx';

const parseColumns = (columns: any) => Object.keys(columns).map((key) => ({
    header: columns[key].label,
    dataKey: key,
}));

const setLimitOffset = (query: string, limit: number, offset:number ) => {
  return `${query} LIMIT ${limit} OFFSET ${offset} `;
};

const setCountData = (query: string ) => {
  return `SELECT count(*) from (${query}) as report`;
};

export const generateReport = async (req: any, res: any) => {
  try {
    const report:any = await getManager().findOne(Report, {
      where: {
        reportId: req.params.id
      }
    });
    console.log('[QUERY]', req.query);
    

    if (report) {
      const filters = req.query.filters && req.query.filters !== 'null' ? JSON.parse(req.query.filters) : {};
      
      let qp = parseParamsReport(report.query, filters); 
      const type: string = get(req.params, 'type');
      const dataCount = await getManager().query(setCountData(qp));

      qp = !type ? setLimitOffset(qp, req.query.limit, req.query.start) : qp;
        
      const data = await getManager().query(qp);

      const reportData = () => {
        req.reportData = {data};
        req.report = {};
        req.report.columns = parseColumns(JSON.parse(report.config));
        req.report.filename = report.name;
      };

      if ( type &&  type === 'pdf') {
        reportData();
        makePdf(req, res);
      } else if (type &&  type === 'xlsx') {
        reportData();
        makeXlsx(req, res);
      } else {
        return res.send({
          data: data,
          count: dataCount[0].count
        })
      }
      
    } else {
      res.status(400).send({
        error: true,
        message: 'Invalid Report'
      });
    }
  } catch (ex) {
    console.log(ex);
    
    res.status(500).send({
        error: true,
        message: 'Internal Server Error'
      });
  }

};

export const listGroup = async (req: any, res: any) => {
  const reports: any = await getManager().find(ReportGroup, {
    where: {
      active: true,
    },
    select: ['title', 'reportGroupId'],
  });  
  return res.send(reports)
};

export const listReports = async (req: any, res: any) => {
  console.log('REPORTPS', req.params);
  
  const reports: any = await getManager().find(Report, {
    where: {
      active: true,
      reportGroupId: req.params.groupId
    },
    select: ['reportId', 'name'],
    order: {
      order: 'ASC'
    }
  });  
  return res.send(reports)
};

export const getReport = async (req: any, res: any) => {
  const report: any = await getManager().findOne(Report, {
    where: {
      reportId: req.params.id
    },
    select: ['reportId', 'name', 'filters', 'config' ]
  });
  console.log(report);
  
  return res.send(report)
};

const parseParamsReport = (query: string, params: any = {}) => {
  const loadParams = query.replace(/\n/g, '').split(' ').filter(item => startsWith(item, ':'));

  const convertParams = loadParams.map(item => {
    const key = item.substring(1, item.length);
    if (params[key]) {
      return {
        key,
        value: `'${params[key]}'`,
      }
    } else {
      return {
        key,
        value: '',
      }
    }
  });

  convertParams.forEach(item => query = replace(query, ':' + item.key, item.value));   
  return query;
};