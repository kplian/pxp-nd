export default {
  dbms: 'postgres', // postgres, mysql, sqlserver, oracle
  defaultDbSettings: 'Orm',
  // connections for direct query models
  pgPoolConfig: {
    user: process.env.PG_USER, // name of the user account
    database: process.env.PG_DATABASE, // name of the database
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    max: process.env.PG_MAX_CLIENTS, // max number of clients in the pool
    idleTimeoutMillis: 3000,
  },
  myPoolConfig: {
    connectionLimit: 10,
    host: process.env.MY_HOST,
    user: process.env.MY_USER, // name of the user account
    password: process.env.MY_PASSWORD,
    database: process.env.MY_DATABASE, // name of the database
  },
  msPoolConfig: {
    user: process.env.MS_USER, // name of the user account
    database: process.env.MS_DATABASE, // name of the database
    max: process.env.MS_MAX_CLIENTS, // max number of clients in the pool
    idleTimeoutMillis: 30000,
  },
  orPoolConfig: {
    user: process.env.OR_USER, // name of the user account
    database: process.env.OR_DATABASE, // name of the database
    max: process.env.OR_MAX_CLIENTS, // max number of clients in the pool
    idleTimeoutMillis: 30000,
  },

};