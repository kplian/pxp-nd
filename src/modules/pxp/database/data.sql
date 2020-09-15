/********************************************I-DAT-JRR-SEGU-0-06/09/2019********************************************/
INSERT INTO pxp.tsec_person
(created_by, name, last_name)
VALUES(1, 'admin', 'admin' );

INSERT INTO pxp.tsec_user
(created_by, username, hash, salt, person_id )
VALUES(1, 'admin', '201a971991b7e67d0706a829ba5fc77cf4633a57f21b27bb3fd61e3126e3ccf711282eb04f3973a68d4e1444f032e6279b4ddf09fd6bbf51ada163f2bc7f74ce' ,'bb7094089cd4f2e9528e8d0f1b00d219c3b3a82e8a39402faee476263bf0848c', 1);

INSERT INTO pxp.tsec_role (created_by, role, description)
VALUES (1, 'admin', 'Pxp Administrator (equals to root)');

INSERT INTO pxp.tsec_user_role (user_id, role_id)
VALUES (1, 1);

INSERT INTO pxp.tsec_subsystem (created_by, code, name, folder_name, prefix)
VALUES (1, 'PXP', 'PXP', 'PXP', 'PXP');

INSERT INTO pxp.tsec_ui (created_by, code, name, description)
VALUES (1, 'PXP', 'Pxp (root ui)', 'This should not show in menu all subssystems depend on this');
/********************************************F-DAT-JRR-SEGU-0-06/09/2019********************************************/
