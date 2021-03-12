import fs from 'fs';
import path from 'path';
import util from 'util';
import chalk from 'chalk';
import * as figlet from 'figlet';
import 'reflect-metadata';
import { createConnections, getConnection } from 'typeorm';
import prompts from 'prompts';
import _ from 'lodash';


function main() {
    console.log(chalk.greenBright(figlet.textSync('pxp-generator', { horizontalLayout: 'default' })));
    console.log(chalk.greenBright('======================================================================='));
}
main();

const promptData = async (connections = []) => await prompts([
    {
        type: 'select',
        name: 'dataBase',
        message: 'Select database:',
        choices: connections.map((cnn:any) => ({
            title: cnn.name + ' => ' + cnn.options.database,
            value: cnn.name,
        }))
    }
]);
const promptTable = async (connnection:any , database: string) => {
    const tables = await connnection.query("SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [database]);
    return await prompts([
        {
            type: 'autocomplete',
            name: 'name',
            message: 'Select table:',
            choices: tables.map((table:any) => ({
                title: table.name,
                value: table.name,
            }))
        }
    ]);
};

const columnsBuilder = async (connnection:any, database:string, table:string) => {
    const columns = await connnection
        .query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ", [database, table]);
    const columnsBuild: any = {};
    columns.forEach((column:any) => {
        const nameOrm = _.camelCase(column.COLUMN_NAME);
        columnsBuild[nameOrm] = {
            primary: column.COLUMN_KEY === 'PRI' ? true : null,
            name: column.COLUMN_NAME === nameOrm ? null : column.COLUMN_NAME,
            type: column.DATA_TYPE,
            nullable: column.IS_NULLABLE === 'NO' ? false : null,
            length: column.CHARACTER_MAXIMUM_LENGTH,
            default: column.COLUMN_DEFAULT,
        };
    });
    return columnsBuild;
};


const writeColumns = (stream:any, columns:any) => {
    const renderType = (type:any) => {
        switch (type) {
            case 'int':
            case 'bigint':
            case 'tinyint':
            case 'smallint':
            case 'mediumint':
            case 'decimal':
            case 'integer':
            case 'double':
            case 'float':
            case 'year':
                return 'number';
            case 'date':
            case 'time':
            case 'timestamp':
            case 'datetime':
                return 'Date';
            case 'char':
            case 'blob':
            case 'tinyblob':
            case 'tinytext':
            case 'varchar':
            case 'text':
            case 'enum':
            case 'longtext':
                return 'string';
            default:
                return type;
        }
        ;
    };
    const colNameRender = (name:any) => {
        return name === false || name === true || !isNaN(name) ? name : "'" + name + "'";
    };
    const keys = Object.keys(columns);
    keys.forEach(key => {
        const col = _.omitBy(columns[key], _.isNull);
        const keysCol = Object.keys(col);
        stream.write("\n");
        if (col.primary) {
            stream.write("\t@PrimaryGeneratedColumn({ name: '" + col.name + "' })\n");
        }
        else {
            stream.write("\t@Column({" +
                keysCol.map((keyCol, i) => " " + keyCol + ": " + colNameRender(col[keyCol])) +
                " })" +
                "\n");
        }
        stream.write("\t" + key + ": " + renderType(columns[key].type) + ";\n");
    });
};

const createModel = (model: string, dir: string, columns = {}) => {
    const modelOrm = model.charAt(0).toUpperCase() + _.camelCase(model.slice(1));
    const stream = fs.createWriteStream(dir + '/' + modelOrm + '.ts');
    return new Promise((resolve, reject) => {
        stream.once('open', (fd) => {
            stream.write("import {\n");
            stream.write("\tOneToMany,\n");
            stream.write("\tJoinColumn,\n");
            stream.write("\tManyToOne,\n");
            stream.write("\tBaseEntity,\n");
            stream.write("\tEntity,\n");
            stream.write("\tPrimaryGeneratedColumn,\n");
            stream.write("\tColumn\n");
            stream.write("} from 'typeorm';\n");
            stream.write("\n");
            stream.write("@Entity({ name: '" + model + "' })\n");
            stream.write("export default class " + modelOrm + " extends BaseEntity {\n");
            writeColumns(stream, columns);
            stream.write("}\n");
            stream.end();
        });
        stream.on('finish', resolve);
    });
};


const moduleCreate = async (model:string, columns = {}) => {
    const data = await prompts([
        {
            type: 'text',
            name: 'module',
            message: 'Enter PXP module name (pxp):',
        }
    ]);
    const dir = path.join(__dirname, '../src/modules', data.module, 'entity');
    const isModule = fs.existsSync(dir);
    if (isModule) {
        await createModel(model, dir, columns);
        console.log(chalk.greenBright('Model created correctly in: ', dir));
    }
    else {
        console.log(chalk.red('The module does not exist.'));
    }
};

async function connect() {
    const connections:any = await createConnections();
    const db = await promptData(connections);
    const currentDb:any = _.find(connections, { name: db.dataBase });
    const connnection = getConnection(db.dataBase);
    const database = currentDb.options.database;
    const table = await promptTable(connnection, database);
    const columns = await columnsBuilder(connnection, database, table.name);
    await moduleCreate(table.name, columns);
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
}
connect();