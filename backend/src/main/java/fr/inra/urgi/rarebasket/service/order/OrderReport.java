package fr.inra.urgi.rarebasket.service.order;

import java.io.BufferedInputStream;
import java.io.Closeable;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * An order report, which must be closed once its input stream has been consumed.
 * @author JB Nizet
 */
public final class OrderReport implements Closeable {
    private final Path temporaryFile;

    public OrderReport(Path temporaryFile) {
        this.temporaryFile = temporaryFile;
    }

    public InputStream inputStream() {
        try {
            return new BufferedInputStream(new FileInputStream(temporaryFile.toFile()));
        } catch (FileNotFoundException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public void close() {
        try {
            Files.delete(temporaryFile);
        } catch (IOException e) {
            // ignore: the temporary file will stay there which is not a bug deal
        }
    }

    public long size() {
        return temporaryFile.toFile().length();
    }
}
