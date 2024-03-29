/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Run scripts for all modules
 *
 * @summary Manage modules scripts
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-15 16:31:21
 * Last modified  : 2020-10-23 19:32:15
 */
import fs from 'fs';
import path from 'path';
import util from 'util';
import chalk from 'chalk';
import * as figlet from 'figlet';
import 'reflect-metadata';
import { ScriptInterface } from './lib/pxp/index';
import { createConnections, getConnection } from 'typeorm';
import ScriptVersion from './entities/ScriptVersion';
import pxpScripts from './database/script';

async function loadCustomStripts(){
  const dir = path.join(process.cwd(), 'dist', 'config.js');
  const customScripts = await import(dir);
  return customScripts.default.scripts || [];
}

let scriptArray: ScriptInterface[] = [];
// let scriptArray: ScriptInterface[] = [...pxpScripts];
console.log(
  chalk.red(
    figlet.textSync('script-loader', { horizontalLayout: 'default' })
  )
);

console.log(
  chalk.red('==================================================================')
);
console.log();
const compare = (a: ScriptInterface, b: ScriptInterface): number => {
  let comparison = 0;
  const aSortCode = a.scriptCode.substring(8);
  const bSortCode = b.scriptCode.substring(8);
  if (aSortCode > bSortCode) {
    comparison = 1;
  } else if (aSortCode < bSortCode) {
    comparison = -1;
  }
  return comparison;
}

const executeScripts = async (): Promise<void> => {
  const connection = getConnection();  
  
  while (scriptArray.length > 0) {
    const scriptObject = scriptArray.shift();
    if (scriptObject) {
      const foundSV = await ScriptVersion.findOne({ scriptCode: scriptObject.scriptCode });
      if (!foundSV) {
        let queryRunner = connection.createQueryRunner();
        try {          
          await queryRunner.connect();
          await queryRunner.startTransaction();
          const manager = queryRunner.manager;

          await scriptObject.scriptFunction(manager);
          const scriptVersion = new ScriptVersion();
          scriptVersion.scriptCode = scriptObject.scriptCode;
          await manager.save(scriptVersion);
          await queryRunner.commitTransaction();
          console.log(chalk.green('Loaded: ' + scriptObject.scriptCode));
        } catch (err) {
          await queryRunner.rollbackTransaction();
          console.log(chalk.red('Error: ' + scriptObject.scriptCode, err));
        } finally {
          await queryRunner.release();
        }
      } else {
        console.log('Already exists: ' + scriptObject.scriptCode);
      }
    }
  }
}



(async () => {
  try {
    await createConnections();
    const readdir = util.promisify(fs.readdir);
    const modulesPath = `${process.cwd()}/dist/modules`;
    let modules: string[] = [];
    try {
      const customScripts = await loadCustomStripts();
      scriptArray = [ ...scriptArray, ...customScripts];
      modules = await readdir(modulesPath);
      for (const module of modules) {
        const url = modulesPath + '/' + module + '/database/script.js';
        if (fs.existsSync(url)) {
          const scriptAux = await import(url);
          scriptArray = scriptArray.concat(scriptAux.default);
        }
      }
      scriptArray.sort(compare);
      await executeScripts();
      console.log(
        chalk.blue(
          figlet.textSync('thank you', { font: 'Mini', horizontalLayout: 'default' })
        )
      );
      process.exit();
    } catch (err) {
      console.log('Error running script manager', err);
    }

  } catch (e) {
    // Deal with the fact the chain failed
  }
})();