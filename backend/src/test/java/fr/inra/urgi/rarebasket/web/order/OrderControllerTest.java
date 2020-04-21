package fr.inra.urgi.rarebasket.web.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.storage.DocumentStorage;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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

    @MockBean
    private DocumentStorage mockDocumentStorage;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Order order;
    private Document document;
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
        order.addItem(new OrderItem(421L, new Accession("rosa", "rosa1"), 10, "bags"));
        order.addItem(new OrderItem(422L, new Accession("violetta", "violetta1"), null, null));
        order.setAccessionHolder(new AccessionHolder(accessionHolderId));

        document = new Document(54L);
        document.setType(DocumentType.INVOICE);
        document.setContentType(MediaType.APPLICATION_PDF_VALUE);
        document.setOriginalFileName("invoice54.pdf");
        document.setDescription("desc");
        order.addDocument(document);

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
               .andExpect(jsonPath("$.content[0].basket.customer.name").value(order.getBasket()
                                                                                   .getCustomer()
                                                                                   .getName()))
               .andExpect(jsonPath("$.content[0].basket.customer.email").value(order.getBasket()
                                                                                    .getCustomer()
                                                                                    .getEmail()))
               .andExpect(jsonPath("$.content[0].basket.customer.address").value(order.getBasket()
                                                                                      .getCustomer()
                                                                                      .getAddress()))
               .andExpect(jsonPath("$.content[0].basket.customer.type").value(order.getBasket()
                                                                                   .getCustomer()
                                                                                   .getType()
                                                                                   .name()))
               .andExpect(jsonPath("$.content[0].basket.confirmationInstant").value(order.getBasket()
                                                                                         .getConfirmationInstant()
                                                                                         .toString()))
               .andExpect(jsonPath("$.content[0].items.length()").value(2))
               .andExpect(jsonPath("$.content[0].items[0].id").value(421L))
               .andExpect(jsonPath("$.content[0].items[0].accession.name").value("rosa"))
               .andExpect(jsonPath("$.content[0].items[0].accession.identifier").value("rosa1"))
               .andExpect(jsonPath("$.content[0].items[0].quantity").value(10))
               .andExpect(jsonPath("$.content[0].items[0].unit").value("bags"))
               .andExpect(jsonPath("$.content[0].items[1].quantity").isEmpty())
               .andExpect(jsonPath("$.content[0].items[1].unit").isEmpty());

        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldListByStatus() throws Exception {
        Pageable pageable = PageRequest.of(1, OrderController.PAGE_SIZE);
        when(mockOrderDao.pageByAccessionHolderAndStatuses(accessionHolderId,
                                                           EnumSet.of(OrderStatus.CANCELLED, OrderStatus.FINALIZED),
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
               .andExpect(jsonPath("$.id").value(order.getId()))
               .andExpect(jsonPath("$.documents.length()").value(1))
               .andExpect(jsonPath("$.documents[0].id").value(document.getId()))
               .andExpect(jsonPath("$.documents[0].type").value(document.getType().name()))
               .andExpect(jsonPath("$.documents[0].description").value(document.getDescription()))
               .andExpect(jsonPath("$.documents[0].contentType").value(document.getContentType()))
               .andExpect(jsonPath("$.documents[0].originalFileName").value(document.getOriginalFileName()))
               .andExpect(jsonPath("$.documents[0].creationInstant").value(document.getCreationInstant().toString()));
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldUpdate() throws Exception {
        OrderItemCommandDTO newItem = new OrderItemCommandDTO(new Accession("bacteria", "bacteria1"), 34, "seeds");
        OrderCommandDTO command = new OrderCommandDTO(
            Set.of(newItem)
        );
        mockMvc.perform(put("/api/orders/{id}", order.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(order.getItems()).extracting(OrderItem::getAccession, OrderItem::getQuantity, OrderItem::getUnit, OrderItem::getOrder)
                                    .containsOnly(tuple(newItem.getAccession(), newItem.getQuantity(), newItem.getUnit(), order));
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenUpdatingNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        OrderCommandDTO command = new OrderCommandDTO(
            Set.of(new OrderItemCommandDTO(new Accession("rosa", "rosa1"), 34, null))
        );
        mockMvc.perform(put("/api/orders/{id}", order.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldCancel() throws Exception {
        mockMvc.perform(delete("/api/orders/{id}", order.getId()))
               .andExpect(status().isNoContent());

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenCancelingNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        mockMvc.perform(delete("/api/orders/{id}", order.getId()))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAddDocument() throws Exception {
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.INVOICE, "desc");

        doAnswer(invocation -> {
            order.getDocuments()
                 .stream()
                 .filter(document -> document.getId() == null)
                 .forEach(document -> document.setId(321L));
            return null;
        }).when(mockOrderDao).flush();

        mockMvc.perform(multipart("/api/orders/{orderId}/documents", order.getId())
                            .file(new MockMultipartFile("file",
                                                        "foo.txt",
                                                        MediaType.TEXT_PLAIN_VALUE,
                                                        "hello".getBytes()))
                            .file(new MockMultipartFile("document",
                                                        null,
                                                        MediaType.APPLICATION_JSON_VALUE,
                                                        objectMapper.writeValueAsBytes(command))))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(321L))
               .andExpect(jsonPath("$.type").value(command.getType().name()))
               .andExpect(jsonPath("$.description").value(command.getDescription()))
               .andExpect(jsonPath("$.contentType").value(MediaType.TEXT_PLAIN_VALUE))
               .andExpect(jsonPath("$.originalFileName").value("foo.txt"))
               .andExpect(jsonPath("$.creationInstant").isString());

        assertThat(order.getDocuments()).hasSize(2);
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenAddingDocumentToNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.INVOICE, "desc");

        mockMvc.perform(multipart("/api/orders/{orderId}/documents", order.getId())
                            .file(new MockMultipartFile("file",
                                                        "foo.txt",
                                                        MediaType.TEXT_PLAIN_VALUE,
                                                        "hello".getBytes()))
                            .file(new MockMultipartFile("document",
                                                        null,
                                                        MediaType.APPLICATION_JSON_VALUE,
                                                        objectMapper.writeValueAsBytes(command))))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDeleteDocument() throws Exception {
        mockMvc.perform(delete("/api/orders/{id}/documents/{documentId}", order.getId(), document.getId()))
               .andExpect(status().isNoContent());

        assertThat(order.getDocuments()).isEmpty();
        verify(mockDocumentStorage).delete(document.getId(), document.getOriginalFileName());
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenDeletingDocumentOfNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        mockMvc.perform(delete("/api/orders/{id}/documents/{documentId}", order.getId(), document.getId()))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowWhenDeletingUnexistingDocument() throws Exception {
        mockMvc.perform(delete("/api/orders/{id}/documents/{documentId}", order.getId(), 98765L))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldDownloadFile() throws Exception {
        when(mockDocumentStorage.documentSize(document.getId(), document.getOriginalFileName())).thenReturn(5L);
        when(mockDocumentStorage.documentInputStream(document.getId(), document.getOriginalFileName())).thenReturn(
            new ByteArrayInputStream("hello".getBytes())
        );

        mockMvc.perform(get("/api/orders/{id}/documents/{document}/file", order.getId(), document.getId()))
               .andExpect(status().isOk())
               .andExpect(header().longValue(HttpHeaders.CONTENT_LENGTH, 5L))
               .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice54.pdf\""))
               .andExpect(content().string("hello"));
    }
}
