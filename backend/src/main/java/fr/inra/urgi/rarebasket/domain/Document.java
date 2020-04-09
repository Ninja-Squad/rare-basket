package fr.inra.urgi.rarebasket.domain;

import java.time.Instant;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.NotBlank;
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

    /**
     * The description of the document (which can be required, for example if the type is OTHER)
     */
    private String description;

    /**
     * The instant when the document was created, i.e. uploaded
     */
    @NotNull
    private Instant creationInstant = Instant.now();

    /**
     * The content type of the document
     */
    @NotBlank
    private String contentType;

    /**
     * The original file name of the document
     */
    @NotBlank
    private String originalFileName;

    public Document() {
    }

    public Document(Long id) {
        this.id = id;
    }

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

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
}
