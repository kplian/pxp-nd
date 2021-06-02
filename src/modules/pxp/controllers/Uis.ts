import { getManager, UpdateResult } from 'typeorm';
import { Controller } from '../../../lib/pxp/Controller';
import {
  Get,
  Route,
  Post,
  Patch,
  Delete,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '../../../lib/pxp/Decorators';
import UisModel from '../entity/Ui';

@Route('/uis')
class Account extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async find(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(UisModel, this.pxpParams);
    return { data, count };
  }

  // @Get('/list')
  // @DbSettings('Orm')
  // @ReadOnly(true)
  // async findParent(params: Record<string, unknown>): Promise<any> {
  //   const parmasBuild: any = { ...this.pxpParams };
  //     console.log(parmasBuild);
      
  //     parmasBuild.where = {
  //       parentId : null
  //     }

  //   const uis = await getManager().findAndCount(UisModel,parmasBuild);
  //   return uis;
  // }

  @Get('/find/:parent')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findbyType(params: Record<string, unknown>): Promise<any> {
    const parmasBuild: any = { ...this.pxpParams };
    if (parmasBuild.where) {
      // parmasBuild.where[0].parent = this.pxpParams.parent;
    } else {
      parmasBuild.where = {
        parentId : this.pxpParams.parent,
      }
    }

    const uis= await getManager().findAndCount(UisModel, parmasBuild);
    return uis;
  }

  @Get('/list/:sub')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findbySubsistem(params: Record<string, unknown>): Promise<any> {
    const parmasBuild: any = { ...this.pxpParams };
    if (parmasBuild.where) {
      // parmasBuild.where[0].parent = this.pxpParams.parent;
    } else {
      parmasBuild.where = {
        subsystemId : this.pxpParams.sub,
        route:null
      }
    }

    const uis= await getManager().findAndCount(UisModel, parmasBuild);
    return uis;
  }

  

  // @Get('/list')
  // @DbSettings('Orm')
  // @ReadOnly(true)
  //   async findTrees(): Promise<any> {
  //     const manager = getManager();
  //     const trees = await manager.getTreeRepository(UisModel).findTrees();
  //     // const uis = await getManager().getTreeRepository(UisModel).findTrees();
  //   return trees;
  // }

  @Post()
  @ReadOnly(true)
  @DbSettings('Orm')
  async save(params: any): Promise<UisModel> {

    // if(params.parentId ){ 

    //     params.parentId=null;
    // }
    const uis = await getManager().save(UisModel, {
        ...params
    });
    return uis;
  }

  @Patch('/edit/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async edit(params: any): Promise<any> {
    console.log(params);
    
    const id = params.id;
    delete params.id;
    delete params.uiId;
    await getManager().update(UisModel, id, {
      ...params
    });

    const uis = await getManager().findOne(UisModel, {
      where: { uiId: id }
    });
    return uis;
  }

  @Delete('/delete/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async delete(params: any): Promise<any> {
    const uis = await getManager().delete(UisModel, {
      uisId: params.id
    });
    return uis;
  }
}

export default Account;
