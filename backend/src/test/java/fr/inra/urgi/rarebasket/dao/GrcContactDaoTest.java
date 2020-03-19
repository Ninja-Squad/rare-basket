package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Test for {@link GrcContactDao}
 * @author JB Nizet
 */
class GrcContactDaoTest extends BaseDaoTest {
    @Autowired
    private GrcContactDao grcContactDao;

    @BeforeEach
    void prepare() {
        Long grc1Id = 1L;
        Operation grcs =
            insertInto("grc")
                .columns("id", "name")
                .values(grc1Id, "GRC1")
                .build();

        Operation contacts =
            insertInto("grc_contact")
                .columns("id", "email", "grc_id")
                .values(1L, "orders@grc1.com", grc1Id)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, contacts));
    }

    @Test
    void shouldFindByEmail() {
        assertThat(grcContactDao.findByEmail("unexisting@mail.com")).isEmpty();
        assertThat(grcContactDao.findByEmail("orders@grc1.com")).isNotEmpty();
    }
}
