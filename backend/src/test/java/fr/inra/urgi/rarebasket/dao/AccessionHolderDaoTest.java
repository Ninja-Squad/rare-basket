package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Test for {@link AccessionHolderDao}
 * @author JB Nizet
 */
class AccessionHolderDaoTest extends BaseDaoTest {
    @Autowired
    private AccessionHolderDao accessionHolderDao;

    @BeforeEach
    void prepare() {
        Long grc1Id = 1L;
        Operation grcs =
            insertInto("grc")
                .columns("id", "name", "institution", "address")
                .values(grc1Id, "GRC1", "INRAE", "address")
                .build();

        Operation accessionHolders =
            insertInto("accession_holder")
                .columns("id", "email", "name", "phone", "grc_id")
                .values(1L, "orders@grc1.com", "GRC1 Orders", "0123456789", grc1Id)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders));
    }

    @Test
    void shouldFindByEmail() {
        skipNextLaunch();
        assertThat(accessionHolderDao.findByEmail("unexisting@mail.com")).isEmpty();
        assertThat(accessionHolderDao.findByEmail("orders@grc1.com")).isNotEmpty();
    }

    @Test
    void shouldFindByName() {
        skipNextLaunch();
        assertThat(accessionHolderDao.findByName("GRC1 Orders")).isNotEmpty();
        assertThat(accessionHolderDao.findByName("Not existing")).isEmpty();
    }

    @Test
    void shouldList() {
        skipNextLaunch();
        assertThat(accessionHolderDao.list()).hasSize(1);
    }
}
