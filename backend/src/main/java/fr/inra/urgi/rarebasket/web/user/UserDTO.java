package fr.inra.urgi.rarebasket.web.user;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.web.accessionholder.AccessionHolderDTO;
import fr.inra.urgi.rarebasket.web.grc.GrcDTO;

/**
 * DTO containing the information about a user
 * @author JB Nizet
 */
public final class UserDTO {
    private final Long id;
    private final String name;
    private final List<Permission> permissions;
    private final List<AccessionHolderDTO> accessionHolders;
    private final boolean globalVisualization;
    private final List<GrcDTO> visualizationGrcs;

    public UserDTO(Long id,
                   String name,
                   Collection<Permission> permissions,
                   Collection<AccessionHolderDTO> accessionHolders,
                   boolean globalVisualization,
                   Collection<GrcDTO> visualizationGrcs) {
        this.id = id;
        this.name = name;
        this.permissions = permissions.stream().sorted().toList();
        this.accessionHolders = accessionHolders.stream().sorted(Comparator.comparing(AccessionHolderDTO::getName)).toList();
        this.globalVisualization = globalVisualization;
        this.visualizationGrcs = visualizationGrcs.stream().sorted(Comparator.comparing(GrcDTO::getName)).toList();
    }

    public UserDTO(User user) {
        this(user.getId(),
             user.getName(),
             user.getPermissions().stream().map(UserPermission::getPermission).toList(),
             user.getAccessionHolders().stream().map(AccessionHolderDTO::new).toList(),
             user.isGlobalVisualization(),
             user.getVisualizationGrcs().stream().map(GrcDTO::new).toList());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Permission> getPermissions() {
        return permissions;
    }

    public List<AccessionHolderDTO> getAccessionHolders() {
        return accessionHolders;
    }

    public boolean isGlobalVisualization() {
        return globalVisualization;
    }

    public List<GrcDTO> getVisualizationGrcs() {
        return visualizationGrcs;
    }
}
