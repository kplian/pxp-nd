import path from 'path';
import fs from 'fs';

const config = {
    name: 'default',
    synchronize: false,
    logging: false,
    entities: [
      'dist/modules/**/entity/*.js',
      'dist/modules/**/entities/*.js',
      // 'node_modules/@pxp-nd/entities/**/entity/*.js'
    ],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [
      'src/subscribers/**/*.ts',
      // 'node_modules/@pxp-nd/core/**/subscribers/*.js'
    ],
    cli: {
      entitiesDir: 'src/modules',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber'
    }
};

const setConfig = (connection: any) => {
  if(connection.hasOwnProperty('entities')) {
    return { ...config, ...connection, entities: [...config.entities, ...connection.entities] };
  }

  return { ...config, ...connection };
};

const createConnections = (connections: any[] | object ) => {
  if(Array.isArray(connections)) {
    return connections.map(cnn => setConfig(cnn));
  } else {
    return setConfig(connections);
  }
}

const createCommonControllers = (entities: any[]) => {
  const pathModules = path.join(process.cwd(), 'dist', 'modules', 'common');
  const pathEntities = path.join(pathModules, 'entity');
  const pathControllers = path.join(pathModules, 'controllers');
  const pathCommonEntities = path.join(process.cwd(), 'node_modules', '@pxp-nd', 'common', 'dist', 'entities');
  const pathCommonControllers = path.join(process.cwd(), 'node_modules', '@pxp-nd', 'common', 'dist', 'controllers');

  if (!fs.existsSync(pathEntities)){
    fs.mkdirSync(pathEntities, { recursive: true });
  }

  if (!fs.existsSync(pathControllers)){
    fs.mkdirSync(pathControllers, { recursive: true });
  }

  fs.readdir(pathCommonEntities, (err, files) => {
    if(!err) {
      files.forEach(file => {
        if(!file.includes('index') && file.includes('.js')) {
          fs.copyFile(
            path.join(pathCommonEntities, file ),
            path.join(pathEntities, file),
            (err) => {
              if(err) console.log(err);  
            }
          )
        }
      })
    }
  });


  fs.readdir(pathCommonControllers, (err, files) => {
    if(!err) {
      files.forEach(file => {
        if(!file.includes('index') && file.includes('.js')) {
          fs.copyFile(
            path.join(pathCommonControllers, file ),
            path.join(pathControllers, file),
            (err) => {
              if(err) console.log(err);  
            }
          )
        }
      })
    }
  });
  
}

// createCommonControllers([]);

export { createConnections };