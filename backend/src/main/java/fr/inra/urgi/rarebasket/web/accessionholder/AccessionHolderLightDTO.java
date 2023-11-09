package fr.inra.urgi.rarebasket.web.accessionholder;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;

/**
 * A light version of an accession holder, used to display it in list of orders for example
 * @author JB Nizet
 */
public record AccessionHolderLightDTO(Long id, String name) {
    public AccessionHolderLightDTO(AccessionHolder accessionHolder) {
        this(accessionHolder.getId(), accessionHolder.getName());
    }
}
