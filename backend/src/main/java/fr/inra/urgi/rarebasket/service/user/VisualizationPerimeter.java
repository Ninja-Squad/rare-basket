package fr.inra.urgi.rarebasket.service.user;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;

/**
 * An order visualization perimeter
 * @author JB Nizet
 */
public final class VisualizationPerimeter {

    private static final VisualizationPerimeter GLOBAL = new VisualizationPerimeter(true, Collections.emptySet());
    private static final VisualizationPerimeter EMPTY = new VisualizationPerimeter(false, Collections.emptySet());

    private final boolean globalVisualization;
    private final Set<Long> grcIds;

    private VisualizationPerimeter(boolean globalVisualization, Set<Long> grcIds) {
        this.globalVisualization = globalVisualization;
        this.grcIds = grcIds;
    }

    public static VisualizationPerimeter global() {
        return GLOBAL;
    }

    public static VisualizationPerimeter constrained(Set<Long> grcIds) {
        return new VisualizationPerimeter(false, Set.copyOf(grcIds));
    }

    public static VisualizationPerimeter empty() {
        return EMPTY;
    }

    public boolean isGlobal() {
        return globalVisualization;
    }

    public boolean isConstrained() {
        return !globalVisualization;
    }

    public Set<Long> getGrcIds() {
        return grcIds;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VisualizationPerimeter)) {
            return false;
        }
        VisualizationPerimeter that = (VisualizationPerimeter) o;
        return globalVisualization == that.globalVisualization &&
            Objects.equals(grcIds, that.grcIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(globalVisualization, grcIds);
    }

    @Override
    public String toString() {
        return "VisualizationPerimeter{" +
            "global=" + globalVisualization +
            ", grcIds=" + grcIds +
            '}';
    }
}
