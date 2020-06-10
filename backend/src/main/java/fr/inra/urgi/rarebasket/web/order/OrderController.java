package fr.inra.urgi.rarebasket.web.order;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.config.Constants;
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
import fr.inra.urgi.rarebasket.exception.ForbiddenException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.order.DeliveryFormGenerator;
import fr.inra.urgi.rarebasket.service.order.OrderCsvExporter;
import fr.inra.urgi.rarebasket.service.storage.DocumentStorage;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import fr.inra.urgi.rarebasket.util.References;
import fr.inra.urgi.rarebasket.web.basket.BasketCommandDTO;
import fr.inra.urgi.rarebasket.web.basket.CustomerCommandDTO;
import fr.inra.urgi.rarebasket.web.common.PageDTO;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller used to handle orders. This controller is used by accession holder users.
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/orders")
@Transactional
public class OrderController {

    public static final int PAGE_SIZE = 20;
    private static final Set<String> VALID_FILE_EXTENSIONS = Set.of(".pdf", ".txt", ".eml", ".pst", ".ost");

    private final OrderDao orderDao;
    private final CurrentUser currentUser;
    private final DocumentStorage documentStorage;
    private final DeliveryFormGenerator deliveryFormGenerator;
    private final OrderCsvExporter orderCsvExporter;
    private final BasketDao basketDao;
    private final AccessionHolderDao accessionHolderDao;

    public OrderController(OrderDao orderDao,
                           CurrentUser currentUser,
                           DocumentStorage documentStorage,
                           DeliveryFormGenerator deliveryFormGenerator,
                           OrderCsvExporter orderCsvExporter,
                           BasketDao basketDao,
                           AccessionHolderDao accessionHolderDao) {
        this.orderDao = orderDao;
        this.currentUser = currentUser;
        this.documentStorage = documentStorage;
        this.deliveryFormGenerator = deliveryFormGenerator;
        this.orderCsvExporter = orderCsvExporter;
        this.basketDao = basketDao;
        this.accessionHolderDao = accessionHolderDao;
    }

    @GetMapping
    public PageDTO<OrderDTO> list(@RequestParam(name = "status", required = false) Set<OrderStatus> statuses,
                                  @RequestParam(name = "page", defaultValue = "0") int page) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        PageRequest pageRequest = PageRequest.of(page, PAGE_SIZE);

