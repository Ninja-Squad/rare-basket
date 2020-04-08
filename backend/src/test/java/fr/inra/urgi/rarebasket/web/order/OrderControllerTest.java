package fr.inra.urgi.rarebasket.web.order;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for {@link OrderController}
 * @author JB Nizet
 */
@WebMvcTest(OrderController.class)
@ActiveProfiles("test")
@WithMockUser
class OrderControllerTest {
    @MockBean
    private OrderDao mockOrderDao;

    @MockBean
    private CurrentUser mockCurrentUser;

    @Autowired
    private MockMvc mockMvc;

    private Order order;
    private final Long accessionHolderId = 65L;

    @BeforeEach
    void prepare() {
        Basket basket = new Basket(34L);
        basket.setReference("ref");
        basket.setCustomer(
            new Customer("jb", "jb@mail.com", "Saint Just", CustomerType.FARMER, SupportedLanguage.FRENCH)
        );
        basket.setRationale("why not?");
        basket.setConfirmationInstant(Instant.parse("2020-04-02T10:43:00Z"));

        order = new Order(42L);
        order.setBasket(basket);
        order.setStatus(OrderStatus.DRAFT);
        order.addItem(new OrderItem(421L, new Accession("rosa", "rosa1"), 10));
        order.addItem(new OrderItem(422L, new Accession("violetta", "violetta1"), null));
        order.setAccessionHolder(new AccessionHolder(accessionHolderId));

        when(mockCurrentUser.getAccessionHolderId()).thenReturn(Optional.of(accessionHolderId));
        when(mockOrderDao.findById(order.getId())).thenReturn(Optional.of(order));
    }

    @Test
    void shouldList() throws Exception {
        Pageable pageable = PageRequest.of(0, OrderController.PAGE_SIZE);
        when(mockOrderDao.pageByAccessionHolder(accessionHolderId, pageable)).thenReturn(
            new PageImpl<>(List.of(order), pageable, 1)
        );

        mockMvc.perform(get("/api/orders"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.totalElements").value(1))
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.size").value(OrderController.PAGE_SIZE))
               .andExpect(jsonPath("$.totalPages").value(1))
               .andExpect(jsonPath("$.content.length()").value(1))
               .andExpect(jsonPath("$.content[0].id").value(order.getId()))
               .andExpect(jsonPath("$.content[0].status").value(order.getStatus().name()))
               .andExpect(jsonPath("$.content[0].basket.reference").value(order.getBasket().getReference()))
               .andExpect(jsonPath("$.content[0].basket.rationale").value(order.getBasket().getRationale()))
               .andExpect(jsonPath("$.content[0].basket.customer.name").value(order.getBasket().getCustomer().getName()))
               .andExpect(jsonPath("$.content[0].basket.customer.email").value(order.getBasket().getCustomer().getEmail()))
               .andExpect(jsonPath("$.content[0].basket.customer.address").value(order.getBasket().getCustomer().getAddress()))
               .andExpect(jsonPath("$.content[0].basket.customer.type").value(order.getBasket().getCustomer().getType().name()))
               .andExpect(jsonPath("$.content[0].basket.confirmationInstant").value(order.getBasket().getConfirmationInstant().toString()))
               .andExpect(jsonPath("$.content[0].items.length()").value(2))
               .andExpect(jsonPath("$.content[0].items[0].id").value(421L))
               .andExpect(jsonPath("$.content[0].items[0].accession.name").value("rosa"))
               .andExpect(jsonPath("$.content[0].items[0].accession.identifier").value("rosa1"))
               .andExpect(jsonPath("$.content[0].items[0].quantity").value(10))
               .andExpect(jsonPath("$.content[0].items[1].quantity").isEmpty());

        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldListByStatus() throws Exception {
        Pageable pageable = PageRequest.of(1, OrderController.PAGE_SIZE);
        when(mockOrderDao.pageByAccessionHolderAndStatuses(accessionHolderId, EnumSet.of(OrderStatus.CANCELLED, OrderStatus.FINALIZED),
                                         pageable)).thenReturn(
            new PageImpl<>(List.of(order), pageable, OrderController.PAGE_SIZE + 1)
        );

        mockMvc.perform(get("/api/orders")
                            .param("page", "1")
                            .param("status", OrderStatus.CANCELLED.name(), OrderStatus.FINALIZED.name()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.totalElements").value(OrderController.PAGE_SIZE + 1))
               .andExpect(jsonPath("$.number").value(1))
               .andExpect(jsonPath("$.size").value(OrderController.PAGE_SIZE))
               .andExpect(jsonPath("$.totalPages").value(2))
               .andExpect(jsonPath("$.content.length()").value(1))
               .andExpect(jsonPath("$.content[0].id").value(order.getId()));

        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldGet() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", order.getId()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(order.getId()));

        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }
}
