import { getManager, UpdateResult } from 'typeorm';
import { Controller } from '@pxp-nd/core';
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
} from '@pxp-nd/core';
import {CatalogValue as CatalogValueModel} from '@pxp-nd/entities';
import {Catalog as CatalogModel} from '@pxp-nd/entities';

@Route('/catalog-values')
class CatalogValue extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async find(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(CatalogValueModel, this.pxpParams);
    return { data, count };
  }

  //---------------------
  @Get('/find/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findByCatalogId(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(CatalogValueModel, { where: {catalogId: this.pxpParams.id}})
    return { data, count };
  }

  @Get('/code/:code')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findByCatalogCode(params: Record<string, unknown>): Promise<any> {

    const catalogParent = await  getManager().findOne(CatalogModel, { where: {code: this.pxpParams.code}})
    if (catalogParent) {
      const [data, count] = await getManager().findAndCount(CatalogValueModel, { where: {catalogId: catalogParent.catalogId}})
      return { data, count };
    } else {
      return []
    }

  }
  //---------------------

  @Post()
  @DbSettings('Orm')
  @ReadOnly(true)
  async save(params: any): Promise<CatalogValueModel> {
    const catalogValue = await getManager().save(CatalogValueModel, {
      ...this.pxpParams
    });
    return catalogValue;
  }

  @Patch('/edit/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async edit(params: any): Promise<any> {
    console.log(params);
    const id = this.pxpParams.id;
    delete this.pxpParams.id;
    await getManager().update(CatalogValueModel, id, {
      ...this.pxpParams
    });

    const catalogValue = await getManager().findOne(CatalogValueModel, {
      where: { catalogValueId: id }
    });
    return catalogValue;
  }

  @Delete('/delete/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async delete(params: any): Promise<any> {
    console.log('params', params);
    const catalogValue = await getManager().delete(CatalogValueModel, {
      catalogValueId: this.pxpParams.id
    });
    return catalogValue;
  }
}

export default CatalogValue;