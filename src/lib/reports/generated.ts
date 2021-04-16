import { getManager } from 'typeorm';
import Report from '../../modules/pxp/entity/Report';
import ReportGroup from '../../modules/pxp/entity/ReportGroup';
import { startsWith, replace, get, set} from 'lodash';
import { makePdf } from './pdf';
import { makeXlsx } from './xlsx';
import * as _ from 'lodash';

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

const getDataQuery = async (query: string, filters: any, type: string, limit: number, start: number) => {
  let qp = parseParamsReport(query, filters); 
  const dataCount = await getManager().query(setCountData(qp));
  qp = !type ? setLimitOffset(qp, limit, start) : qp;
  const data = await getManager().query(qp);

  return {
    data, 
    count: dataCount[0].count
  }
};

const totalCalculate = (data: any, columns: any) => {
  const totals: any = {};
  Object.keys(columns).map((key) => {
    const column = columns[key];
    if (column.total && column.total === 'sum') {
      totals[key] = _.round(_.sumBy(data, (item:any) => parseFloat(item[key])), 2);
    }
  })
  return totals;
};

const getSummaryDetail = (columns: any, columnsDetail: any, config: any ) => {
  const result: any = {};
  Object.keys(config).map(field => {
    result[field] = {
      value: eval(config[field].value),
      label: config[field].label
    };
  });
  return result;
};

const filtersLabelBuild = (filters:any, values: any) => {
  const labels: any = {};
  
  Object.keys(filters).forEach(key => {
    labels[key] = {
      label: filters[key].label,
      value: values[key],
    }
  });

  return labels;
};

export const generateReport = async (req: any, res: any) => {
  try {
    const report:any = await getManager().findOne(Report, {
      where: {
        reportId: req.params.id
      }
    });

    if (report) {
      const config = JSON.parse(report.config); 
      const filters = req.query.filters && req.query.filters !== 'null' ? JSON.parse(req.query.filters) : {};
      
      const type: string = get(req.params, 'type');
      const limit = req.query.limit || 0;
      const start = req.query.start || 0;
      const result = await getDataQuery(report.query, filters, type, limit, start);
      const resultTotal = await getDataQuery(report.query, filters, 'total', limit, start);
      const totals = totalCalculate(resultTotal.data, config.columns);

      const resultDetail: any = report.detailQuery ? await getDataQuery(report.detailQuery, filters, type, limit, start) : null;
      let totalsDetail: any = null, summaryData: any = null;
      if (resultDetail) {
        totalsDetail = totalCalculate(resultDetail.data, config.columnsDetail);
        summaryData = getSummaryDetail(totals, totalsDetail, config.detailSummary);
      }

      const reportData = () => {
        const filtersReport = filtersLabelBuild(JSON.parse(report.filters), filters)
        req.reportData = {
          data: result.data,
          totals,
          filters: filtersReport
        };
        req.reportDetailData = resultDetail ? {
          data: resultDetail.data,
          columns: parseColumns(config.columnsDetail),
          totals: totalsDetail
        } : null;
        req.reportSummary = summaryData;
        req.report = {};
        req.report.columns = parseColumns(config.columns);
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
          ...result,
          totals,
          dataDetail: resultDetail ? resultDetail.data: null,
          countDetail: resultDetail ? resultDetail.count : null,
          totalsDetail,
          summaryData
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