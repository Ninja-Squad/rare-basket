-- creates the rarebasket user and database
-- this script must be executed by an admin user. It can typically be executed from the root of the project using
-- psql -h localhost -U postgres -f backend/database/setup.sql -v env=beta -v password=$PASSWORD

\set ON_ERROR_STOP

DO $$
BEGIN
  CREATE ROLE rarebasket password ':password' ;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'role "rarebasket" already exists, skipping';
END
$$;

-- DO $$
-- BEGIN

DROP DATABASE IF EXISTS rarebasket_:env ;
DROP DATABASE IF EXISTS rarebasket_test_:env ;

CREATE DATABASE rarebasket_:env OWNER rarebasket
    ENCODING 'UTF8'
    lc_collate 'fr_FR.UTF-8'
    lc_ctype 'fr_FR.UTF-8'
    template=template0;

CREATE DATABASE rarebasket_test_:env OWNER rarebasket
    ENCODING 'UTF8'
    lc_collate 'fr_FR.UTF-8'
    lc_ctype 'fr_FR.UTF-8'
    template=template0;

-- EXCEPTION WHEN OTHERS THEN
--   RAISE ERROR 'Syntax error on DB creation' USING HINT = 'Variable "env" might not be assigned, use "-v env=beta" for beta environment.';

-- END;
-- $$;