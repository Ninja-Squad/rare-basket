package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

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
                .columns("id", "reference", "email", "status")
                .values(1L, "abcdef", "john@mail.com", BasketStatus.DRAFT)
                .build();

        executeIfNecessary(baskets);
    }

    @Test
    void shouldFindById() {
        Basket basket = basketDao.findById(1L).get();
        assertThat(basket.getReference()).isEqualTo("abcdef");
        assertThat(basket.getEmail()).isEqualTo("john@mail.com");
        assertThat(basket.getStatus()).isEqualTo(BasketStatus.DRAFT);
    }
}
