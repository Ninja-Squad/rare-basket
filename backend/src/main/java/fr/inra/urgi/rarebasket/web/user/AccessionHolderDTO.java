package fr.inra.urgi.rarebasket.web.user;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;

/**
 * DTO containing information about the accession holder of a user
 * @author JB Nizet
 */
public final class AccessionHolderDTO {
    private final Long id;
    private final String name;
    private final String grcName;

    public AccessionHolderDTO(Long id, String name, String grcName) {
        this.id = id;
        this.name = name;
        this.grcName = grcName;
    }

    public AccessionHolderDTO(AccessionHolder accessionHolder) {
        this(accessionHolder.getId(), accessionHolder.getName(), accessionHolder.getGrc().getName());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getGrcName() {
        return grcName;
    }
}
