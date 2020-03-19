package fr.inra.urgi.rarebasket.domain;

import java.time.Instant;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.NotNull;

/**
 * A document (of an order typically, but it could be part of another entity if needed).
 * Its actual content is saved in a file on the file system.
 * @author JB Nizet
 */
@Entity
public class Document {
    @Id
    @SequenceGenerator(name = "DOCUMENT_GENERATOR", sequenceName = "document_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "DOCUMENT_GENERATOR")
    private Long id;

    /**
     * The type of document
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    private DocumentType type;

    // TODO the location can be set here, or can be deduced from its ID for example

    /**
     * The description of the document (which can be required, for example if the type is OTHER)
     */
    private String description;

    /**
     * The instant when the document was created, i.e. uploaded
     */
    @NotNull
    private Instant creationInstant;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentType getType() {
        return type;
    }

    public void setType(DocumentType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreationInstant() {
        return creationInstant;
    }

    public void setCreationInstant(Instant creationInstant) {
        this.creationInstant = creationInstant;
    }
}
