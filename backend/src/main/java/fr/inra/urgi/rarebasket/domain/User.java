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
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

/**
 * A user of the application, that has permissions.
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

    /**
     * The set of permissions of the user
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPermission> permissions = new HashSet<>();

    /**
     * The accession holder for which the user manages orders, if the permission ORDER_MANAGEMENT is present
     */
    @ManyToOne(fetch = FetchType.LAZY)
    private AccessionHolder accessionHolder;

    /**
     * If true, and if the user has the permission ORDER_VISUALIZATION, then the user can visualize orders
     * of all the GRCs
     */
    private boolean globalVisualization;

    /**
     * If the user has the permission ORDER_VISUALIZATION and if {@link #globalVisualization} is false, then the user
     * can visualize orders of these GRCs
     */
    @OneToMany
    @JoinTable(
        name = "user_visualization_grc",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "grc_id")
    )
    private Set<Grc> visualizationGrcs = new HashSet<>();

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
        this.permissions.clear();
        permissions.forEach(this::addPermission);
    }

    public AccessionHolder getAccessionHolder() {
        return accessionHolder;
    }

    public void setAccessionHolder(AccessionHolder accessionHolder) {
        this.accessionHolder = accessionHolder;
    }

    public boolean isGlobalVisualization() {
        return globalVisualization;
    }

    public void setGlobalVisualization(boolean globalVisualization) {
        this.globalVisualization = globalVisualization;
    }

    public Set<Grc> getVisualizationGrcs() {
        return Collections.unmodifiableSet(visualizationGrcs);
    }

    public void setVisualizationGrcs(Set<Grc> grcs) {
        this.visualizationGrcs.clear();
        this.visualizationGrcs.addAll(grcs);
    }

    public void clearVisualizationGrcs() {
        this.visualizationGrcs.clear();
    }
}
