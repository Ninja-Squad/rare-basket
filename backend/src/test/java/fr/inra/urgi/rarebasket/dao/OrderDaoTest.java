package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.generator.ValueGenerators;
import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

/**
 * Tests for {@link OrderDao}
 * @author JB Nizet
 */
class OrderDaoTest extends BaseDaoTest {
    @Autowired
    private OrderDao dao;

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
                .withDefaultValue("status", BasketStatus.CONFIRMED)
                .withDefaultValue("creation_instant", Instant.parse("2020-03-19T09:00:00Z"))
                .withGeneratedValue("reference", ValueGenerators.stringSequence("A"))
                .withGeneratedValue("confirmation_instant", ValueGenerators.dateSequence().startingAt(LocalDate.of(2020, 3, 20)))
                .columns("id")
                .values(1L)
                .values(2L)
                .values(3L)
                .build();

        Operation orders =
            insertInto("accession_order")
                .withDefaultValue("accession_holder_id", 1L)
                .columns("id", "basket_id", "status")
                .values(3L, 3L, OrderStatus.DRAFT)
                .values(2L, 2L, OrderStatus.CANCELLED)
                .values(1L, 1L, OrderStatus.FINALIZED)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders, baskets, orders));
    }

    @Test
    void shouldPageAll() {
        skipNextLaunch();
        PageRequest pageRequest = PageRequest.of(0, 2);
        Page<Order> result = dao.pageAll(pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(3L, 2L);
    }

    @Test
    void shouldPageByStatuses() {
        skipNextLaunch();
        PageRequest pageRequest = PageRequest.of(0, 2);
        Page<Order> result = dao.pageByStatuses(EnumSet.of(OrderStatus.CANCELLED, OrderStatus.FINALIZED), pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(2L, 1L);

        result = dao.pageByStatuses(EnumSet.of(OrderStatus.DRAFT), pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(3L);
    }
}
