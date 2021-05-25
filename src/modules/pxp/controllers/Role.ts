/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Role Controller
 *
 * @summary Account Status Type Controller
 * @author
 *
 * Created at     :
 * Last modified  :
 */
 import { EntityManager } from 'typeorm';

 import {
     Controller,
     Get,
     Post,
     Put,
     Delete,
     Patch,
     Route,
     StoredProcedure,
     DbSettings,
     ReadOnly,
     Authentication,
     Permission,
     Model, __, Log
 } from '../../../lib/pxp';
 
 @Model('pxp/Role')
 class Role extends Controller {
 
 }
 
 export default Role;
 