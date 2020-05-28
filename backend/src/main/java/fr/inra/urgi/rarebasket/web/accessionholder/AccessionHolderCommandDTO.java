package fr.inra.urgi.rarebasket.web.accessionholder;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command sent to create/update an accession holder
 */
public class AccessionHolderCommandDTO {
    private final String name;
    private final String email;
    private final String phone;
    private final Long grcId;

    @JsonCreator
    public AccessionHolderCommandDTO(
            @JsonProperty("name") String name,
            @JsonProperty("email") String email,
            @JsonProperty("phone") String phone,
            @JsonProperty("grcId") Long grcId
    ) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.grcId = grcId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Long getGrcId() {
        return grcId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AccessionHolderCommandDTO that = (AccessionHolderCommandDTO) o;
        return Objects.equals(name, that.name) &&
                Objects.equals(email, that.email) &&
                Objects.equals(phone, that.phone) &&
                Objects.equals(grcId, that.grcId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, email, phone, grcId);
    }

    @Override
    public String toString() {
        return "AccessionHolderCommandDTO{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", grcId=" + grcId +
                '}';
    }
}
