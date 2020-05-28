package fr.inra.urgi.rarebasket.service.order;

import java.io.BufferedInputStream;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.config.Constants;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import org.springframework.stereotype.Component;
import org.supercsv.io.CsvListWriter;
import org.supercsv.prefs.CsvPreference;

/**
 * Service allowing to export order information in CSV form
 * @author JB Nizet
 */
@Component
public class OrderCsvExporter {

    // if you change the columns or their order, you must also change the query of OrderDao.reportBetween
    private static final String[] HEADER = {
        "Référence Panier",
        "Nom client",
        "Email client",
        "Adresse client",
        "Type client",
        "Langue client",
        "Date confirmation panier",
        "GRC",
        "Gestionnaire d'accessions",
        "Date finalisation",
        "Nom accession",
        "Identifiant accession",
        "Quantité",
        "Unité"
    };

    private final OrderDao orderDao;

    public OrderCsvExporter(OrderDao orderDao) {
        this.orderDao = orderDao;
    }

    public InputStream export(LocalDate from, LocalDate to, Long accessionHolderId) {
        try {
            Instant fromInstant = from.atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();
            Instant toInstant = to.plusDays(1).atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();

            try (Stream<Object[]> rows = orderDao.reportBetween(fromInstant, toInstant, accessionHolderId)) {
                return toCsv(rows);
            }
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private InputStream toCsv(Stream<Object[]> rows) throws IOException {
        Path tempFile = Files.createTempFile("rare-order-report", ".csv");
        try (
            BufferedWriter out = new BufferedWriter(new FileWriter(tempFile.toFile(), StandardCharsets.UTF_8));
            CsvListWriter listWriter = new CsvListWriter(out, CsvPreference.EXCEL_NORTH_EUROPE_PREFERENCE)
        ) {
            listWriter.writeHeader(HEADER);
            rows.forEachOrdered(row -> {
                try {
                    listWriter.write(row);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }

        return new BufferedInputStream(new FileInputStream(tempFile.toFile()));
    }
}
