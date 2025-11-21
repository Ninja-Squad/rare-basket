ALTER TABLE basket_item ALTER COLUMN accession_identifier DROP NOT NULL;
ALTER TABLE basket_item ADD COLUMN accession_number VARCHAR;
ALTER TABLE basket_item ADD COLUMN accession_taxon VARCHAR;
ALTER TABLE basket_item ADD COLUMN accession_url VARCHAR;

ALTER TABLE accession_order_item ALTER COLUMN accession_identifier DROP NOT NULL;
ALTER TABLE accession_order_item ADD COLUMN accession_number VARCHAR;
ALTER TABLE accession_order_item ADD COLUMN accession_taxon VARCHAR;
ALTER TABLE accession_order_item ADD COLUMN accession_url VARCHAR;
