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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Base64;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.config.Constants;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
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
        "Email client",
        "Type client",
        "Langue client",
        "Date confirmation panier",
        "GRC",
        "Gestionnaire d'accessions",
        "État",
        "Date finalisation",
        "Nom accession",
        "Identifiant accession",
        "Quantité",
        "Unité"
    };

    private final OrderDao orderDao;
    private final MessageDigest emailHasher;

    public OrderCsvExporter(OrderDao orderDao) {
        this.orderDao = orderDao;
        try {
            this.emailHasher = MessageDigest.getInstance("SHA-256");
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public InputStream export(LocalDate from, LocalDate to, VisualizationPerimeter perimeter) {
        try {
            Instant fromInstant = from.atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();
            Instant toInstant = to.plusDays(1).atStartOfDay(Constants.FRANCE_TIMEZONE).toInstant();

            try (Stream<Object[]> rows = perimeter.isGlobal()
                ? orderDao.reportBetween(fromInstant, toInstant)
                : orderDao.reportBetween(fromInstant, toInstant, perimeter.getGrcIds())) {

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
                    // hash the email to anonymize the data
                    row[1] = hash((String) row[1]);
                    listWriter.write(row);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }

        return new BufferedInputStream(new FileInputStream(tempFile.toFile()));
    }

    private String hash(String email) {
        return Base64.getEncoder().encodeToString(emailHasher.digest(email.getBytes(StandardCharsets.UTF_8)));
    }
}
