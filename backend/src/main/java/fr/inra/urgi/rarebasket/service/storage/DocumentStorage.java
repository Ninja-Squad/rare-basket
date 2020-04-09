package fr.inra.urgi.rarebasket.service.storage;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import fr.inra.urgi.rarebasket.config.DocumentStorageProperties;
import org.springframework.stereotype.Component;

/**
 * The service used to store document files on the file system,
 * using a naming convention allowing to avoid file name clashes and too many
 * directories.
 *
 * The convention is to use the ID of the document and its original file name,
 * to generate a file path using this rule:
 *
 * <code>
 *   [base-path]/[id / 1000]/[id % 1000]-[original-file-name]
 * </code>
 *
 * @author JB Nizet
 */
@Component
public class DocumentStorage {

    private final DocumentStorageProperties storageProperties;

    public DocumentStorage(DocumentStorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    public void storeDocument(Long id, String originalFileName, InputStream inputStream) {
        try (BufferedInputStream in = new BufferedInputStream(inputStream)) {
            Path destinationFile = pathFor(id, originalFileName);
            Files.createDirectories(destinationFile.getParent());
            Files.copy(in, destinationFile);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public InputStream documentInputStream(Long id, String originalFileName) {
        try {
            Path destinationFile = pathFor(id, originalFileName);
            return new FileInputStream(destinationFile.toFile());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public void delete(Long id, String originalFileName) {
        try {
            Path filePath = pathFor(id, originalFileName);
            Files.delete(filePath);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Path pathFor(Long id, String originalFileName) {
        return storageProperties.getPath()
                                .resolve(Long.toString(id / 1000L))
                                .resolve(Long.toString(id % 1000L) + "-" + originalFileName);
    }
}
