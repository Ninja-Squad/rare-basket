package fr.inra.urgi.rarebasket.web.order;

import java.time.Instant;

import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.DocumentType;

/**
 * DTO containing information about an order document
 * @author JB Nizet
 */
public final class DocumentDTO {
    private final Long id;
    private final DocumentType type;
    private final String description;
    private final Instant creationInstant;
    private final String originalFileName;
    private final String contentType;
    private final boolean onDeliveryForm;

    public DocumentDTO(Long id,
                       DocumentType type,
                       String description,
                       Instant creationInstant,
                       String originalFileName,
                       String contentType,
                       boolean onDeliveryForm) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.creationInstant = creationInstant;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.onDeliveryForm = onDeliveryForm;
    }

    public DocumentDTO(Document document) {
        this(document.getId(),
             document.getType(),
             document.getDescription(),
             document.getCreationInstant(),
             document.getOriginalFileName(),
             document.getContentType(),
             document.isOnDeliveryForm());
    }

    public Long getId() {
        return id;
    }

    public DocumentType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreationInstant() {
        return creationInstant;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public boolean isOnDeliveryForm() {
        return onDeliveryForm;
    }
}
