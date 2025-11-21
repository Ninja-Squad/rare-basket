package fr.inra.urgi.rarebasket.service.order;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.config.Constants;
import fr.inra.urgi.rarebasket.dao.DocumentTypeOnOrder;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.dao.ReportingOrder;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import org.apache.commons.codec.binary.Hex;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.supercsv.io.CsvListWriter;
import org.supercsv.prefs.CsvPreference;

/**
 * Service allowing to export order information in CSV form
 * @author JB Nizet
 */
@Component
public class OrderCsvExporter {

    private final OrderDao orderDao;

    private final MessageDigest emailHasher;

    private final String[] header;

    public OrderCsvExporter(OrderDao orderDao, MessageSource messageSource) {
        this.orderDao = orderDao;
        try {
            this.emailHasher = MessageDigest.getInstance("SHA-256");
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }

        this.header = createHeader(messageSource);
    }

    private String[] createHeader(MessageSource messageSource) {
        // if you change the columns or their order, you must also change the query of OrderDao.reportBetween
        List<String> headerList = new ArrayList<>();
        headerList.add("Référence Panier");
        headerList.add("Email client");
        headerList.add("Type client");
        headerList.add("Langue client");
        headerList.add("Date confirmation panier");
        headerList.add("GRC");
        headerList.add("Gestionnaire d'accessions");
        headerList.add("État");
        headerList.add("Date finalisation");
        for (DocumentType documentType : DocumentType.values()) {
            headerList.add(messageSource.getMessage("document-type." + documentType.name(), null, Locale.FRENCH));
        }
        headerList.add("Nom accession");
        headerList.add("N° d'accession");
        headerList.add("Taxon");
        headerList.add("Quantité");
        headerList.add("Unité");

        return headerList.toArray(new String[0]);
    }

    /**
     * Exports to CSV all the orders, their items and their document types present on the the delivery form
     * and matching the given criteria.
     *
     * The amount of data could be large, so the strategy avoids having too much information in memory.
     * So the data is written to a temporary file, and this temporary file is returned.
     *
     * Orders are streamed, and every time we have a batch of 100 order IDs (or reach the end of the stream),
     * we execute an additional query to find which document types are present on the delivery form of these
     * orders.
     *
     * The orders are then written to the file.
     */
    public OrderReport export(LocalDate from, LocalDate to, VisualizationPerimeter perimeter) {
        try {
            Instant fromInstant = from.atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();
            Instant toInstant = to.plusDays(1).atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();

            try (Stream<ReportingOrder> rows = perimeter.isGlobal()
                ? orderDao.reportBetween(fromInstant, toInstant)
                : orderDao.reportBetween(fromInstant, toInstant, perimeter.getGrcIds())) {

                return toCsv(rows);
            }
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }


    private OrderReport toCsv(Stream<ReportingOrder> reportingOrders) throws IOException {
        Path tempFile = Files.createTempFile("rare-order-report", ".csv");
        try (
            BufferedWriter out = new BufferedWriter(new FileWriter(tempFile.toFile(), StandardCharsets.UTF_8));
            CsvListWriter listWriter = new CsvListWriter(out, CsvPreference.EXCEL_NORTH_EUROPE_PREFERENCE)
        ) {
            listWriter.writeHeader(header);

            List<RowBuilder> rowBuilders = new ArrayList<>();
            Set<Long> orderIds = new HashSet<>();

            reportingOrders.forEachOrdered(reportingOrder -> {
                try {
                    if (orderIds.size() == 100 && !orderIds.contains(reportingOrder.orderId())) {
                        addDocumentTypes(rowBuilders, orderIds);
                        write(rowBuilders, listWriter);
                        rowBuilders.clear();
                        orderIds.clear();
                    }

                    rowBuilders.add(new RowBuilder(reportingOrder));
                    orderIds.add(reportingOrder.orderId());

                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });

            if (!rowBuilders.isEmpty()) {
                addDocumentTypes(rowBuilders, orderIds);
                write(rowBuilders, listWriter);
            }
        }

        return new OrderReport(tempFile);
    }

    private void addDocumentTypes(List<RowBuilder> rowBuilders, Set<Long> orderIds) {
        Map<Long, Set<DocumentType>> documentTypesByOrderId =
            orderDao.findDocumentTypesOnOrders(orderIds)
                .stream()
                .collect(Collectors.groupingBy(DocumentTypeOnOrder::getOrderId,
                                               Collectors.mapping(DocumentTypeOnOrder::getDocumentType,
                                                                  Collectors.toSet())));
        rowBuilders.forEach(
            rowBuilder -> rowBuilder.setDocumentTypes(
                documentTypesByOrderId.getOrDefault(rowBuilder.getOrderId(), Collections.emptySet())
            )
        );
    }

    private void write(List<RowBuilder> rowBuilders, CsvListWriter listWriter) throws IOException {
        for (RowBuilder rowBuilder : rowBuilders) {
            listWriter.write(rowBuilder.build());
        }
    }

    private class RowBuilder {
        private final ReportingOrder order;
        private Set<DocumentType> documentTypes = Collections.emptySet();

        public RowBuilder(ReportingOrder order) {
            this.order = order;
        }

        private Long getOrderId() {
            return this.order.orderId();
        }

        public void setDocumentTypes(Set<DocumentType> documentTypes) {
            this.documentTypes = documentTypes;
        }

        public Object[] build() {
            List<Object> list = new ArrayList<>(header.length);
            list.add(order.basketReference());
            list.add(hash(order.customerEmail()));
            list.add(order.customerType().name());
            list.add(order.customerLanguage().name());
            list.add(order.basketConfirmationInstant());
            list.add(order.grcName());
            list.add(order.accessionHolderName());
            list.add(order.status());
            list.add(order.finalizationInstant());
            for (DocumentType documentType : DocumentType.values()) {
                list.add(documentTypes.contains(documentType) ? 1 : 0);
            }
            list.add(order.accessionName());
            list.add(order.accessionNumber());
            list.add(order.accessionTaxon());
            list.add(order.accessionQuantity());
            list.add(order.accessionUnit());
            return list.toArray();
        }

        private String hash(String email) {
            byte[] digest = emailHasher.digest(email.getBytes(StandardCharsets.UTF_8));
            // truncate to avoid too large values in the CSV. The probability of a collision, even with "only"
            // the first 10 bytes, is infinitesimal. At worse, the number of distinct clients will be off by one
            byte[] first10Bytes = Arrays.copyOfRange(digest, 0, 10);
            // use hex rather than base64 or base32 to avoid special characters like + or =
            return Hex.encodeHexString(first10Bytes);
        }
    }
}
