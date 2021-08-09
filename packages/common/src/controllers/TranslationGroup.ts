/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * User Controller
 *
 * @summary User Controller
 * @author Israel Cm
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-17 19:04:30
 */
import { getManager, EntityManager, getConnection } from 'typeorm';
import {
  Controller,
  Get,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model,
  Authentication,
  Post
} from '@pxp-nd/core';
import {TranslationGroup as TranslationGroupModel} from '../entities';
import {WordKey as WordKeyModel} from '../entities';
import {Language} from '../entities';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import * as _ from 'lodash';
import XLSX from 'xlsx';

@Route('/translate/groups')
@Model('common/TranslationGroup')
class TranslationGroup extends Controller {

  @Post('/')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(false)
  async save(params: any, manager: EntityManager) {
    const getPathEntity = (entity: string) => {
      const dir = path.join(__dirname, '../../../', 'modules');
      console.log(dir);
      const modules = fs.readdirSync(dir);
      let response: any = { error: true };
      modules.forEach(file => {
        const files = fs.readdirSync(path.join(dir, file, 'entity'));
        const exist = _.indexOf(files, entity + '.js') >= 0;
        if (exist) {
          response = {
            path: path.join(dir, file, 'entity'),
            module: file,
          }; 
        }
      });
      return response;
    };

    const group = await manager.save(TranslationGroupModel, {
      ...params,
    });

    
    if(group.type === 'table') {
      const pathEntity = getPathEntity(group.tableName);
      let model = null;

      if(!pathEntity.error) {
        model = await import(path.join(pathEntity.path, group.tableName+ '.js'));
        const data = await manager.find(model.default);
        const words = _.map(data, (item: any) => {
          
          return {
          translationGroupId: group.translationGroupId,
          code: _.camelCase(group.tableName) + '_'+ group.columnTranslate + '_' + item[_.camelCase(group.tableName) + 'Id'],
          defaultText: item[group.columnTranslate],
        }});
        await manager.save(WordKeyModel, words);
      }
    }

    return group;
  }

  @Get('/modules')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(true)
  async listModules(params: any, manager: EntityManager) {
    const dir = path.join(__dirname, '../../../', 'modules');
    const modules = fs.readdirSync(dir);
    return {
      data: _.map(modules, (item:any) =>({ name: item}))
    };
  }

  @Get('/modules/:module/entities')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(true)
  async listTablesDb(params: any, manager: EntityManager) {
    const connection = getConnection();
    const dir = path.join(__dirname, '../../../', 'modules', params.module, 'entity');
    let entities = fs.readdirSync(dir);
    entities = entities.filter(item => !item.includes('.map'));
    entities = entities.map(item => item.replace('.js', ''));
    
    const allEntities = _.map(connection.entityMetadatas, (item:any) =>({ name: item.name}));
    return {
      data: allEntities.filter(item => _.includes(entities, item.name)),
    };
  }

  @Get('/entities/:entity/fields')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(true)
  async listEntityColumns(params: any) {
    const connection = getConnection();
    const entity: any = _.find(connection.entityMetadatas, {name: params.entity}) || {};
    let fields = _.map(entity.columns, (item:any) =>({ name: item.propertyName}));
    fields = fields.filter( item => !_.includes(['createdBy', 'userIdAi', 'userAi', 'modifiedBy', 'createdAt', 'modifiedAt', 'isActive'], item.name))
    return {
      data: fields
    };
  }


  @Get('/json')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(false)
  async getJsonLanguage(params: any, manager: EntityManager, res:  any) {
    const langs:  any = await manager.find(Language);
    const groupInterfaces = await manager.find(TranslationGroupModel, {
      where: {
        type: 'interface',
      },
      relations: ['words']
    }); 

    const createByLang = (languageId: number) => {
      const data: any = { };

      groupInterfaces.forEach(group => {
        const items:any = {};
        group.words.forEach(item => {
          const translate:any = _.find(item.translates, {languageId});
          items[item.code] = translate ? translate.text : item.defaultText;
        });
        data[group.code] = {...items}
      });
      return data;
    };

    const jsonFiles: any = { };
    langs.forEach((lang: any) => jsonFiles[lang.code] = createByLang(lang.languageId));

    //create folders
    const temp = path.join(__dirname, '/../../../tmp/locales');
    if (!fs.existsSync(temp)){
      fs.mkdirSync(temp, { recursive: true });
      langs.forEach((item:any) => fs.mkdirSync(temp + '/' +item.code));
    }

    const files: any = [];
    Object.keys(jsonFiles).forEach(key=>{
      Object.keys(jsonFiles[key]).forEach(elem =>{
        files.push(fs.promises.writeFile( path.join(temp, key, elem +'.json'), JSON.stringify(jsonFiles[key][elem]), 'utf8'));
      });
    });

    
    await Promise.all(files);
    const zip = new AdmZip(); 
    // Object.keys(jsonFiles).forEach(key=>zip.addLocalFile(key +'.json'));
    zip.addLocalFolder(path.join(temp, '../'));
    const name = 'locales.zip';
    const data = zip.toBuffer(); 

    res.set('Content-Type','application/octet-stream'); 
    res.set('Content-Disposition',`attachment; filename=${name}`); 
    res.set('Content-Length', data.length); 
    res.send(data); 

    // return jsonFiles;
  }

  @Get('/csv')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(false)
  async getCsvLanguage(params: any, manager: EntityManager, res:  any) {
    const langs:  any = await manager.find(Language, { order:{ code: 'ASC'}});
    const groupInterfaces = await manager.find(TranslationGroupModel, {
      // where: {
      //   type: 'interface',
      // },
      relations: ['words'],
      order:{ type: 'ASC'},
    }); 

    // Data
    const header  = ['code', 'defaultText', ...langs.map((item:any) => item.code)];
    
    const wb = XLSX.utils.book_new();
    
    groupInterfaces.forEach(group => {
      const items:any = [header];
      group.words.forEach(item => {
        const translates:any = _.orderBy(item.translates, ['code'], ['asc']);
        items.push([
          item.code,
          item.defaultText,
          ...translates.map((t:any)=>t.text),
        ]);
        
      });
      
      const ws = XLSX.utils.aoa_to_sheet(items);
      XLSX.utils.book_append_sheet(wb, ws, group.code);
    });    

    const name = 'locales.xlsx';

    // write options
    const wopts: any = { bookType: 'xlsx', bookSST: false, type: 'base64' };
    const buffer = XLSX.write(wb, wopts);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition',`attachment; filename=${name}`); 
    // res.set('Content-Length', buffer.length); 
    // res.send(buffer); 
    res.end(new Buffer(buffer, 'base64'));    
    // return jsonFiles;
  }

  @Post('/import')
  @DbSettings('Orm')
  @Authentication(false)
  @ReadOnly(false)
  async importCsvFile(params: any, res:  any) {
    console.log(params);
    
    const workbook = XLSX.readFile(params.file.buffer, {type: 'buffer'});
    const sheetnames = Object.keys(workbook.Sheets);

    let i = sheetnames.length;
    const resData: any = {};

    while (i--) {
      const sheetname = sheetnames[i];
      const arrayName = sheetname.toString();
      resData[sheetname] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname]);
    }

    return {}; 
  }
}

export default TranslationGroup;
