CREATE TABLE grc (
    id   BIGINT PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE
);

CREATE SEQUENCE grc_seq START WITH 1001 INCREMENT 50;

CREATE TABLE grc_contact (
    id     BIGINT PRIMARY KEY,
    email  VARCHAR NOT NULL UNIQUE,
    grc_id BIGINT  NOT NULL
        CONSTRAINT grc_contact_fk1 REFERENCES grc(id)
);

CREATE SEQUENCE grc_contact_seq START WITH 1001 INCREMENT 50;

CREATE TABLE basket (
    id                   BIGINT PRIMARY KEY,
    reference            VARCHAR     NOT NULL UNIQUE,
    customer_name        VARCHAR,
    customer_email       VARCHAR,
    customer_address     VARCHAR,
    customer_type        VARCHAR,
    status               VARCHAR     NOT NULL,
    creation_instant     TIMESTAMPTZ NOT NULL,
    rationale            VARCHAR,
    confirmation_code    VARCHAR,
    confirmation_instant TIMESTAMPTZ
);

CREATE SEQUENCE basket_seq START WITH 1001 INCREMENT 50;

CREATE TABLE basket_item (
    id                   BIGINT PRIMARY KEY,
    accession_name       VARCHAR NOT NULL,
    accession_identifier VARCHAR NOT NULL,
    quantity             INT,
    basket_id            BIGINT  NOT NULL
        CONSTRAINT basket_item_fk1 REFERENCES basket(id),
    contact_id           BIGINT  NOT NULL
        CONSTRAINT basket_item_fk2 REFERENCES grc_contact(id)
);
CREATE INDEX basket_item_idx1 ON basket_item(basket_id);

CREATE SEQUENCE basket_item_seq START WITH 1001 INCREMENT 50;

CREATE TABLE accession_order (
    id              BIGINT PRIMARY KEY,
    basket_id       BIGINT  NOT NULL
        CONSTRAINT accession_order_fk1 REFERENCES basket(id),
    contact_id      BIGINT  NOT NULL
        CONSTRAINT accession_order_fk2 REFERENCES grc_contact(id),
    status          VARCHAR NOT NULL,
    closing_instant TIMESTAMPTZ
);
CREATE INDEX accession_order_idx1 ON accession_order(contact_id);

CREATE TABLE accession_order_item (
    id                   BIGINT PRIMARY KEY,
    accession_name       VARCHAR NOT NULL,
    accession_identifier VARCHAR NOT NULL,
    quantity             INT,
    order_id             BIGINT  NOT NULL
        CONSTRAINT accession_order_item_fk1 REFERENCES accession_order(id)
);
CREATE INDEX accession_order_item_idx1 ON accession_order_item(order_id);

CREATE SEQUENCE accession_order_item_seq START WITH 1001 INCREMENT 50;

CREATE SEQUENCE accession_order_seq START WITH 1001 INCREMENT 50;

CREATE TABLE document (
    id               BIGINT PRIMARY KEY,
    type             VARCHAR NOT NULL,
    description      VARCHAR,
    creation_instant TIMESTAMPTZ
);

CREATE SEQUENCE document_seq START WITH 1001 INCREMENT 50;

CREATE TABLE accession_order_document (
    order_id    BIGINT NOT NULL
        CONSTRAINT accession_order_document_fk1 REFERENCES accession_order(id),
    document_id BIGINT NOT NULL
        CONSTRAINT accession_order_document_fk2 REFERENCES document(id),
    PRIMARY KEY (order_id, document_id)
);
