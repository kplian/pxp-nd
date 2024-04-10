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

import {Person , User , Role, Subsystem , Ui} from '../entities';
//import { ScriptInterface } from '@pxp-nd/core';
import { ScriptInterface } from '@pxp-nd/core';
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

// ROOT MENU FOR EXAMPLES

scriptsArray.push({
  scriptCode: 'JRR-PXP-20210407-001', scriptFunction: async (em) => {

    const subsystem = new Subsystem();
    subsystem.name = 'EXAMPLE';
    subsystem.code = 'EXA ';
    subsystem.folderName = 'exa';
    subsystem.prefix = 'EXA';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    const rootUi = await Ui.findOne({ where: { code: "PXP"}});

    const uiParent = new Ui();
    uiParent.code = 'EXA';
    uiParent.name = 'EXAMPLES';
    uiParent.description = 'ROOT MENU FOR EXAMPLES';
    uiParent.subsystem = subsystem;
    uiParent.parent = rootUi as Ui;
    uiParent.createdBy = 'admin';
    await em.save(uiParent);


    const ui1 = new Ui();
    ui1.code = 'EXA_FormExample';
    ui1.name = ' FORM EXAMPLES';
    ui1.description = 'ROOT MENU FOR EXAMPLES';
    ui1.subsystem = subsystem;
    ui1.createdBy = 'admin';
    ui1.parent = uiParent;
    ui1.route = "EXA_FormExample";
    await em.save(ui1);


    const ui2 = new Ui();
    ui2.code = 'EXA_PickerExample';
    ui2.name = 'PICKER EXAMPLES';
    ui2.description = 'ROOT MENU FOR EXAMPLES';
    ui2.subsystem = subsystem;
    ui2.createdBy = 'admin';
    ui2.parent = uiParent;
    ui2.route = "EXA_PickerExample";
    await em.save(ui2);


    const ui3 = new Ui();
    ui3.code = 'EXA_TextFieldExample';
    ui3.name = 'TEXT FIELd EXAMPLE';
    ui3.description = 'ROOT MENU FOR EXAMPLES';
    ui3.subsystem = subsystem;
    ui3.createdBy = 'admin';
    ui3.parent = uiParent;
    ui3.route = "EXA_TextFieldExample";
    await em.save(ui3);


    const ui4 = new Ui();
    ui4.code = 'EXA_AutocompleteExample';
    ui4.name = 'AUTO COMPLETE EXAMPLE';
    ui4.description = 'ROOT MENU FOR EXAMPLES';
    ui4.subsystem = subsystem;
    ui4.createdBy = 'admin';
    ui4.parent = uiParent;
    ui4.route = "EXA_AutocompleteExample";
    await em.save(ui4);

  

    const ui5 = new Ui();
    ui5.code = 'EXA__MapExample';
    ui5.name = 'MAP EXAMPLE';
    ui5.description = 'ROOT MENU FOR EXAMPLES';
    ui5.subsystem = subsystem;
    ui5.createdBy = 'admin';
    ui5.parent = uiParent;
    ui5.route = "EXA__MapExample";
    await em.save(ui5);



    const ui6 = new Ui();
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

// ROOT MENU FOR SECURITY AND PARAMETERS SYSTEMS
scriptsArray.push({
  scriptCode: 'RCM-PXP-20211007-001', scriptFunction: async (em) => {

    //Security
    let subsystem = new Subsystem();
    subsystem.name = 'SECURITY';
    subsystem.code = 'SEC';
    subsystem.folderName = 'security';
    subsystem.prefix = 'SEC';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    const rootUi = await Ui.findOne({ where: { code: "PXP"}});

    let uiParent = new Ui();
    uiParent.code = 'SEC';
    uiParent.name = 'Security';
    uiParent.description = 'Security System';
    uiParent.subsystem = subsystem;
    uiParent.parent = rootUi as Ui;
    uiParent.createdBy = 'admin';
    await em.save(uiParent);

    let ui = new Ui();
    ui.code = 'SEC_Log';
    ui.name = 'Logs';
    ui.description = 'Activity log';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Log";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_Person';
    ui.name = 'People';
    ui.description = 'Person information';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Person";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_Role';
    ui.name = 'Roles';
    ui.description = 'System Roles';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Role";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_ScriptVersion';
    ui.name = 'Script Version';
    ui.description = 'Scfript Version';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_ScriptVersion";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_Session';
    ui.name = 'Session';
    ui.description = 'Sessions';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Session";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_Transaction';
    ui.name = 'Transactions';
    ui.description = 'Transactions';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Transaction";
    await em.save(ui);
    
    ui = new Ui();
    ui.code = 'SEC_Subsystem';
    ui.name = 'Systems';
    ui.description = 'Systems';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Subsystem";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_Group';
    ui.name = 'Groups';
    ui.description = 'Groups';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_Group";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'SEC_User';
    ui.name = 'Users';
    ui.description = 'Users';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "SEC_User";
    await em.save(ui);

    //Parameters
    subsystem = new Subsystem();
    subsystem.name = 'PARAMETERS';
    subsystem.code = 'PAR';
    subsystem.folderName = 'parameters';
    subsystem.prefix = 'PAR';
    subsystem.createdBy = 'admin';
    await em.save(subsystem);

    uiParent = new Ui();
    uiParent.code = 'PAR';
    uiParent.name = 'Parameters';
    uiParent.description = 'Parameteres System';
    uiParent.subsystem = subsystem;
    uiParent.parent = rootUi as Ui;
    uiParent.createdBy = 'admin';
    await em.save(uiParent);

    
    ui = new Ui();
    ui.code = 'PAR_AccountStatusType';
    ui.name = 'Account Status Type';
    ui.description = 'Activity log';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_AccountStatusType";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_AccountStatus';
    ui.name = 'Account Status';
    ui.description = 'Account Status';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_AccountStatus";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Branch';
    ui.name = 'Branch';
    ui.description = 'Branch';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Branch";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Catalog';
    ui.name = 'Catalogs';
    ui.description = 'Catalogs';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Catalog";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_ChatType';
    ui.name = 'Chat Type';
    ui.description = 'Chat Type';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_ChatType";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Chat';
    ui.name = 'Chat';
    ui.description = 'Chat';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Chat";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_ChatUser';
    ui.name = 'Chat User';
    ui.description = 'Chat User';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_ChatUser";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Config';
    ui.name = 'Config';
    ui.description = 'Config';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Config";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Currency';
    ui.name = 'Currency';
    ui.description = 'Currency';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Currency";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_FileType';
    ui.name = 'File types';
    ui.description = 'File Types';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_FileType";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_File';
    ui.name = 'Files';
    ui.description = 'Files';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_File";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_GlobalData';
    ui.name = 'Global Data';
    ui.description = 'Global Data';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_GlobalData";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Language';
    ui.name = 'Language';
    ui.description = 'Language';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Language";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_TranslationGroup';
    ui.name = 'Translation Group';
    ui.description = 'Translation Group';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_TranslationGroup";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_WordKey';
    ui.name = 'Word key';
    ui.description = 'Word key';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_WordKey";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Message';
    ui.name = 'Message';
    ui.description = 'Messages';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Message";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Notification';
    ui.name = 'Notification';
    ui.description = 'Notifications';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Notification";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_ReportGroup';
    ui.name = 'Reports groups';
    ui.description = 'Reports groups';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_ReportGroup";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Template';
    ui.name = 'Template';
    ui.description = 'Template';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Template";
    await em.save(ui);

    ui = new Ui();
    ui.code = 'PAR_Type';
    ui.name = 'Type';
    ui.description = 'Type';
    ui.subsystem = subsystem;
    ui.createdBy = 'admin';
    ui.parent = uiParent;
    ui.route = "PAR_Type";
    await em.save(ui);

  }

});

export default scriptsArray;