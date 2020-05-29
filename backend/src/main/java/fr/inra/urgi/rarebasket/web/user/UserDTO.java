package fr.inra.urgi.rarebasket.web.user;

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
    private final AccessionHolderDTO accessionHolder;
    private final boolean globalVisualization;
    private final Set<GrcDTO> visualizationGrcs;

    public UserDTO(Long id,
                   String name,
                   List<Permission> permissions,
                   AccessionHolderDTO accessionHolder,
                   boolean globalVisualization,
                   Set<GrcDTO> visualizationGrcs) {
        this.id = id;
        this.name = name;
        this.permissions = permissions;
        this.accessionHolder = accessionHolder;
        this.globalVisualization = globalVisualization;
        this.visualizationGrcs = visualizationGrcs;
    }

    public UserDTO(User user) {
        this(user.getId(),
             user.getName(),
             user.getPermissions().stream().map(UserPermission::getPermission).sorted().collect(Collectors.toList()),
             user.getAccessionHolder() == null ? null : new AccessionHolderDTO(user.getAccessionHolder()),
             user.isGlobalVisualization(),
             user.getVisualizationGrcs().stream().map(GrcDTO::new).collect(Collectors.toSet()));
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

    public AccessionHolderDTO getAccessionHolder() {
        return accessionHolder;
    }

    public boolean isGlobalVisualization() {
        return globalVisualization;
    }

    public Set<GrcDTO> getVisualizationGrcs() {
        return visualizationGrcs;
    }
}
