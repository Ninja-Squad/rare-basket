package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.generator.ValueGenerators;
import com.ninja_squad.dbsetup.operation.Operation;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import fr.inra.urgi.rarebasket.web.order.CustomerTypeStatisticsDTO;
import fr.inra.urgi.rarebasket.web.order.OrderStatusStatisticsDTO;
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
                .columns("id", "name", "institution", "address")
                .values(1L, "GRC1", "INRAE", "address")
                .build();

        Operation accessionHolders =
            insertInto("accession_holder")
                .columns("id", "email", "name", "phone", "grc_id")
                .values(1L, "orders@grc1.com", "GRC1 Orders", "0123456789", 1L)
                .build();

        Operation baskets =
            insertInto("basket")
                .withDefaultValue("status", BasketStatus.CONFIRMED)
                .withDefaultValue("creation_instant", Instant.parse("2020-03-19T09:00:00Z"))
                .withGeneratedValue("reference", ValueGenerators.stringSequence("A"))
                .withGeneratedValue("confirmation_instant",
                                    ValueGenerators.dateSequence().startingAt(LocalDate.of(2020, 3, 20)))
                .columns("id", "customer_type")
                .values(1L, CustomerType.FARMER)
                .values(2L, CustomerType.CITIZEN)
                .values(3L, CustomerType.INRAE_RESEARCHER)
                .build();

        Operation orders =
            insertInto("accession_order")
                .withDefaultValue("accession_holder_id", 1L)
                .columns("id", "basket_id", "status", "closing_instant")
                .values(3L, 3L, OrderStatus.DRAFT, null)
                .values(2L, 2L, OrderStatus.CANCELLED, Instant.parse("2020-03-20T10:00:00Z"))
                .values(1L, 1L, OrderStatus.FINALIZED, Instant.parse("2020-03-20T11:00:00Z"))
                .build();

        Operation orderItems =
            insertInto("accession_order_item")
                .columns("id", "order_id", "accession_name", "accession_identifier", "quantity", "unit")
                .values(11L, 1L, "rosa", "rosa1", 12, "bags")
                .values(12L, 1L, "rosa", "rosa2", 10, "bags")
                .values(21L, 2L, "violetta", "violetta1", 10, null)
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders, baskets, orders, orderItems));
    }

    @Test
    void shouldPageByAccessionHolder() {
        skipNextLaunch();
        PageRequest pageRequest = PageRequest.of(0, 2);
        Page<Order> result = dao.pageByAccessionHolder(1L, pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(3L, 2L);

        pageRequest = PageRequest.of(1, 20);
        result = dao.pageByAccessionHolder(98765L, pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(0);
    }

    @Test
    void shouldPageByAccessionHolderAndStatuses() {
        skipNextLaunch();
        PageRequest pageRequest = PageRequest.of(0, 2);
        Page<Order> result = dao.pageByAccessionHolderAndStatuses(1L,
                                                                  EnumSet.of(OrderStatus.CANCELLED,
                                                                             OrderStatus.FINALIZED),
                                                                  pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(2L, 1L);

        result = dao.pageByAccessionHolderAndStatuses(1L, EnumSet.of(OrderStatus.DRAFT), pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(3L);

        pageRequest = PageRequest.of(1, 20);
        result = dao.pageByAccessionHolderAndStatuses(98765L, EnumSet.of(OrderStatus.DRAFT), pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(0);
    }

    @Test
    void shouldReportBetween() {
        skipNextLaunch();

        // too soon
        assertThat(dao.reportBetween(Instant.parse("2020-03-19T00:00:00Z"),
                                     Instant.parse("2020-03-20T00:00:00Z"))).isEmpty();
        // too late
        assertThat(dao.reportBetween(Instant.parse("2020-03-21T00:00:00Z"),
                                     Instant.parse("2020-03-22T00:00:00Z"))).isEmpty();
        // ok
        assertThat(dao.reportBetween(Instant.parse("2020-03-20T00:00:00Z"),
                                     Instant.parse("2020-03-21T00:00:00Z"))).hasSize(3);
    }

    @Test
    void shouldReportBetweenWithGrcs() {
        skipNextLaunch();

        // too soon
        assertThat(dao.reportBetween(Instant.parse("2020-03-19T00:00:00Z"),
                                     Instant.parse("2020-03-20T00:00:00Z"),
                                     Set.of(1L, 2L))).isEmpty();
        // too late
        assertThat(dao.reportBetween(Instant.parse("2020-03-21T00:00:00Z"),
                                     Instant.parse("2020-03-22T00:00:00Z"),
                                     Set.of(1L, 2L))).isEmpty();
        // ok
        assertThat(dao.reportBetween(Instant.parse("2020-03-20T00:00:00Z"),
                                     Instant.parse("2020-03-21T00:00:00Z"),
                                     Set.of(1L, 2L))).hasSize(3);
        // wrong GRCs
        assertThat(dao.reportBetween(Instant.parse("2020-03-20T00:00:00Z"),
                                     Instant.parse("2020-03-21T00:00:00Z"),
                                     Set.of(2L))).isEmpty();
    }

    @Test
    void shouldFindCustomerTypeStatistics() {
        skipNextLaunch();

        // ok
        List<CustomerTypeStatisticsDTO> result = dao.findCustomerTypeStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                                                                Instant.parse("2021-01-01T00:00:00Z"),
                                                                                VisualizationPerimeter.global());
        checkCustomerTypeStatistics(result, Set.of(new CustomerTypeStatisticsDTO(CustomerType.FARMER, 2L)));

        // ok
        result = dao.findCustomerTypeStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                                Instant.parse("2021-01-01T00:00:00Z"),
                                                VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        checkCustomerTypeStatistics(result, Set.of(new CustomerTypeStatisticsDTO(CustomerType.FARMER, 2L)));

        // too soon
        result = dao.findCustomerTypeStatistics(Instant.parse("2019-01-01T00:00:00Z"),
                                                Instant.parse("2020-01-01T00:00:00Z"),
                                                VisualizationPerimeter.global());
        checkCustomerTypeStatistics(result, Set.of());

        // too late
        result = dao.findCustomerTypeStatistics(Instant.parse("2021-01-01T00:00:00Z"),
                                                Instant.parse("2022-01-01T00:00:00Z"),
                                                VisualizationPerimeter.global());
        checkCustomerTypeStatistics(result, Set.of());

        // wrong perimeter
        result = dao.findCustomerTypeStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                                Instant.parse("2021-01-01T00:00:00Z"),
                                                VisualizationPerimeter.constrained(Set.of(2L)));
        checkCustomerTypeStatistics(result, Set.of());
    }

    @Test
    void shouldFindOrderStatusStatistics() {
        skipNextLaunch();
        // ok
        List<OrderStatusStatisticsDTO> result = dao.findOrderStatusStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                                                              Instant.parse("2021-01-01T00:00:00Z"),
                                                                              VisualizationPerimeter.global());
        assertThat(result).containsOnly(
            new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 1L),
            new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 1L),
            new OrderStatusStatisticsDTO(OrderStatus.CANCELLED, 1L)
        );

        result = dao.findOrderStatusStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                               Instant.parse("2021-01-01T00:00:00Z"),
                                               VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        assertThat(result).containsOnly(
            new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 1L),
            new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 1L),
            new OrderStatusStatisticsDTO(OrderStatus.CANCELLED, 1L)
        );

        Set<OrderStatusStatisticsDTO> allZeroes = Set.of(
            new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 0L),
            new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 0L),
            new OrderStatusStatisticsDTO(OrderStatus.CANCELLED, 0L)
        );

        // too soon
        result = dao.findOrderStatusStatistics(Instant.parse("2019-01-01T00:00:00Z"),
                                               Instant.parse("2020-01-01T00:00:00Z"),
                                               VisualizationPerimeter.global());
        assertThat(result).containsOnlyElementsOf(allZeroes);

        // too late
        result = dao.findOrderStatusStatistics(Instant.parse("2021-01-01T00:00:00Z"),
                                               Instant.parse("2022-01-01T00:00:00Z"),
                                               VisualizationPerimeter.global());
        assertThat(result).containsOnlyElementsOf(allZeroes);

        // wrong perimeter
        result = dao.findOrderStatusStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                               Instant.parse("2021-01-01T00:00:00Z"),
                                               VisualizationPerimeter.constrained(Set.of(2L)));
        assertThat(result).containsOnlyElementsOf(allZeroes);
    }

    private void checkCustomerTypeStatistics(List<CustomerTypeStatisticsDTO> actual,
                                             Set<CustomerTypeStatisticsDTO> expectedNonZeroStats) {
        assertThat(actual).hasSize(CustomerType.values().length);
        assertThat(actual).containsAll(expectedNonZeroStats);

        Set<CustomerType> nonZeroCustomerTypes =
            expectedNonZeroStats.stream()
                                .map(CustomerTypeStatisticsDTO::getCustomerType)
                                .collect(Collectors.toSet());
        for (CustomerType customerType : CustomerType.values()) {
            if (!nonZeroCustomerTypes.contains(customerType)) {
                assertThat(actual).contains(new CustomerTypeStatisticsDTO(customerType, 0L));
            }
        }
    }
}
