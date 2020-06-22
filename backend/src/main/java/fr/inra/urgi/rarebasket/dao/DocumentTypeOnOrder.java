package fr.inra.urgi.rarebasket.dao;

import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.DocumentType;

/**
 * Object returned by the document type reporting queries of {@link OrderDao}
 * @author JB Nizet
 */
public final class DocumentTypeOnOrder {
    private final Long orderId;
    private final DocumentType documentType;

    public DocumentTypeOnOrder(Long orderId, DocumentType documentType) {
        this.orderId = orderId;
        this.documentType = documentType;
    }

    public Long getOrderId() {
        return orderId;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DocumentTypeOnOrder)) {
            return false;
        }
        DocumentTypeOnOrder that = (DocumentTypeOnOrder) o;
        return Objects.equals(orderId, that.orderId) &&
            documentType == that.documentType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, documentType);
    }
}
