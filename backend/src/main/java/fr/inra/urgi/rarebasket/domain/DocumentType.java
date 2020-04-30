package fr.inra.urgi.rarebasket.domain;

/**
 * A type of document, with its unicity.
 * Note that `isDocumentTypeUnique` in `order.model.ts` (frontend) must be kept in sync
 * if the unicity of a document changes.
 * @author JB Nizet
 */
public enum DocumentType {
    EMAIL,
    /**
     * material transfert agreement
     */
    MTA,
    SANITARY_PASSPORT,
    INVOICE (true),
    OTHER;

    /**
     * If true, then an order can have at most one document of that type
     */
    private final boolean unique;

    DocumentType() {
        this(false);
    }

    DocumentType(boolean unique) {
        this.unique = unique;
    }

    public boolean isUnique() {
        return unique;
    }
}
