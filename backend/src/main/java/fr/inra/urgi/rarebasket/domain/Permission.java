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
    ORDER_MANAGEMENT,

    /**
     * The user can download and see statistics about orders. To have that permission, the user must have
     * a visualization perimeter, which is either global or is a set of GRCs
     */
    ORDER_VISUALIZATION,

    /**
     * The user can manage other users and their permissions, GRCs, accession holders.
     */
    ADMINISTRATION
}
