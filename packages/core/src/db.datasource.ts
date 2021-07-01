const config = {
    name: 'default',
    synchronize: false,
    logging: false,
    entities: [
      'dist/modules/**/entity/*.js',
      'node_modules/@pxp-nd/entities/**/entity/*.js'
    ],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [
      'src/subscribers/**/*.ts',
      'node_modules/@pxp-nd/core/**/subscribers/*.js'
    ],
    cli: {
      entitiesDir: 'src/modules',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber'
    }
};


const createConnections = (connections: any[] | object ) => {
  if(Array.isArray(connections)) {
    return connections.map(cnn => ({ ...config, ...cnn }));
  } else {
    return { ...config, ...connections };
  }
}

export { createConnections };