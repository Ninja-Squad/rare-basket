package fr.inra.urgi.rarebasket.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.validation.constraints.NotNull;

/**
 * A permission of a user
 * @author JB Nizet
 */
@Entity
public class UserPermission {

    @Id
    @SequenceGenerator(name = "USER_PERMISSION_GENERATOR", sequenceName = "user_permission_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "USER_PERMISSION_GENERATOR")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    private User user;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Permission permission;

    public UserPermission() {
    }

    public UserPermission(Long id) {
        this.id = id;
    }

    public UserPermission(Permission permission) {
        this.permission = permission;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }
}
