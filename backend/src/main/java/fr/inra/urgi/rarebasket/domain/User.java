package fr.inra.urgi.rarebasket.domain;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

/**
 * A user of the application, that can be linked to an accession holder and have permissions.
 * @author JB Nizet
 */
@Entity
@Table(name = "app_user")
public class User {
    @Id
    @SequenceGenerator(name = "USER_GENERATOR", sequenceName = "app_user_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "USER_GENERATOR")
    private Long id;

    /**
     * The name of the user, identifying it in Keycloak (i.e. equal to the User Name field, AKA preferred_username
     * in the JSON user data returned by Keycloak)
     */
    @NotBlank
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPermission> permissions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private AccessionHolder accessionHolder;

    public User() {
    }

    public User(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<UserPermission> getPermissions() {
        return Collections.unmodifiableSet(permissions);
    }

    public void addPermission(UserPermission userPermission) {
        userPermission.setUser(this);
        this.permissions.add(userPermission);
    }

    public void setPermissions(Set<UserPermission> permissions) {
        this.permissions = permissions;
    }

    public AccessionHolder getAccessionHolder() {
        return accessionHolder;
    }

    public void setAccessionHolder(AccessionHolder accessionHolder) {
        this.accessionHolder = accessionHolder;
    }
}
