package fr.inra.urgi.rarebasket.web.grc;

import fr.inra.urgi.rarebasket.domain.Grc;

/**
 * The DTO for a GRC
 * @author JB Nizet
 */
public final class GrcDTO {
    private final Long id;
    private final String name;
    private final String address;
    private final String institution;

    public GrcDTO(Long id, String name, String address, String institution) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.institution = institution;
    }

    public GrcDTO(Grc grc) {
        this(grc.getId(), grc.getName(), grc.getAddress(), grc.getInstitution());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getInstitution() {
        return institution;
    }
}
