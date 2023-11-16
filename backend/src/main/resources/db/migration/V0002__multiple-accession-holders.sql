CREATE TABLE user_accession_holder
(
    user_id             BIGINT NOT NULL
        CONSTRAINT user_accession_holder_fk1 REFERENCES app_user (id),
    accession_holder_id BIGINT NOT NULL
        CONSTRAINT user_accession_holder_fk2 REFERENCES accession_holder (id),
    PRIMARY KEY (user_id, accession_holder_id)
);

INSERT INTO user_accession_holder (user_id, accession_holder_id)
SELECT u.id, u.accession_holder_id
FROM app_user u
WHERE u.accession_holder_id IS NOT NULL;

ALTER TABLE app_user
    DROP COLUMN accession_holder_id;
