import path from 'path';

export const getEntity = async (module: string, entity: string) => {
  console.log('DERNAME', __dirname, module, entity );
  
  const filePath = path.join(__dirname, '../../modules', module, 'entity', entity);
  const Entity = await import(filePath);
  return Entity.default;
};


export const parseParams = async (req:any) => {
  // s-params
  const columns = JSON.parse(req.query.columns);
  const params = JSON.parse(req.query.params);
  const filename = req.body.filename || req.query.filename;
  const module = req.query.module;
  const entity = req.query.entity;
  // e-params
  return {
    columns,
    params,
    filename,
    module, 
    entity,
  }
}