-- creates the globe42 user and database
-- this script must be executed by an admin user. It can typically be executed from the root of the project using
-- psql -h localhost -U postgres -f backend/database/setup.sql

create user rarebasket password 'rarebasket';
create database rarebasket owner rarebasket
    encoding 'UTF8'
    lc_collate 'fr_FR.UTF-8'
    lc_ctype 'fr_FR.UTF-8'
    template=template0;

create database rarebasket_test owner rarebasket
    encoding 'UTF8'
    lc_collate 'fr_FR.UTF-8'
    lc_ctype 'fr_FR.UTF-8'
    template=template0;
