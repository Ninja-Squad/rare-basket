package fr.inra.urgi.rarebasket.domain;

/**
 * The permissions that a user can have
 * @author JB Nizet
 */
public enum Permission {
    /**
     * The user can manage orders for an accession holder (i.e. see them, edit them, etc.).
     * To have that permission, the user must be linked to an accession holder.
     */
    ORDER_MANAGEMENT
}
