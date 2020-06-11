CREATE TABLE grc (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR NOT NULL UNIQUE,
    institution VARCHAR NOT NULL,
    address     VARCHAR NOT NULL
);

CREATE SEQUENCE grc_seq START WITH 1001 INCREMENT 50;

CREATE TABLE accession_holder (
    id     BIGINT PRIMARY KEY,
    name   VARCHAR NOT NULL,
    email  VARCHAR NOT NULL UNIQUE,
    phone  VARCHAR NOT NULL,
    grc_id BIGINT  NOT NULL
        CONSTRAINT accession_holder_fk1 REFERENCES grc(id)
);
ALTER TABLE accession_holder
    ADD CONSTRAINT accession_holder_un1
        UNIQUE (name, grc_id);

CREATE SEQUENCE accession_holder_seq START WITH 1001 INCREMENT 50;

CREATE TABLE basket (
    id                    BIGINT PRIMARY KEY,
    reference             VARCHAR     NOT NULL UNIQUE,
    customer_name         VARCHAR,
    customer_organization VARCHAR,
    customer_email        VARCHAR,
    customer_address      VARCHAR,
    customer_type         VARCHAR,
    customer_language     VARCHAR,
    status                VARCHAR     NOT NULL,
    creation_instant      TIMESTAMPTZ NOT NULL,
    rationale             VARCHAR,
    confirmation_code     VARCHAR,
    confirmation_instant  TIMESTAMPTZ
);

CREATE SEQUENCE basket_seq START WITH 1001 INCREMENT 50;

CREATE TABLE basket_item (
    id                   BIGINT PRIMARY KEY,
    accession_name       VARCHAR NOT NULL,
    accession_identifier VARCHAR NOT NULL,
    quantity             INT,
    unit                 VARCHAR,
    basket_id            BIGINT  NOT NULL
        CONSTRAINT basket_item_fk1 REFERENCES basket(id),
    accession_holder_id  BIGINT  NOT NULL
        CONSTRAINT basket_item_fk2 REFERENCES accession_holder(id)
);
CREATE INDEX basket_item_idx1 ON basket_item(basket_id);

CREATE SEQUENCE basket_item_seq START WITH 1001 INCREMENT 50;

CREATE TABLE accession_order (
    id                  BIGINT PRIMARY KEY,
    basket_id           BIGINT  NOT NULL
        CONSTRAINT accession_order_fk1 REFERENCES basket(id),
    accession_holder_id BIGINT  NOT NULL
        CONSTRAINT accession_order_fk2 REFERENCES accession_holder(id),
    status              VARCHAR NOT NULL,
    closing_instant     TIMESTAMPTZ
);
CREATE INDEX accession_order_idx1 ON accession_order(accession_holder_id);

CREATE TABLE accession_order_item (
    id                   BIGINT PRIMARY KEY,
    accession_name       VARCHAR NOT NULL,
    accession_identifier VARCHAR NOT NULL,
    quantity             INT,
    unit                 VARCHAR,
    order_id             BIGINT  NOT NULL
        CONSTRAINT accession_order_item_fk1 REFERENCES accession_order(id)
);
CREATE INDEX accession_order_item_idx1 ON accession_order_item(order_id);

CREATE SEQUENCE accession_order_item_seq START WITH 1001 INCREMENT 50;

CREATE SEQUENCE accession_order_seq START WITH 1001 INCREMENT 50;

CREATE TABLE document (
    id                 BIGINT PRIMARY KEY,
    type               VARCHAR NOT NULL,
    description        VARCHAR,
    creation_instant   TIMESTAMPTZ,
    content_type       VARCHAR NOT NULL,
    original_file_name VARCHAR NOT NULL,
    on_delivery_form   BOOLEAN NOT NULL
);

CREATE SEQUENCE document_seq START WITH 1001 INCREMENT 50;

CREATE TABLE accession_order_document (
    order_id    BIGINT NOT NULL
        CONSTRAINT accession_order_document_fk1 REFERENCES accession_order(id),
    document_id BIGINT NOT NULL
        CONSTRAINT accession_order_document_fk2 REFERENCES document(id),
    PRIMARY KEY (order_id, document_id)
);

CREATE TABLE app_user (
    id                   BIGINT PRIMARY KEY,
    name                 VARCHAR NOT NULL UNIQUE,
    global_visualization BOOLEAN NOT NULL,
    accession_holder_id  BIGINT
        CONSTRAINT app_user_fk1 REFERENCES accession_holder(id)
);

CREATE SEQUENCE app_user_seq START WITH 1001 INCREMENT 50;

CREATE TABLE user_permission (
    id         BIGINT PRIMARY KEY,
    permission VARCHAR NOT NULL,
    user_id    BIGINT  NOT NULL
        CONSTRAINT user_permission_fk1 REFERENCES app_user(id)
);

CREATE SEQUENCE user_permission_seq START WITH 1001 INCREMENT 50;

CREATE TABLE user_visualization_grc (
    user_id BIGINT NOT NULL
        CONSTRAINT user_visualization_grc_fk1 REFERENCES app_user(id),
    grc_id  BIGINT NOT NULL
        CONSTRAINT user_visualization_grc_fk2 REFERENCES grc(id),
    PRIMARY KEY (user_id, grc_id)
)
