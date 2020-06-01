package fr.inra.urgi.rarebasket.dao;

import static com.ninja_squad.dbsetup.Operations.insertInto;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
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
                .columns("id", "customer_type", "customer_email", "confirmation_instant")
                .values(1L, CustomerType.FARMER, "farmer1@mail.com", Instant.parse("2020-03-15T11:00:00Z"))
                .values(2L, CustomerType.CITIZEN, "citizen1@mail.com", Instant.parse("2020-03-15T14:00:00Z"))
                .values(3L, CustomerType.INRAE_RESEARCHER, "researcher1@mail.com", Instant.parse("2020-03-16T14:00:00Z"))
                .values(4L, CustomerType.FARMER, "farmer2@mail.com", Instant.parse("2020-03-17T12:00:00Z"))
                .values(5L, CustomerType.CITIZEN, "citizen2@mail.com", Instant.parse("2020-03-17T14:00:00Z"))
                .values(6L, CustomerType.INRAE_RESEARCHER, "researcher2@mail.com", Instant.parse("2020-03-18T14:00:00Z"))
                .values(7L, CustomerType.FARMER, "farmer1@mail.com", Instant.parse("2020-03-19T14:00:00Z"))
                .build();

        Operation orders =
            insertInto("accession_order")
                .withDefaultValue("accession_holder_id", 1L)
                .columns("id", "basket_id", "status", "closing_instant")
                .values(7L, 7L, OrderStatus.FINALIZED, Instant.parse("2020-03-20T14:00:00Z"))
                .values(6L, 6L, OrderStatus.DRAFT, null)
                .values(5L, 5L, OrderStatus.CANCELLED, Instant.parse("2020-03-20T13:00:00Z"))
                .values(4L, 4L, OrderStatus.FINALIZED, Instant.parse("2020-03-20T12:00:00Z"))
                .values(3L, 3L, OrderStatus.DRAFT, null)
                .values(2L, 2L, OrderStatus.CANCELLED, Instant.parse("2020-03-20T10:00:00Z"))
                .values(1L, 1L, OrderStatus.FINALIZED, Instant.parse("2020-03-20T11:00:00Z"))
                .build();

        Operation orderItems =
            insertInto("accession_order_item")
                .withDefaultValue("accession_name", "rosa")
                .withDefaultValue("quantity", 10)
                .withDefaultValue("unit", "bags")
                .withGeneratedValue("id", ValueGenerators.sequence())
                .columns("order_id", "accession_identifier")
                .values(1L, "rosa1")
                .values(2L, "rosa1")
                .values(3L, "rosa1")
                .values(4L, "rosa1")
                .values(5L, "rosa1")
                .values(6L, "rosa1")
                .values(7L, "rosa1")
                .values(1L, "rosa2")
                .values(2L, "rosa2")
                .values(3L, "rosa2")
                .values(4L, "rosa2")
                .values(5L, "rosa2")
                .values(6L, "rosa2")
                .values(7L, "rosa2")
                .build();

        executeIfNecessary(Operations.sequenceOf(grcs, accessionHolders, baskets, orders, orderItems));
    }

    @Test
    void shouldPageByAccessionHolder() {
        skipNextLaunch();
        PageRequest pageRequest = PageRequest.of(0, 2);
        Page<Order> result = dao.pageByAccessionHolder(1L, pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(7);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(7L, 6L);

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
        assertThat(result.getTotalElements()).isEqualTo(5);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(7L, 5L);

        result = dao.pageByAccessionHolderAndStatuses(1L, EnumSet.of(OrderStatus.DRAFT), pageRequest);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(Order::getId).containsExactly(6L, 3L);

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
                                     Instant.parse("2020-03-21T00:00:00Z"))).hasSize(10);
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
                                     Set.of(1L, 2L))).hasSize(10);
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
        checkCustomerTypeStatistics(result, Set.of(new CustomerTypeStatisticsDTO(CustomerType.FARMER, 3L)));

        // ok
        result = dao.findCustomerTypeStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                                Instant.parse("2021-01-01T00:00:00Z"),
                                                VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        checkCustomerTypeStatistics(result, Set.of(new CustomerTypeStatisticsDTO(CustomerType.FARMER, 3L)));

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
            new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 3L),
            new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 2L),
            new OrderStatusStatisticsDTO(OrderStatus.CANCELLED, 2L)
        );

        result = dao.findOrderStatusStatistics(Instant.parse("2020-01-01T00:00:00Z"),
                                               Instant.parse("2021-01-01T00:00:00Z"),
                                               VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        assertThat(result).containsOnly(
            new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 3L),
            new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 2L),
            new OrderStatusStatisticsDTO(OrderStatus.CANCELLED, 2L)
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

    @Test
    void shouldCountCancelledOrders() {
        skipNextLaunch();

        // ok
        long result = dao.countCancelledOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                               Instant.parse("2021-01-01T00:00:00Z"),
                                               VisualizationPerimeter.global());
        assertThat(result).isEqualTo(2L);

        // ok
        result = dao.countCancelledOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                          Instant.parse("2021-01-01T00:00:00Z"),
                                          VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        assertThat(result).isEqualTo(2L);

        // too soon
        result = dao.countCancelledOrders(Instant.parse("2019-01-01T00:00:00Z"),
                                          Instant.parse("2020-01-01T00:00:00Z"),
                                          VisualizationPerimeter.global());
        assertThat(result).isEqualTo(0L);

        // too late
        result = dao.countCancelledOrders(Instant.parse("2021-01-01T00:00:00Z"),
                                          Instant.parse("2022-01-01T00:00:00Z"),
                                          VisualizationPerimeter.global());
        assertThat(result).isEqualTo(0L);

        // wrong perimeter
        result = dao.countCancelledOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                          Instant.parse("2021-01-01T00:00:00Z"),
                                          VisualizationPerimeter.constrained(Set.of(2L)));
        assertThat(result).isEqualTo(0L);
    }

    @Test
    void shouldCountDistinctCustomersOfFinalizedOrders() {
        skipNextLaunch();

        // ok
        long result = dao.countDistinctCustomersOfFinalizedOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                                                  Instant.parse("2021-01-01T00:00:00Z"),
                                                                  VisualizationPerimeter.global());
        assertThat(result).isEqualTo(2L);

        // ok
        result = dao.countDistinctCustomersOfFinalizedOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                                             Instant.parse("2021-01-01T00:00:00Z"),
                                                             VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        assertThat(result).isEqualTo(2L);

        // too soon
        result = dao.countDistinctCustomersOfFinalizedOrders(Instant.parse("2019-01-01T00:00:00Z"),
                                                             Instant.parse("2020-01-01T00:00:00Z"),
                                                             VisualizationPerimeter.global());
        assertThat(result).isEqualTo(0L);

        // too late
        result = dao.countDistinctCustomersOfFinalizedOrders(Instant.parse("2021-01-01T00:00:00Z"),
                                                             Instant.parse("2022-01-01T00:00:00Z"),
                                                             VisualizationPerimeter.global());
        assertThat(result).isEqualTo(0L);

        // wrong perimeter
        result = dao.countDistinctCustomersOfFinalizedOrders(Instant.parse("2020-01-01T00:00:00Z"),
                                                             Instant.parse("2021-01-01T00:00:00Z"),
                                                             VisualizationPerimeter.constrained(Set.of(2L)));
        assertThat(result).isEqualTo(0L);
    }

    @Test
    void shouldComputeAverageFinalizationDuration() {
        skipNextLaunch();

        // ok
        Duration result = dao.computeAverageFinalizationDuration(Instant.parse("2020-01-01T00:00:00Z"),
                                                                 Instant.parse("2021-01-01T00:00:00Z"),
                                                                 VisualizationPerimeter.global());
        assertThat(result).isEqualTo(Duration.ofDays(3L));

        // ok
        result = dao.computeAverageFinalizationDuration(Instant.parse("2020-01-01T00:00:00Z"),
                                                        Instant.parse("2021-01-01T00:00:00Z"),
                                                        VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        assertThat(result).isEqualTo(Duration.ofDays(3L));

        // too soon
        result = dao.computeAverageFinalizationDuration(Instant.parse("2019-01-01T00:00:00Z"),
                                                        Instant.parse("2020-01-01T00:00:00Z"),
                                                        VisualizationPerimeter.global());
        assertThat(result).isEqualTo(Duration.ZERO);

        // too late
        result = dao.computeAverageFinalizationDuration(Instant.parse("2021-01-01T00:00:00Z"),
                                                        Instant.parse("2022-01-01T00:00:00Z"),
                                                        VisualizationPerimeter.global());
        assertThat(result).isEqualTo(Duration.ZERO);

        // wrong perimeter
        result = dao.computeAverageFinalizationDuration(Instant.parse("2020-01-01T00:00:00Z"),
                                                        Instant.parse("2021-01-01T00:00:00Z"),
                                                        VisualizationPerimeter.constrained(Set.of(2L)));
        assertThat(result).isEqualTo(Duration.ZERO);
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
