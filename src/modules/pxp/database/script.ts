/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * This files contains data to be added to database for pxp module
 *
 * @summary DML should be added here
 * @author Jaime Rivera
 *
 * Created at     : 2020-10-15 16:31:21
 * Last modified  : 2020-10-23 19:58:43
 */


import { ScriptInterface } from '../../../lib/pxp/utils/Security';

import Person from '../entity/Person';
import User from '../entity/User';
import Role from '../entity/Role';
import Subsystem from '../entity/Subsystem';
import Ui from '../entity/Ui';
const scriptsArray: ScriptInterface[] = [];

/***************************
 * ADD YOUR SCRIPTS HERE
 ***************************/

scriptsArray.push({
  scriptCode: 'JRR-PXP-20200601-001', scriptFunction: async (em) => {
    const person = new Person();
    person.name = 'admin';
    person.lastName = 'admin';
    person.createdBy = 'admin';
    await em.save(person);

    const subsystem = new Subsystem();
    subsystem.name = 'PXP';
    subsystem.code = 'PXP';
    subsystem.folderName = 'pxp';
    subsystem.prefix = 'PXP';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    const role = new Role();
    role.role = 'admin';
    role.description = 'Pxp Administrator (equals to root)';
    role.createdBy = 'admin';
    role.subsystem = subsystem;
    await em.save(role);

    const user = new User();
    user.person = person;
    user.username = 'admin';
    user.hash = '201a971991b7e67d0706a829ba5fc77cf4633a57f21b27bb3fd61e3126e3ccf711282eb04f3973a68d4e1444f032e6279b4ddf09fd6bbf51ada163f2bc7f74ce';
    user.salt = 'bb7094089cd4f2e9528e8d0f1b00d219c3b3a82e8a39402faee476263bf0848c';
    user.createdBy = 'admin';
    user.roles = [role];
    await em.save(user);

    const ui = new Ui();
    ui.code = 'PXP';
    ui.name = 'Pxp (root ui)';
    ui.description = 'This should not show in menu all subsystems depend on this';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    await em.save(ui);
  }
});
/*
scriptsArray.push({
  scriptCode: 'JRR-PXP-20210407-001', scriptFunction: async (em) => {
    subsystem = await __(Subsystem.findOne({ code: 'PXP'}));
    parentUi = await __(Ui.findOne({ code: 'PXP'}));

    const uiExample = new Ui();
    uiExample.code = 'EXAMPLES';
    uiExample.name = 'Examples';
    uiExample.description = 'Examples';
    uiExample.route = 'EXA_FormExample';
    uiExample.subsystem = subsystem;
    uiExample.createdBy = 'admin';
    uiExample.parentId = parentUi;
    await em.save(uiMainMenuMM);
    
  }
});*/

export default scriptsArray;




