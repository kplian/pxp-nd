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
import {Catalog as CatalogModel} from '@pxp-nd/entities';

@Route('/catalogs')
class Catalog extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async find(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(CatalogModel, this.pxpParams);
    return { data, count };
  }

  @Get('/find/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findById(
      params: Record<string, unknown>
  ): Promise<CatalogModel | any> {
    const catalog = await getManager().findOne(CatalogModel, {
      where: { catalogId: this.pxpParams.id }
    });

    if (!catalog) {
      return {};
    } else {
      return {
        catalog,
      };
    }
  }

  @Post()
  @DbSettings('Orm')
  @ReadOnly(true)
  async save(params: any): Promise<CatalogModel> {
    const catalog = await getManager().save(CatalogModel, {
      ...this.pxpParams
    });
    return catalog;
  }


  @Patch('/edit/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async edit(params: any): Promise<any> {
    console.log(params);
    const id = this.pxpParams.id;
    delete this.pxpParams.id;
    await getManager().update(CatalogModel, id, {
      ...this.pxpParams
    });

    const catalog = await getManager().findOne(CatalogModel, {
      where: { catalogId: id }
    });
    return catalog;
  }

  @Delete('/delete/:id')
  @DbSettings('Orm')
  @ReadOnly(true)
  async delete(params: any): Promise<any> {
    console.log('params', this.pxpParams);
    const catalog = await getManager().delete(CatalogModel, {
      catalogId: this.pxpParams.id
    });
    return catalog;
  }
}

export default Catalog;