package fr.inra.urgi.rarebasket.web.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.zip.ZipFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.order.DeliveryFormGenerator;
import fr.inra.urgi.rarebasket.service.order.OrderCsvExporter;
import fr.inra.urgi.rarebasket.service.order.OrderReport;
import fr.inra.urgi.rarebasket.service.storage.DocumentStorage;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import fr.inra.urgi.rarebasket.web.basket.CustomerCommandDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.util.StreamUtils;

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

    @MockBean
    private DeliveryFormGenerator mockDeliveryFormGenerator;

    @MockBean
    private OrderCsvExporter mockOrderCsvExporter;

    @MockBean
    private AccessionHolderDao mockAccessionHolderDao;

    @MockBean
    private BasketDao mockBasketDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Captor
    private ArgumentCaptor<Order> orderCaptor;

    private Order order;
    private Document document;
    private final Long accessionHolderId = 65L;

    @BeforeEach
    void prepare() {
        Basket basket = new Basket(34L);
        basket.setReference("ref");
        basket.setCustomer(
            new Customer("jb", "org", "jb@mail.com", "Saint Just", "Saint Rambert", CustomerType.FARMER, SupportedLanguage.FRENCH)
        );
        basket.setRationale("why not?");
        basket.setConfirmationInstant(Instant.parse("2020-04-02T10:43:00Z"));

        AccessionHolder accessionHolder = new AccessionHolder(accessionHolderId);
        order = new Order(42L);
        order.setBasket(basket);
        order.setStatus(OrderStatus.DRAFT);
        order.addItem(new OrderItem(421L, new Accession("rosa", "rosa1"), 10, "bags"));
        order.addItem(new OrderItem(422L, new Accession("violetta", "violetta1"), null, null));
        order.setAccessionHolder(accessionHolder);

        document = new Document(54L);
        document.setType(DocumentType.INVOICE);
        document.setContentType(MediaType.APPLICATION_PDF_VALUE);
        document.setOriginalFileName("invoice54.pdf");
        document.setDescription("desc");
        order.addDocument(document);

        when(mockCurrentUser.getAccessionHolderIds()).thenReturn(Set.of(accessionHolderId));
        when(mockCurrentUser.getVisualizationPerimeter()).thenReturn(VisualizationPerimeter.constrained(Set.of(1L, 2L)));
        when(mockOrderDao.findById(order.getId())).thenReturn(Optional.of(order));

        when(mockAccessionHolderDao.getReferenceById(accessionHolderId)).thenReturn(accessionHolder);
    }

    @Test
    void shouldList() throws Exception {
        Pageable pageable = PageRequest.of(0, OrderController.PAGE_SIZE);
        when(mockOrderDao.pageByAccessionHolders(Set.of(accessionHolderId), pageable)).thenReturn(
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
               .andExpect(jsonPath("$.content[0].basket.customer.organization").value(order.getBasket()
                                                                                    .getCustomer()
                                                                                    .getOrganization()))
               .andExpect(jsonPath("$.content[0].basket.customer.deliveryAddress").value(order.getBasket()
                                                                                      .getCustomer()
                                                                                      .getDeliveryAddress()))
               .andExpect(jsonPath("$.content[0].basket.customer.billingAddress").value(order.getBasket()
                                                                                              .getCustomer()
                                                                                              .getBillingAddress()))
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
        when(mockOrderDao.pageByAccessionHoldersAndStatuses(Set.of(accessionHolderId),
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
               .andExpect(jsonPath("$.documents[0].creationInstant").value(document.getCreationInstant().toString()))
               .andExpect(jsonPath("$.documents[0].onDeliveryForm").value(document.isOnDeliveryForm()));
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
        assertThat(order.getClosingInstant()).isNotNull();
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
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.EMAIL, "desc", true);

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
               .andExpect(jsonPath("$.onDeliveryForm").value(command.isOnDeliveryForm()))
               .andExpect(jsonPath("$.contentType").value(MediaType.TEXT_PLAIN_VALUE))
               .andExpect(jsonPath("$.originalFileName").value("foo.txt"))
               .andExpect(jsonPath("$.creationInstant").isString());

        assertThat(order.getDocuments()).hasSize(2);
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
        verify(mockDocumentStorage).storeDocument(eq(321L), eq("foo.txt"), any());
    }

    @Test
    void shouldThrowWhenAddingSecondDocumentOfUniqueType() throws Exception {
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.INVOICE, "desc", true);

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

        assertThat(order.getDocuments()).hasSize(1);
    }

    @Test
    void shouldThrowWhenAddingDocumentWithInvalidExtension() throws Exception {
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.EMAIL, "desc", true);

        mockMvc.perform(multipart("/api/orders/{orderId}/documents", order.getId())
                            .file(new MockMultipartFile("file",
                                                        "foo.exe",
                                                        MediaType.TEXT_PLAIN_VALUE,
                                                        "hello".getBytes()))
                            .file(new MockMultipartFile("document",
                                                        null,
                                                        MediaType.APPLICATION_JSON_VALUE,
                                                        objectMapper.writeValueAsBytes(command))))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowWhenAddingDocumentToNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        DocumentCommandDTO command = new DocumentCommandDTO(DocumentType.EMAIL, "desc", true);

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
               .andExpect(content().contentType(document.getContentType()))
               .andExpect(content().string("hello"));
    }

    @Test
    void shouldDownloadDeliveryForm() throws Exception {
        when(mockDeliveryFormGenerator.generate(order)).thenReturn("pdf".getBytes());

        order.setStatus(OrderStatus.FINALIZED);

        mockMvc.perform(get("/api/orders/{id}/delivery-form", order.getId()))
               .andExpect(status().isOk())
               .andExpect(header().longValue(HttpHeaders.CONTENT_LENGTH, 3L))
               .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bon-de-livraison-ref.pdf\""))
               .andExpect(content().contentType(MediaType.APPLICATION_PDF))
               .andExpect(content().string("pdf"));
    }

    @Test
    void shouldThrowWhenDownloadingDeliveryFormOnNonFinalizedOrder() throws Exception {
        mockMvc.perform(get("/api/orders/{id}/delivery-form", order.getId()))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDownloadCompleteDeliveryForm() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        Document onDeliveryFormDocument = new Document();
        onDeliveryFormDocument.setId(1234L);
        onDeliveryFormDocument.setOriginalFileName("foo.pdf");
        onDeliveryFormDocument.setOnDeliveryForm(true);
        order.addDocument(onDeliveryFormDocument);

        when(mockDeliveryFormGenerator.generate(order)).thenReturn("deliveryForm".getBytes());
        when(mockDocumentStorage.documentInputStream(onDeliveryFormDocument.getId(), onDeliveryFormDocument.getOriginalFileName()))
            .thenReturn(new ByteArrayInputStream("foo".getBytes()));

        MvcResult mvcResult = mockMvc.perform(get("/api/orders/{id}/complete-delivery-form", order.getId()))
                                     .andExpect(status().isOk())
                                     .andExpect(header().exists(HttpHeaders.CONTENT_LENGTH))
                                     .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                                                                "attachment; filename=\"bon-de-livraison-ref.zip\""))
                                     .andExpect(content().contentType("application/zip"))
                                     .andExpect(request().asyncStarted())
                                     .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(result -> {
                   byte[] bytes = result.getResponse().getContentAsByteArray();
                   Path tempFile = Files.createTempFile("test", "zip");
                   try {
                       Files.copy(new ByteArrayInputStream(bytes), tempFile, StandardCopyOption.REPLACE_EXISTING);
                       ZipFile zipFile = new ZipFile(tempFile.toFile());
                       assertThat(zipFile.getEntry("bon-de-livraison-ref/bon-de-livraison.pdf")).isNotNull();
                       assertThat(zipFile.getEntry("bon-de-livraison-ref/1234-foo.pdf")).isNotNull();
                       assertThat(zipFile.getEntry("bon-de-livraison-ref/54-invoice54.pdf")).isNull();

                       assertThat(StreamUtils.copyToByteArray(
                           zipFile.getInputStream(zipFile.getEntry("bon-de-livraison-ref/bon-de-livraison.pdf"))
                       )).isEqualTo("deliveryForm".getBytes());
                       assertThat(StreamUtils.copyToByteArray(
                           zipFile.getInputStream(zipFile.getEntry("bon-de-livraison-ref/1234-foo.pdf"))
                       )).isEqualTo("foo".getBytes());
                   }
                   finally {
                       Files.delete(tempFile);
                   }
               });
    }

    @Test
    void shouldThrowWhenDownloadingCompleteDeliveryFormOnNonFinalizedOrder() throws Exception {
        mockMvc.perform(get("/api/orders/{id}/complete-delivery-form", order.getId()))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldFinalize() throws Exception {
        mockMvc.perform(put("/api/orders/{id}/finalization", order.getId()))
               .andExpect(status().isNoContent());

        assertThat(order.getStatus()).isEqualTo(OrderStatus.FINALIZED);
        assertThat(order.getClosingInstant()).isNotNull();
    }

    @Test
    void shouldThrowWhenFinalizingNonDraftOrder() throws Exception {
        order.getItems().forEach(item -> item.setQuantity(10));
        order.setStatus(OrderStatus.CANCELLED);
        mockMvc.perform(put("/api/orders/{id}/finalization", order.getId()))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReport() throws Exception {
        LocalDate from = LocalDate.of(2020, 1, 1);
        LocalDate to = LocalDate.of(2020, 4, 1);

        Path tempFile = Files.createTempFile("foo", ".csv");
        Files.writeString(tempFile, "foo;bar");

        when(mockOrderCsvExporter.export(from, to, mockCurrentUser.getVisualizationPerimeter()))
            .thenReturn(new OrderReport(tempFile));

        MvcResult mvcResult =
            mockMvc.perform(get("/api/orders/report")
                                .param("from", from.toString())
                                .param("to", to.toString()))
                   .andExpect(status().isOk())
                   .andExpect(header().longValue(HttpHeaders.CONTENT_LENGTH, 7))
                   .andExpect(content().contentType("text/csv"))
                   .andExpect(request().asyncStarted())
                   .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(content().string("foo;bar"));

        assertThat(Files.exists(tempFile)).isFalse();
        verify(mockCurrentUser).checkPermission(Permission.ORDER_VISUALIZATION);
    }

    @Test
    void shouldGetStatisticsWhenNoGrcProvided() throws Exception {
        LocalDate from = LocalDate.of(2020, 1, 1);
        LocalDate to = LocalDate.of(2020, 12, 31);

        Instant expectedFromInstant = Instant.parse("2019-12-31T23:00:00.000Z"); // French TZ
        Instant expectedToInstant = Instant.parse("2020-12-31T23:00:00.000Z");

        prepareForStatistics(expectedFromInstant, expectedToInstant, mockCurrentUser.getVisualizationPerimeter());

        mockMvc.perform(get("/api/orders/statistics").param("from", from.toString()).param("to", to.toString()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.createdOrderCount").value(57))
               .andExpect(jsonPath("$.finalizedOrderCount").value(50))
               .andExpect(jsonPath("$.cancelledOrderCount").value(12))
               .andExpect(jsonPath("$.distinctFinalizedOrderCustomerCount").value(40))
               .andExpect(jsonPath("$.averageFinalizationDurationInDays").value(1.5))
               .andExpect(jsonPath("$.orderStatusStatistics[0].orderStatus").value(OrderStatus.DRAFT.name()))
               .andExpect(jsonPath("$.orderStatusStatistics[0].createdOrderCount").value(1))
               .andExpect(jsonPath("$.orderStatusStatistics[1].orderStatus").value(OrderStatus.FINALIZED.name()))
               .andExpect(jsonPath("$.orderStatusStatistics[1].createdOrderCount").value(56))
               .andExpect(jsonPath("$.customerTypeStatistics[0].customerType").value(CustomerType.FARMER.name()))
               .andExpect(jsonPath("$.customerTypeStatistics[0].finalizedOrderCount").value(20))
               .andExpect(jsonPath("$.customerTypeStatistics[1].customerType").value(CustomerType.CITIZEN.name()))
               .andExpect(jsonPath("$.customerTypeStatistics[1].finalizedOrderCount").value(30));

        verify(mockCurrentUser).checkPermission(Permission.ORDER_VISUALIZATION);
    }

    @Test
    void shouldGetStatisticsWhenGrcsProvided() throws Exception {
        LocalDate from = LocalDate.of(2020, 1, 1);
        LocalDate to = LocalDate.of(2020, 12, 31);

        Instant expectedFromInstant = Instant.parse("2019-12-31T23:00:00.000Z"); // French TZ
        Instant expectedToInstant = Instant.parse("2020-12-31T23:00:00.000Z");
        VisualizationPerimeter expectedPerimeter = VisualizationPerimeter.constrained(Collections.singleton(2L));

        prepareForStatistics(expectedFromInstant, expectedToInstant, expectedPerimeter);

        mockMvc.perform(get("/api/orders/statistics")
                            .param("from", from.toString())
                            .param("to", to.toString())
                            .param("grcs", "2") // user is only allowed to see 1 and 2
        )
               .andExpect(status().isOk());


        verify(mockOrderDao).countCancelledOrders(expectedFromInstant, expectedToInstant, expectedPerimeter);
        verify(mockOrderDao).countDistinctCustomersOfFinalizedOrders(expectedFromInstant, expectedToInstant, expectedPerimeter);
        //...

        verify(mockCurrentUser).checkPermission(Permission.ORDER_VISUALIZATION);
    }

    @Test
    void shouldThrowWhenRequestingStatisticsForDisallowedGrcs() throws Exception {
        LocalDate from = LocalDate.of(2020, 1, 1);
        LocalDate to = LocalDate.of(2020, 12, 31);

        mockMvc.perform(get("/api/orders/statistics")
                            .param("from", from.toString())
                            .param("to", to.toString())
                            .param("grcs", "1", "2", "3") // user is only allowed to see 1 and 2
        )
               .andExpect(status().isForbidden());
    }

    @Test
    void shouldUpdateCustomerInformation() throws Exception {
        CustomerInformationCommandDTO command = new CustomerInformationCommandDTO(
            null,
            new CustomerCommandDTO(
                "Doe",
                "Wheat SA",
                "doe@mail.com",
                "1, Main street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH
            ),
            "the rationale"
        );
        mockMvc.perform(put("/api/orders/{id}/customer-information", order.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(order.getBasket().getCustomer()).isEqualTo(new Customer(
                command.getCustomer().getName(),
                command.getCustomer().getOrganization(),
                command.getCustomer().getEmail(),
                command.getCustomer().getDeliveryAddress(),
                command.getCustomer().getBillingAddress(),
                command.getCustomer().getType(),
                command.getCustomer().getLanguage()
        ));
        assertThat(order.getBasket().getRationale()).isEqualTo(command.getRationale());
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenUpdatingCustomerInformationOfNonDraftOrder() throws Exception {
        order.setStatus(OrderStatus.FINALIZED);
        CustomerInformationCommandDTO command = new CustomerInformationCommandDTO(
            null,
            new CustomerCommandDTO(
                "Doe",
                "Wheat SA",
                "doe@mail.com",
                "1, Main street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH
            ),
            "the rationale"
        );
        mockMvc.perform(put("/api/orders/{id}/customer-information", order.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowWhenUpdatingInvalidCustomerInformation() throws Exception {
        CustomerInformationCommandDTO command = new CustomerInformationCommandDTO(
            null,
            new CustomerCommandDTO(
                "", // empty name
                "Wheat SA",
                "doe@mail.com",
                "1, Main street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH
            ),
            "the rationale"
        );
        mockMvc.perform(put("/api/orders/{id}/customer-information", order.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldCreateOrder() throws Exception {
        OrderCreationCommandDTO command = new OrderCreationCommandDTO(
            accessionHolderId,
            new CustomerCommandDTO(
                "John Doe",
                "Wheat SA",
                "john@mail.com",
                "1, Main Street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH),
            "the rationale"
        );

        when(mockOrderDao.save(any())).thenAnswer(MoreAnswers.<Order>firstArgWith(order -> order.setId(42L)));

        mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(42L));

        verify(mockOrderDao).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        assertThat(savedOrder.getBasket().getCustomer()).isEqualTo(new Customer(
                command.getCustomer().getName(),
                command.getCustomer().getOrganization(),
                command.getCustomer().getEmail(),
                command.getCustomer().getDeliveryAddress(),
                command.getCustomer().getBillingAddress(),
                command.getCustomer().getType(),
                command.getCustomer().getLanguage()
        ));
        assertThat(savedOrder.getBasket().getRationale()).isEqualTo(command.getRationale());
        assertThat(savedOrder.getBasket().getReference()).isNotNull();
        assertThat(savedOrder.getBasket().getStatus()).isEqualTo(BasketStatus.CONFIRMED);
        assertThat(savedOrder.getBasket().getCreationInstant()).isNotNull();
        assertThat(savedOrder.getBasket().getConfirmationInstant()).isNotNull();
        assertThat(savedOrder.getClosingInstant()).isNull();
        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.DRAFT);
        assertThat(savedOrder.getAccessionHolder().getId()).isEqualTo(accessionHolderId);

        verify(mockBasketDao).save(savedOrder.getBasket());
        verify(mockCurrentUser).checkPermission(Permission.ORDER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenCreatingOrderWithInvalidCustomerInformation() throws Exception {
        OrderCreationCommandDTO command = new OrderCreationCommandDTO(
            accessionHolderId,
            new CustomerCommandDTO(
                "John Doe",
                "Wheat SA",
                "john", // invalid email
                "1, Main Street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH),
            "the rationale"
        );

        mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowWhenCreatingOrderWithBadAccessionHolder() throws Exception {
        OrderCreationCommandDTO command = new OrderCreationCommandDTO(
            456789L,
            new CustomerCommandDTO(
                "John Doe",
                "Wheat SA",
                "john@mail.com",
                "1, Main Street",
                "1 - billing service, Main Street",
                CustomerType.FARMER,
                SupportedLanguage.ENGLISH),
            "the rationale"
        );

        mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    private void prepareForStatistics(Instant expectedFromInstant,
                                      Instant expectedToInstant,
                                      VisualizationPerimeter visualizationPerimeter) {
        List<OrderStatusStatisticsDTO> orderStatusStatistics =
            List.of(
                new OrderStatusStatisticsDTO(OrderStatus.DRAFT, 1L),
                new OrderStatusStatisticsDTO(OrderStatus.FINALIZED, 56L)
            );
        List<CustomerTypeStatisticsDTO> customerTypeStatistics =
            List.of(
                new CustomerTypeStatisticsDTO(CustomerType.FARMER, 20L),
                new CustomerTypeStatisticsDTO(CustomerType.CITIZEN, 30L)
            );

        when(mockOrderDao.countCancelledOrders(expectedFromInstant, expectedToInstant, visualizationPerimeter))
            .thenReturn(12L);
        when(mockOrderDao.countDistinctCustomersOfFinalizedOrders(expectedFromInstant, expectedToInstant, visualizationPerimeter))
            .thenReturn(40L);
        when(mockOrderDao.computeAverageFinalizationDuration(expectedFromInstant, expectedToInstant, visualizationPerimeter))
            .thenReturn(Duration.ofHours(36));
        when(mockOrderDao.findOrderStatusStatistics(expectedFromInstant, expectedToInstant, visualizationPerimeter))
            .thenReturn(orderStatusStatistics);
        when(mockOrderDao.findCustomerTypeStatistics(expectedFromInstant, expectedToInstant, visualizationPerimeter))
            .thenReturn(customerTypeStatistics);
    }
}
