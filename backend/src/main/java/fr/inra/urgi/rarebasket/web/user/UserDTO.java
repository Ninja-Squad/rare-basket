package fr.inra.urgi.rarebasket.web.user;

import java.util.Set;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.web.accessionholder.AccessionHolderDTO;

/**
 * DTO containing the information about a user
 * @author JB Nizet
 */
public final class UserDTO {
    private final Long id;
    private final String name;
    private final Set<Permission> permissions;
    private final AccessionHolderDTO accessionHolder;

    public UserDTO(Long id,
                   String name,
                   Set<Permission> permissions,
                   AccessionHolderDTO accessionHolder) {
        this.id = id;
        this.name = name;
        this.permissions = permissions;
        this.accessionHolder = accessionHolder;
    }

    public UserDTO(User user) {
        this(user.getId(),
             user.getName(),
             user.getPermissions().stream().map(UserPermission::getPermission).collect(Collectors.toSet()),
             user.getAccessionHolder() == null ? null : new AccessionHolderDTO(user.getAccessionHolder()));
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public AccessionHolderDTO getAccessionHolder() {
        return accessionHolder;
    }
}
