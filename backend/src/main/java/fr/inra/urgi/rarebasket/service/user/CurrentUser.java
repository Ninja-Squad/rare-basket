package fr.inra.urgi.rarebasket.service.user;

import java.security.Principal;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;

import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.ForbiddenException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * A request-scoped bean containing the current user information, or null if the user is not authenticated,
 * or is authenticated using a KeyCloak user
 * @author JB Nizet
 */
@Component
@RequestScope
public class CurrentUser {

    private final HttpServletRequest request;
    private final UserDao userDao;

    private UserInformation userInformation;
    private boolean initialized = false;

    public CurrentUser(HttpServletRequest request, UserDao userDao) {
        this.request = request;
        this.userDao = userDao;
    }

    public Optional<Long> getId() {
        return this.loadIfNecessary().map(UserInformation::getId);
    }

    public Optional<Long> getAccessionHolderId() {
        return this.loadIfNecessary().map(UserInformation::getAccessionHolderId);
    }

    public boolean hasPermission(Permission permission) {
        return this.loadIfNecessary()
                   .map(u -> u.getPermissions().contains(permission))
                   .orElse(false);
    }

    public void checkPermission(Permission permission) {
        if (!hasPermission(permission)) {
            throw new ForbiddenException();
        }
    }

    public VisualizationPerimeter getVisualizationPerimeter() {
        return this.loadIfNecessary()
                   .map(UserInformation::getVisualizationPerimeter)
                   .orElse(VisualizationPerimeter.empty());
    }

    private Optional<UserInformation> loadIfNecessary() {
        Principal principal = request.getUserPrincipal();
        if (principal == null || principal.getName() == null) {
            return Optional.empty();
        }
        if (!this.initialized) {
            this.userInformation = userDao.findByName(principal.getName())
                                          .map(UserInformation::new)
                                          .orElse(null);
            this.initialized = true;
        }
        return this.userInformation == null ? Optional.empty() : Optional.of(this.userInformation);
    }

    private static final class UserInformation {
        private final Long id;
        private final Long accessionHolderId;
        private final Set<Permission> permissions;
        private final VisualizationPerimeter visualizationPerimeter;

        public UserInformation(User user) {
            this.id = user.getId();
            this.accessionHolderId = user.getAccessionHolder() == null ? null : user.getAccessionHolder().getId();
            this.permissions = user.getPermissions()
                                   .stream()
                                   .map(UserPermission::getPermission)
                                   .collect(Collectors.toUnmodifiableSet());
            this.visualizationPerimeter =
                user.isGlobalVisualization()
                    ? VisualizationPerimeter.global()
                    : VisualizationPerimeter.constrained(
                        user.getVisualizationGrcs()
                                           .stream()
                                           .map(Grc::getId)
                                           .collect(Collectors.toSet()));
        }

        public Long getId() {
            return id;
        }

        public Long getAccessionHolderId() {
            return accessionHolderId;
        }

        public Set<Permission> getPermissions() {
            return permissions;
        }

        public VisualizationPerimeter getVisualizationPerimeter() {
            return visualizationPerimeter;
        }
    }
}
