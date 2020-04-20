package fr.inra.urgi.rarebasket.web.accessionholder;

import fr.inra.urgi.rarebasket.domain.Grc;

/**
 * The DTO for a GRC
 * @author JB Nizet
 */
public final class GrcDTO {
    private final Long id;
    private final String name;

    public GrcDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public GrcDTO(Grc grc) {
        this(grc.getId(), grc.getName());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
