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
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.dao.OrderDao;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link OrderCsvExporter}
 * @author JB Nizet
 */
class OrderCsvExporterTest {
    @Test
    void shouldExportUsingFrenchTimezone() {
        OrderDao mockOrderDao = mock(OrderDao.class);
        OrderCsvExporter exporter = new OrderCsvExporter(mockOrderDao);

        when(mockOrderDao.reportBetween(Instant.parse("2019-12-31T23:00:00Z"),
                                        Instant.parse("2020-04-30T22:00:00Z"),
                                        42L)).thenReturn(
            Stream.of(new Object[] { "a", "b" }, new Object[] { "c", "d;e" })
        );

        InputStream result = exporter.export(LocalDate.of(2020, 1, 1),
                                             LocalDate.of(2020, 4, 30),
                                             42L);

        try (Stream<String> stream = new BufferedReader(new InputStreamReader(result, StandardCharsets.UTF_8)).lines()) {
            List<String> rows = stream.collect(Collectors.toList());
            assertThat(rows).hasSize(3);
            assertThat(rows.get(1)).isEqualTo("a;b");
            assertThat(rows.get(2)).isEqualTo("c;\"d;e\"");
        }
    }
}