        Page<Order> orderPage;
        if (statuses == null || statuses.isEmpty()) {
            orderPage = orderDao.pageByAccessionHolder(getAccessionHolderId(), pageRequest);
        }
        else {
            orderPage = orderDao.pageByAccessionHolderAndStatuses(getAccessionHolderId(), statuses, pageRequest);
        }
        return PageDTO.fromPage(orderPage, OrderDTO::new);
    }

    @GetMapping("/report")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> csvReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        currentUser.checkPermission(Permission.ORDER_VISUALIZATION);

        InputStream report = orderCsvExporter.export(from, to, currentUser.getVisualizationPerimeter());

        return ResponseEntity.ok()
                             .contentType(MediaType.parseMediaType("text/csv"))
                             .headers(httpHeaders -> {
                                 httpHeaders.add(
                                     HttpHeaders.CONTENT_DISPOSITION,
                                     ContentDisposition.builder("attachment")
                                                       .filename("orders_" + from + "_" + to + ".csv")
                                                       .build()
                                                       .toString()
                                 );
                             })
                             .body(new InputStreamResource(report));
    }

    @GetMapping("/{orderId}")
    public DetailedOrderDTO get(@PathVariable("orderId") Long orderId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessible(orderId);

        return new DetailedOrderDTO(order);
    }

    @PutMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable("orderId") Long orderId,
                       @Validated @RequestBody OrderCommandDTO command) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);

        Set<OrderItem> items = command.getItems()
                                      .stream()
                                      .map(itemCommand -> new OrderItem(null,
                                                                        itemCommand.getAccession(),
                                                                        itemCommand.getQuantity(),
                                                                        itemCommand.getUnit()))
                                      .collect(Collectors.toSet());
        order.setItems(items);
    }

    @PutMapping("/{orderId}/customer-information")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateCustomerInformation(@PathVariable("orderId") Long orderId,
                                          @Validated(BasketCommandDTO.Complete.class) @RequestBody CustomerInformationCommandDTO command) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);
        Customer customer = createCustomer(command.getCustomer());
        order.getBasket().setCustomer(customer);
        order.getBasket().setRationale(command.getRationale());
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable("orderId") Long orderId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);

        order.setStatus(OrderStatus.CANCELLED);
        order.setClosingInstant(Instant.now());
    }

    @PostMapping("/{orderId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentDTO create(@PathVariable("orderId") Long orderId,
                              @RequestPart("file") MultipartFile file,
                              @RequestPart("document") @Validated DocumentCommandDTO command) throws IOException {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);

        if (command.getType().isUnique() && order.getDocuments().stream().anyMatch(doc -> doc.getType() == command.getType())) {
            throw new BadRequestException("The order already has a document of that type, and may have at most one");
        }
        if (VALID_FILE_EXTENSIONS.stream().noneMatch(extension -> file.getOriginalFilename().toLowerCase().endsWith(extension))) {
            throw new BadRequestException("The file must have one of these extensions: " + VALID_FILE_EXTENSIONS);
        }

        Document document = new Document();
        document.setDescription(command.getDescription());
        document.setType(command.getType());
        document.setOnDeliveryForm(command.isOnDeliveryForm());
        document.setOriginalFileName(file.getOriginalFilename());
        document.setContentType(file.getContentType());

        order.addDocument(document);

        // to generate the document ID
        orderDao.flush();

        documentStorage.storeDocument(document.getId(), document.getOriginalFileName(), file.getInputStream());
        return new DocumentDTO(document);
    }

    @DeleteMapping("/{orderId}/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable("orderId") Long orderId,
                               @PathVariable("documentId") Long documentId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);

        Document document = order.getDocuments()
                                 .stream()
                                 .filter(doc -> doc.getId().equals(documentId))
                                 .findAny()
                                 .orElseThrow(NotFoundException::new);

        documentStorage.delete(document.getId(), document.getOriginalFileName());
        order.removeDocument(document);
    }

    @GetMapping("/{orderId}/documents/{documentId}/file")
    public ResponseEntity<Resource> downloadDocumentFile(@PathVariable("orderId") Long orderId,
                                                         @PathVariable("documentId") Long documentId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessible(orderId);

        Document document = order.getDocuments()
                                 .stream()
                                 .filter(doc -> doc.getId().equals(documentId))
                                 .findAny()
                                 .orElseThrow(NotFoundException::new);

        return ResponseEntity.ok()
                             .contentType(MediaType.parseMediaType(document.getContentType()))
                             .contentLength(documentStorage.documentSize(document.getId(),
                                                                         document.getOriginalFileName()))
                             .headers(httpHeaders -> {
                                 httpHeaders.add(
                                     HttpHeaders.CONTENT_DISPOSITION,
                                     ContentDisposition.builder("attachment")
                                                       .filename(document.getOriginalFileName())
                                                       .build()
                                                       .toString()
                                 );
                             })
                             .body(
                                 new InputStreamResource(documentStorage.documentInputStream(document.getId(),
                                                                                             document.getOriginalFileName())
                                 )
                             );
    }

    @GetMapping("/{orderId}/delivery-form")
    public ResponseEntity<Resource> downloadDeliveryForm(@PathVariable("orderId") Long orderId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndFinalized(orderId);

        byte[] deliveryForm = deliveryFormGenerator.generate(order);

        return ResponseEntity.ok()
                             .contentType(MediaType.APPLICATION_PDF)
                             .headers(httpHeaders -> {
                                 httpHeaders.add(
                                     HttpHeaders.CONTENT_DISPOSITION,
                                     ContentDisposition.builder("attachment")
                                                       .filename("bon-de-livraison-" + order.getId() + ".pdf")
                                                       .build()
                                                       .toString()
                                 );
                             })
                             .body(new ByteArrayResource(deliveryForm));
    }

    @PutMapping("/{orderId}/finalization")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void finalizeOrder(@PathVariable("orderId") Long orderId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        Order order = getOrderAndCheckAccessibleAndDraft(orderId);

        order.setStatus(OrderStatus.FINALIZED);
        order.setClosingInstant(Instant.now());
    }

    @GetMapping("/statistics")
    public OrderStatisticsDTO getStatistics(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                            @RequestParam("grcs") Optional<Set<Long>> grcIds) {
        currentUser.checkPermission(Permission.ORDER_VISUALIZATION);

        Instant fromInstant = from.atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();

        VisualizationPerimeter perimeter = currentUser.getVisualizationPerimeter();
        if (grcIds.isPresent()) {
            if (!currentUser.getVisualizationPerimeter().isGlobal() &&
                !currentUser.getVisualizationPerimeter().getGrcIds().containsAll(grcIds.get())) {
                throw new ForbiddenException();
            }
            perimeter = VisualizationPerimeter.constrained(grcIds.get());
        }

        List<OrderStatusStatisticsDTO> orderStatusStatistics = orderDao.findOrderStatusStatistics(fromInstant,
                                                                                                  toInstant,
                                                                                                  perimeter);
        List<CustomerTypeStatisticsDTO> customerTypeStatistics = orderDao.findCustomerTypeStatistics(fromInstant,
                                                                                                     toInstant,
                                                                                                     perimeter);
        long createdOrderCount = orderStatusStatistics.stream().mapToLong(OrderStatusStatisticsDTO::getCreatedOrderCount).sum();
        long finalizedOrderCount = customerTypeStatistics.stream().mapToLong(CustomerTypeStatisticsDTO::getFinalizedOrderCount).sum();
        long cancelledOrderCount = orderDao.countCancelledOrders(fromInstant, toInstant, perimeter);
        long distinctFinalizedOrderCustomerCount = orderDao.countDistinctCustomersOfFinalizedOrders(fromInstant,
                                                                                                    toInstant,
                                                                                                    perimeter);

        Duration averageFinalizationDuration =
            orderDao.computeAverageFinalizationDuration(fromInstant, toInstant, perimeter);

        return new OrderStatisticsDTO(
            createdOrderCount,
            finalizedOrderCount,
            cancelledOrderCount,
            distinctFinalizedOrderCustomerCount,
            averageFinalizationDuration.toMinutes() / (double) Duration.ofDays(1).toMinutes(),
            orderStatusStatistics,
            customerTypeStatistics
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DetailedOrderDTO create(@Validated(BasketCommandDTO.Complete.class) @RequestBody CustomerInformationCommandDTO command) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);

        Basket basket = new Basket();
        basket.setCustomer(createCustomer(command.getCustomer()));
        basket.setRationale(command.getRationale());
        basket.setConfirmationInstant(Instant.now());
        basket.setStatus(BasketStatus.CONFIRMED);
        basket.setReference(References.generateRandomReference());
        basketDao.save(basket);

        Order order = new Order();
        order.setBasket(basket);
        order.setAccessionHolder(
            accessionHolderDao.getOne(
                currentUser.getAccessionHolderId()
                           .orElseThrow(() -> new IllegalStateException("Current user should have an accession holder")))
        );
        orderDao.save(order);
        return new DetailedOrderDTO(order);
    }

    private Order getOrderAndCheckAccessible(Long orderId) {
        Order order = orderDao.findById(orderId).orElseThrow(NotFoundException::new);
        if (!order.getAccessionHolder().getId().equals(getAccessionHolderId())) {
            throw new ForbiddenException();
        }
        return order;
    }

    private Order getOrderAndCheckAccessibleAndDraft(Long orderId) {
        Order order = getOrderAndCheckAccessible(orderId);
        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new BadRequestException("This operation cannot be done on a non-DRAFT order");
        }
        return order;
    }

    private Order getOrderAndCheckAccessibleAndFinalized(Long orderId) {
        Order order = getOrderAndCheckAccessible(orderId);
        if (order.getStatus() != OrderStatus.FINALIZED) {
            throw new BadRequestException("This operation cannot be done on a non-FINALIZED order");
        }
        return order;
    }

    private Long getAccessionHolderId() {
        return currentUser.getAccessionHolderId()
                          .orElseThrow(() -> new IllegalStateException("Current user should have an accession holder"));
    }

    private Customer createCustomer(CustomerCommandDTO command) {
        return new Customer(command.getName(),
                            command.getOrganization(),
                            command.getEmail(),
                            command.getAddress(),
                            command.getType(),
                            command.getLanguage());
    }
}
