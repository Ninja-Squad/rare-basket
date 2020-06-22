insert into grc (id, name, institution, address) VALUES (1, 'GRC1', 'INRAE', '10 rue du Louvres' || chr(10) || '75000 Paris');
insert into grc (id, name, institution, address) VALUES (2, 'GRC2', 'INRAE', '12 rue de la source' || chr(10) || '69000 Lyon');

insert into accession_holder (id, email, name, phone, grc_id) VALUES (11, 'contact1@grc1.fr', 'CBGP', '0123456789', 1);
insert into accession_holder (id, email, name, phone, grc_id) VALUES (12, 'contact2@grc1.fr', 'Forest BRC', '0123456790', 1);
insert into accession_holder (id, email, name, phone, grc_id) VALUES (21, 'contact1@grc2.fr', 'TCC', '0123456791', 2);
insert into accession_holder (id, email, name, phone, grc_id) VALUES (22, 'contact2@grc2.fr', 'EP-Coll', '0123456791', 2);

-- admin/password: administrator, may visualize orders of all GRCs, may not manage orders
insert into app_user (id, name, accession_holder_id, global_visualization) VALUES (1, 'admin', null, true);

-- contact11/password: may visualize orders of GRC 1, may manage orders of accession holder 11
insert into app_user (id, name, accession_holder_id, global_visualization) VALUES (11, 'contact11', 11, false);

-- contact12/password: may visualize orders of GRC 1, may manage orders of accession holder 12
insert into app_user (id, name, accession_holder_id, global_visualization) VALUES (12, 'contact12', 12, false);

-- contact21/password: may visualize orders of GRC 2, may manage orders of accession holder 21
insert into app_user (id, name, accession_holder_id, global_visualization) VALUES (21, 'contact21', 21, false);

-- contact22/password: may visualize orders of GRC 2, may manage orders of accession holder 22
insert into app_user (id, name, accession_holder_id, global_visualization) VALUES (22, 'contact22', 22, false);

insert into user_permission (id, user_id, permission) VALUES (1, 1, 'ADMINISTRATION');
insert into user_permission (id, user_id, permission) VALUES (2, 11, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (3, 12, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (4, 21, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (5, 22, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (6, 1, 'ORDER_VISUALIZATION');
insert into user_permission (id, user_id, permission) VALUES (7, 11, 'ORDER_VISUALIZATION');
insert into user_permission (id, user_id, permission) VALUES (8, 12, 'ORDER_VISUALIZATION');
insert into user_permission (id, user_id, permission) VALUES (9, 21, 'ORDER_VISUALIZATION');
insert into user_permission (id, user_id, permission) VALUES (10, 22, 'ORDER_VISUALIZATION');

insert into user_visualization_grc (user_id, grc_id) VALUES (11, 1);
insert into user_visualization_grc (user_id, grc_id) VALUES (12, 1);
insert into user_visualization_grc (user_id, grc_id) VALUES (21, 2);
insert into user_visualization_grc (user_id, grc_id) VALUES (22, 2);
