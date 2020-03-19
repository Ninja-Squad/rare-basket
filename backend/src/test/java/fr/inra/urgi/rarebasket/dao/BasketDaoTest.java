package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.domain.Basket;
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
        Operation baskets =
            insertInto("basket")
                .columns("id", "reference", "status", "creation_instant")
                .values(1L, "abcdef", BasketStatus.DRAFT, Instant.parse("2020-03-19T09:00:00Z"))
                .build();

        executeIfNecessary(baskets);
    }

    @Test
    void shouldFindById() {
        Basket basket = basketDao.findById(1L).get();
        assertThat(basket.getReference()).isEqualTo("abcdef");
        assertThat(basket.getStatus()).isEqualTo(BasketStatus.DRAFT);
        assertThat(basket.getCreationInstant()).isEqualTo(Instant.parse("2020-03-19T09:00:00Z"));
    }
}
