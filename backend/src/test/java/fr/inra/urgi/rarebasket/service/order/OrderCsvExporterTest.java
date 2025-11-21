package fr.inra.urgi.rarebasket.service.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.dao.DocumentTypeOnOrder;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.dao.ReportingOrder;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ResourceBundleMessageSource;

/**
 * Unit tests for {@link OrderCsvExporter}
 * @author JB Nizet
 */
class OrderCsvExporterTest {

    private List<ReportingOrder> reportingOrders;
    private List<DocumentTypeOnOrder> documentTypeOnOrders;
    private OrderDao mockOrderDao;
    private OrderCsvExporter exporter;

    @BeforeEach
    void prepare() {
        mockOrderDao = mock(OrderDao.class);
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        exporter = new OrderCsvExporter(mockOrderDao, messageSource);

        reportingOrders = List.of(
            new ReportingOrder(
                1L,
                "AZERTYUI",
                "john@mail.com",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH,
                Instant.parse("2020-03-01T00:00:00Z"),
                "GRC1",
                "acc1",
                OrderStatus.FINALIZED,
                Instant.parse("2020-03-10T00:00:00Z"),
                "rosa",
                "rosa1",
                "rosaTaxon",
                10,
                "bags"
            ),
            new ReportingOrder(
                2L,
                "POIUYTRE",
                "jack@mail.com",
                CustomerType.CITIZEN,
                SupportedLanguage.ENGLISH,
                Instant.parse("2020-03-02T00:00:00Z"),
                "GRC2",
                "acc2",
                OrderStatus.CANCELLED,
                Instant.parse("2020-03-11T00:00:00Z"),
                "violetta",
                "vio;letta1",
                "violettaTaxon",
                null,
                null
            )
        );

        documentTypeOnOrders = List.of(
            new DocumentTypeOnOrder(1L, DocumentType.MTA),
            new DocumentTypeOnOrder(1L, DocumentType.SANITARY_PASSPORT)
        );
    }

    @Test
    void shouldExportUsingFrenchTimezone() {
        when(mockOrderDao.reportBetween(Instant.parse("2019-12-31T23:00:00Z"),
                                        Instant.parse("2020-04-30T22:00:00Z"))).thenReturn(
            reportingOrders.stream()
        );
        when(mockOrderDao.findDocumentTypesOnOrders(Set.of(1L, 2L))).thenReturn(documentTypeOnOrders);

        InputStream result = exporter.export(LocalDate.of(2020, 1, 1),
                                             LocalDate.of(2020, 4, 30),
                                             VisualizationPerimeter.global()).inputStream();

        try (Stream<String> stream = new BufferedReader(new InputStreamReader(result, StandardCharsets.UTF_8)).lines()) {
            List<String> rows = stream.collect(Collectors.toList());
            assertThat(rows).hasSize(3);
            // the second cell is the email, and is thus hashed
            assertThat(rows.get(1)).isEqualTo("AZERTYUI;01502e14bf754aeee2ac;FARMER;FRENCH;2020-03-01T00:00:00Z;GRC1;acc1;FINALIZED;2020-03-10T00:00:00Z;0;1;0;1;0;0;rosa;rosa1;rosaTaxon;10;bags");
            assertThat(rows.get(2)).isEqualTo("POIUYTRE;b62e07f08723f8ab8f1c;CITIZEN;ENGLISH;2020-03-02T00:00:00Z;GRC2;acc2;CANCELLED;2020-03-11T00:00:00Z;0;0;0;0;0;0;violetta;\"vio;letta1\";violettaTaxon;;");
        }
    }

    @Test
    void shouldExportForConstrainedPerimeter() {
        when(mockOrderDao.reportBetween(Instant.parse("2019-12-31T23:00:00Z"),
                                        Instant.parse("2020-04-30T22:00:00Z"),
                                        Set.of(1L, 2L))).thenReturn(
            reportingOrders.stream()
        );
        when(mockOrderDao.findDocumentTypesOnOrders(Set.of(1L, 2L))).thenReturn(documentTypeOnOrders);

        InputStream result = exporter.export(LocalDate.of(2020, 1, 1),
                                             LocalDate.of(2020, 4, 30),
                                             VisualizationPerimeter.constrained(Set.of(1L, 2L))).inputStream();

        try (Stream<String> stream = new BufferedReader(new InputStreamReader(result, StandardCharsets.UTF_8)).lines()) {
            List<String> rows = stream.collect(Collectors.toList());
            assertThat(rows).hasSize(3);
            // the second cell is the email, and is thus hashed
            assertThat(rows.get(1)).isEqualTo("AZERTYUI;01502e14bf754aeee2ac;FARMER;FRENCH;2020-03-01T00:00:00Z;GRC1;acc1;FINALIZED;2020-03-10T00:00:00Z;0;1;0;1;0;0;rosa;rosa1;rosaTaxon;10;bags");
            assertThat(rows.get(2)).isEqualTo("POIUYTRE;b62e07f08723f8ab8f1c;CITIZEN;ENGLISH;2020-03-02T00:00:00Z;GRC2;acc2;CANCELLED;2020-03-11T00:00:00Z;0;0;0;0;0;0;violetta;\"vio;letta1\";violettaTaxon;;");
        }
    }
}
