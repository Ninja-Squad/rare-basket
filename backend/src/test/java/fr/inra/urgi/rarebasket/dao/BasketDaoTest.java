package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Test for {@link BasketDao}
 * @author JB Nizet
 */
class BasketDaoTest extends BaseDaoTest {
    @Autowired
    private BasketDao basketDao;

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

        Operation baskets =
            insertInto("basket")
                .columns("id", "reference", "status", "creation_instant")
                .values(1L, "abcdef", BasketStatus.DRAFT, Instant.parse("2020-03-19T09:00:00Z"))
                .build();

        Operation basketItems =
            insertInto("basket_item")
                .columns("id", "accession_name", "accession_identifier", "basket_id", "accession_holder_id")
                .values(1L, "rosa", "rosa1", 1L, 1L)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders, baskets, basketItems));
    }

    @Test
    void shouldFindByReference() {
        skipNextLaunch();
        assertThat(basketDao.findByReference("abcdef")).isNotEmpty();
        assertThat(basketDao.findByReference("notExisting")).isEmpty();
    }

    @Test
    void shouldHandleImmutableAccessionFine() {
        skipNextLaunch();
        Basket basket = basketDao.findById(1L).get();
        BasketItem item = basket.getItems().iterator().next();

        assertThat(item.getAccession()).isEqualTo(new Accession("rosa", "rosa1"));
    }
}
