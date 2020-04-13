package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Tests for {@link UserDao}
 * @author JB Nizet
 */
class UserDaoTest extends BaseDaoTest {
    @Autowired
    private UserDao dao;

    @BeforeEach
    void prepare() {
        Operation grcs =
            insertInto("grc")
                .columns("id", "name")
                .values(1L, "GRC1")
                .build();

        Operation accessionHolders =
            insertInto("accession_holder")
                .columns("id", "email", "name", "grc_id")
                .values(1L, "orders@grc1.com", "GRC1 Orders", 1L)
                .build();

        Operation users =
            insertInto("app_user")
                .columns("id", "name", "accession_holder_id")
                .values(1L, "JB", 1L)
                .build();

        Operation userPermissions =
            insertInto("user_permission")
                .columns("id", "user_id", "permission")
                .values(1L, 1L, Permission.ORDER_MANAGEMENT)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders, users, userPermissions));
    }

    @Test
    void shouldFindByName() {
        skipNextLaunch();
        assertThat(dao.findByName("unexisting")).isEmpty();
        Optional<User> jb = dao.findByName("JB");
        assertThat(jb).isNotEmpty();
        assertThat(jb.get().getId()).isEqualTo(1L);
    }

    @Test
    void shouldPageAll() {
        skipNextLaunch();
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> result = dao.pageAll(pageable);
        assertThat(result).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);

        pageable = PageRequest.of(1, 20);
        result = dao.pageAll(pageable);
        assertThat(result).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(1);
    }
}
