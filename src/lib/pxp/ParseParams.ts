import { NextFunction, Request, Response } from 'express';
import { Like } from 'typeorm';
import { ListParam } from '.';

const getListParams = (params: Record<string, any>): ListParam => {
  
  Object.keys(params).map((key) => {
    if (key === 'start') {
      params.skip = JSON.parse(params[key]);
      delete params[key];
    } else if (key === 'limit') {
      params.take = JSON.parse(params[key]);
      delete params[key];
    } else if (key === 'sort') {
      params.order = {
        [String(params.sort).replace(/\"/g, '')]:
          String(params.dir).replace(/\"/g, '') || 'ASC'
      };
      delete params[key];
      delete params['dir'];
    } else {
      console.log(params[key])
      // params[key] = JSON.parse(params[key])
    };
  });

  const res: any = {
    ...params
  };

  if (params.genericFilterFields) {    
    const genericFilterFields = params.genericFilterFields as string;
    const filterFieldsArray = genericFilterFields.split('#');
    filterFieldsArray.forEach((field) => {
      res.where = {
        ...res.where,
        [field]:
          Like('%' + (params.genericFilterValue as string) + '%')
      }
      // if (res.where) {
      //   // res.where.push({
      //   //   [field]: Like('%' + (params.genericFilterValue as string) + '%')
      //   // });
      //   res.where[field] = Like(
      //     '%' + (params.genericFilterValue as string) + '%'
      //   );
      // }
    });
    res.filterValue = res['genericFilterValue'];
    delete res['genericFilterFields'];
    delete res['genericFilterValue'];
  }
  return res;
};

export const parseParams = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  req.pxpParams = { ...getListParams(req.query), ...req.body, ...req.params };
  next();
};
