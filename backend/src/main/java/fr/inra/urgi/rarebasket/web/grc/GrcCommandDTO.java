package fr.inra.urgi.rarebasket.web.grc;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command sent to create/update a GRC
 */
public class GrcCommandDTO {
    private final String name;
    private final String institution;
    private final String address;

    @JsonCreator
    public GrcCommandDTO(
            @JsonProperty("name") String name,
            @JsonProperty("institution") String institution,
            @JsonProperty("address") String address
    ) {
        this.name = name;
        this.institution = institution;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public String getInstitution() {
        return institution;
    }

    public String getAddress() {
        return address;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GrcCommandDTO that = (GrcCommandDTO) o;
        return Objects.equals(name, that.name) &&
                Objects.equals(institution, that.institution) &&
                Objects.equals(address, that.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, institution, address);
    }

    @Override
    public String toString() {
        return "GrcCommandDTO{" +
                "name='" + name + '\'' +
                ", institution='" + institution + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
