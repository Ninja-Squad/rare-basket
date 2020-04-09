package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.DocumentType;

/**
 * JSON command sent as a multipart part along with the file, and containing the metadata of the document
 * @author JB Nizet
 */
public final class DocumentCommandDTO {
    @NotNull
    private final DocumentType type;
    private final String description;

    @JsonCreator
    public DocumentCommandDTO(@JsonProperty("type") DocumentType type,
                              @JsonProperty("description") String description) {
        this.type = type;
        this.description = description;
    }

    public DocumentType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DocumentCommandDTO)) {
            return false;
        }
        DocumentCommandDTO that = (DocumentCommandDTO) o;
        return type == that.type &&
            Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, description);
    }

    @Override
    public String toString() {
        return "DocumentCommandDTO{" +
            "type=" + type +
            ", description='" + description + '\'' +
            '}';
    }
}
