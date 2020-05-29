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
    private final boolean globalVisualization;
    private final Set<Long> visualizationGrcIds;

    @JsonCreator
    public UserCommandDTO(@JsonProperty("name") String name,
                          @JsonProperty("permissions") Set<Permission> permissions,
                          @JsonProperty("accessionHolderId") Long accessionHolderId,
                          @JsonProperty("globalVisualization") boolean globalVisualization,
                          @JsonProperty("visualizationGrcIds") Set<Long> visualizationGrcIds) {
        this.name = name;
        this.permissions = permissions;
        this.accessionHolderId = accessionHolderId;
        this.globalVisualization = globalVisualization;
        this.visualizationGrcIds = visualizationGrcIds;
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

    public boolean isGlobalVisualization() {
        return globalVisualization;
    }

    public Set<Long> getVisualizationGrcIds() {
        return visualizationGrcIds;
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
        return globalVisualization == that.globalVisualization &&
            Objects.equals(name, that.name) &&
            Objects.equals(permissions, that.permissions) &&
            Objects.equals(accessionHolderId, that.accessionHolderId) &&
            Objects.equals(visualizationGrcIds, that.visualizationGrcIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, permissions, accessionHolderId, globalVisualization, visualizationGrcIds);
    }

    @Override
    public String toString() {
        return "UserCommandDTO{" +
            "name='" + name + '\'' +
            ", permissions=" + permissions +
            ", accessionHolderId=" + accessionHolderId +
            ", globalVisualization=" + globalVisualization +
            ", visualizationGrcIds=" + visualizationGrcIds +
            '}';
    }
}
