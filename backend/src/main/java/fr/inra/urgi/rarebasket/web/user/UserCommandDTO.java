package fr.inra.urgi.rarebasket.web.user;

import java.util.Objects;
import java.util.Set;
import jakarta.validation.constraints.NotBlank;

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

    private final Set<Long> accessionHolderIds;
    private final boolean globalVisualization;
    private final Set<Long> visualizationGrcIds;

    @JsonCreator
    public UserCommandDTO(@JsonProperty("name") String name,
                          @JsonProperty("permissions") Set<Permission> permissions,
                          @JsonProperty("accessionHolderIds") Set<Long> accessionHolderIds,
                          @JsonProperty("globalVisualization") boolean globalVisualization,
                          @JsonProperty("visualizationGrcIds") Set<Long> visualizationGrcIds) {
        this.name = name;
        this.permissions = permissions;
        this.accessionHolderIds = accessionHolderIds;
        this.globalVisualization = globalVisualization;
        this.visualizationGrcIds = visualizationGrcIds;
    }

    public String getName() {
        return name;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public Set<Long> getAccessionHolderIds() {
        return accessionHolderIds;
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
            Objects.equals(accessionHolderIds, that.accessionHolderIds) &&
            Objects.equals(visualizationGrcIds, that.visualizationGrcIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, permissions, accessionHolderIds, globalVisualization, visualizationGrcIds);
    }

    @Override
    public String toString() {
        return "UserCommandDTO{" +
            "name='" + name + '\'' +
            ", permissions=" + permissions +
            ", accessionHolderIds=" + accessionHolderIds +
            ", globalVisualization=" + globalVisualization +
            ", visualizationGrcIds=" + visualizationGrcIds +
            '}';
    }
}
