package fr.inra.urgi.rarebasket.web.accessionholder;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;

/**
 * DTO containing information about an accession holder
 * @author JB Nizet
 */
public final class AccessionHolderDTO {
    private final Long id;
    private final String name;
    private final String email;
    private final GrcDTO grc;

    public AccessionHolderDTO(Long id, String name, String email, GrcDTO grc) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.grc = grc;
    }

    public AccessionHolderDTO(AccessionHolder accessionHolder) {
        this(accessionHolder.getId(),
             accessionHolder.getName(),
             accessionHolder.getEmail(),
             new GrcDTO(accessionHolder.getGrc()));
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public GrcDTO getGrc() {
        return grc;
    }
}
