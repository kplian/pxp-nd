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


// import { ScriptInterface } from '@pxp-nd/core';

// import {Person , User , Role, Subsystem , Ui} from '@pxp-nd/entities';
const Person = class{} , User =class{} , Role=class{}, Subsystem=class{} , Ui = class{
  static findOne(filter: any) {}
};
import { ScriptInterface } from '../lib/pxp/utils/Security';
const scriptsArray: ScriptInterface[] = [];

/***************************
 * ADD YOUR SCRIPTS HERE
 ***************************/

scriptsArray.push({
  scriptCode: 'JRR-PXP-20200601-001', scriptFunction: async (em) => {
    const person: any = new Person();
    person.name = 'admin';
    person.lastName = 'admin';
    person.createdBy = 'admin';
    await em.save(person);

    const subsystem: any = new Subsystem();
    subsystem.name = 'PXP';
    subsystem.code = 'PXP';
    subsystem.folderName = 'pxp';
    subsystem.prefix = 'PXP';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    const role: any = new Role();
    role.role = 'admin';
    role.description = 'Pxp Administrator (equals to root)';
    role.createdBy = 'admin';
    role.subsystem = subsystem;
    await em.save(role);

    const user: any = new User();
    user.person = person;
    user.username = 'admin';
    user.hash = '201a971991b7e67d0706a829ba5fc77cf4633a57f21b27bb3fd61e3126e3ccf711282eb04f3973a68d4e1444f032e6279b4ddf09fd6bbf51ada163f2bc7f74ce';
    user.salt = 'bb7094089cd4f2e9528e8d0f1b00d219c3b3a82e8a39402faee476263bf0848c';
    user.createdBy = 'admin';
    user.roles = [role];
    await em.save(user);

    const ui: any = new Ui();
    ui.code = 'PXP';
    ui.name = 'Pxp (root ui)';
    ui.description = 'This should not show in menu all subsystems depend on this';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    await em.save(ui);
  }
});

// ROOT MENU FOR EXAMPLES

scriptsArray.push({
  scriptCode: 'JRR-PXP-20210407-001', scriptFunction: async (em) => {


    const subsystem: any = new Subsystem();
    subsystem.name = 'EXAMPLE';
    subsystem.code = 'EXA ';
    subsystem.folderName = 'exa';
    subsystem.prefix = 'EXA';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    const rootUi = await Ui.findOne({ code: "PXP"});

    const uiParent: any = new Ui();
    uiParent.code = 'EXA';
    uiParent.name = 'EXAMPLES';
    uiParent.description = 'ROOT MENU FOR EXAMPLES';
    uiParent.subsystem = subsystem;
    uiParent.parent = rootUi;// as Ui;
    uiParent.createdBy = 'admin';
    await em.save(uiParent);


    const ui1: any = new Ui();
    ui1.code = 'EXA_FormExample';
    ui1.name = ' FORM EXAMPLES';
    ui1.description = 'ROOT MENU FOR EXAMPLES';
    ui1.subsystem = subsystem;
    ui1.createdBy = 'admin';
    ui1.parent = uiParent;
    ui1.route = "EXA_FormExample";
    await em.save(ui1);


    const ui2: any = new Ui();
    ui2.code = 'EXA_PickerExample';
    ui2.name = 'PICKER EXAMPLES';
    ui2.description = 'ROOT MENU FOR EXAMPLES';
    ui2.subsystem = subsystem;
    ui2.createdBy = 'admin';
    ui2.parent = uiParent;
    ui2.route = "EXA_PickerExample";
    await em.save(ui2);


    const ui3: any = new Ui();
    ui3.code = 'EXA_TextFieldExample';
    ui3.name = 'TEXT FIELd EXAMPLE';
    ui3.description = 'ROOT MENU FOR EXAMPLES';
    ui3.subsystem = subsystem;
    ui3.createdBy = 'admin';
    ui3.parent = uiParent;
    ui3.route = "EXA_TextFieldExample";
    await em.save(ui3);


    const ui4: any = new Ui();
    ui4.code = 'EXA_AutocompleteExample';
    ui4.name = 'AUTO COMPLETE EXAMPLE';
    ui4.description = 'ROOT MENU FOR EXAMPLES';
    ui4.subsystem = subsystem;
    ui4.createdBy = 'admin';
    ui4.parent = uiParent;
    ui4.route = "EXA_AutocompleteExample";
    await em.save(ui4);

  

    const ui5: any = new Ui();
    ui5.code = 'EXA__MapExample';
    ui5.name = 'MAP EXAMPLE';
    ui5.description = 'ROOT MENU FOR EXAMPLES';
    ui5.subsystem = subsystem;
    ui5.createdBy = 'admin';
    ui5.parent = uiParent;
    ui5.route = "EXA__MapExample";
    await em.save(ui5);



    const ui6: any = new Ui();
    ui6.code = 'EXALIST__options';
    ui6.name = 'LIST EXAMPLE OPTIONS';
    ui6.description = 'ROOT MENU FOR EXAMPLES';
    ui6.subsystem = subsystem;
    ui6.createdBy = 'admin';
    ui6.parent = uiParent;
    ui6.route = "EXALIST__options";
    await em.save(ui6);

  }
});


export default scriptsArray;




