insert into grc (id, name) VALUES (1, 'GRC1');
insert into grc (id, name) VALUES (2, 'GRC2');

insert into accession_holder (id, email, name, grc_id) VALUES (11, 'contact1@grc1.fr', 'Contact1', 1);
insert into accession_holder (id, email, name, grc_id) VALUES (12, 'contact2@grc1.fr', 'Contact2', 1);
insert into accession_holder (id, email, name, grc_id) VALUES (21, 'contact1@grc2.fr', 'Contact1', 2);

insert into app_user (id, name, accession_holder_id) VALUES (1, 'admin', null);
insert into app_user (id, name, accession_holder_id) VALUES (11, 'contact11', 11);
insert into app_user (id, name, accession_holder_id) VALUES (12, 'contact12', 12);
insert into app_user (id, name, accession_holder_id) VALUES (21, 'contact21', 21);

insert into user_permission (id, user_id, permission) VALUES (1, 1, 'USER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (2, 11, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (3, 12, 'ORDER_MANAGEMENT');
insert into user_permission (id, user_id, permission) VALUES (4, 21, 'ORDER_MANAGEMENT');
