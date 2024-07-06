package fr.inra.urgi.rarebasket.web.order;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

/**
 * JSON command sent as a multipart part along with the file, and containing the metadata of the document
 * @author JB Nizet
 */
public final class DocumentCommandDTO {
    @NotNull
    private final DocumentType type;
    private final String description;
    private final boolean onDeliveryForm;

    @JsonCreator
    public DocumentCommandDTO(@JsonProperty("type") DocumentType type,
                              @JsonProperty("description") String description,
                              @JsonProperty("onDeliveryForm") boolean onDeliveryForm) {
        this.type = type;
        this.description = description;
        this.onDeliveryForm = onDeliveryForm;
    }

    public DocumentType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public boolean isOnDeliveryForm() {
        return onDeliveryForm;
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
        return onDeliveryForm == that.onDeliveryForm &&
            type == that.type &&
            Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, description, onDeliveryForm);
    }

    @Override
    public String toString() {
        return "DocumentCommandDTO{" +
            "type=" + type +
            ", description='" + description + '\'' +
            ", onDeliveryForm=" + onDeliveryForm +
            '}';
    }
}
