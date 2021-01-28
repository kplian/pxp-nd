import { NextFunction, Request, Response } from 'express';
import { Like, ILike } from 'typeorm';
import { ListParam } from '../ListParamInterface';

export const getListParams = (params: Record<string, any>): ListParam => {
  const newParams: any = {};
  Object.keys(params).map((key) => {
    if (key === 'start') {
      newParams.skip = JSON.parse(params[key]);
      // delete params[key];
    } else if (key === 'limit') {
      newParams.take = JSON.parse(params[key]);
      // delete params[key];
    } else if (key === 'sort') {
      newParams.order = {
        [String(params.sort).replace(/\"/g, '')]:
          String(params.dir).replace(/\"/g, '').toUpperCase() || 'ASC'
      };
      // delete params[key];
      // delete params['dir'];
    } else {
      newParams[key] = params[key];
      // params[key] = JSON.parse(params[key])
    };
  });

  const res: any = {
    ...newParams
  };

  if (params.genericFilterFields) {    
    res.where = [];
    const genericFilterFields = params.genericFilterFields as string;
    const filterFieldsArray = genericFilterFields.split('#');
    filterFieldsArray.forEach((field) => {
      // res.where = {
      //   ...res.where,
      //   [field]:
      //     Like('%' + (params.genericFilterValue as string) + '%')
      // }
      if (res.where) {
        res.where.push({
          [field]: ILike('%' + String(params.genericFilterValue) + '%')
        });
      }
    });
    res.filterValue = res['genericFilterValue'];
    // delete res['genericFilterFields'];
    delete res['genericFilterValue'];
  }
  return res;
}; 

export const parseParams = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  // default values 
  const defaultValues = {
    isActive: true,
    createdBy: req.user.username || ' ',
  };

  req.pxpParams = { ...getListParams(req.query), ...req.body, ...req.params, ...defaultValues };
  req.paramasMerge = { ...req.query, ...req.body, ...req.params, ...defaultValues };
  next();
};
