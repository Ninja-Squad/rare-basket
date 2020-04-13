package fr.inra.urgi.rarebasket.web.user;

import java.util.Objects;
import java.util.Set;
import javax.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.Permission;

/**
 * Command sent to create/update a user
 * @author JB Nizet
 */
public final class UserCommandDTO {
    @NotBlank
    private final String name;

    private final Set<Permission> permissions;

    private final Long accessionHolderId;

    @JsonCreator
    public UserCommandDTO(@JsonProperty("name") String name,
                          @JsonProperty("permissions") Set<Permission> permissions,
                          @JsonProperty("accessionHolderId") Long accessionHolderId) {
        this.name = name;
        this.permissions = permissions;
        this.accessionHolderId = accessionHolderId;
    }

    public String getName() {
        return name;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public Long getAccessionHolderId() {
        return accessionHolderId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserCommandDTO)) {
            return false;
        }
        UserCommandDTO that = (UserCommandDTO) o;
        return Objects.equals(name, that.name) &&
            Objects.equals(permissions, that.permissions) &&
            Objects.equals(accessionHolderId, that.accessionHolderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, permissions, accessionHolderId);
    }

    @Override
    public String toString() {
        return "UserCommandDTO{" +
            "name='" + name + '\'' +
            ", permissions=" + permissions +
            ", accessionHolderId=" + accessionHolderId +
            '}';
    }
}
