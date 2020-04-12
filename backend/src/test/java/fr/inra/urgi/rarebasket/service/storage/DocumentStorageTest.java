package fr.inra.urgi.rarebasket.service.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.file.Path;

import fr.inra.urgi.rarebasket.config.DocumentStorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Unit tests for {@link DocumentStorage}
 * @author JB Nizet
 */
class DocumentStorageTest {
    @TempDir
    Path tempDir;

    private DocumentStorage storage;

    @BeforeEach
    void prepare() {
        storage = new DocumentStorage(new DocumentStorageProperties(tempDir));
    }

    @Test
    void shouldStoreAFile() {
        storage.storeDocument(123_456L, "foo.txt", new ByteArrayInputStream("hello".getBytes()));
        assertThat(tempDir.resolve("123/456-foo.txt")).exists().hasContent("hello");
    }

    @Test
    void shouldReadAFile() {
        storage.storeDocument(123_456L, "foo.txt", new ByteArrayInputStream("hello".getBytes()));
        assertThat(storage.documentInputStream(123_456L, "foo.txt")).hasContent("hello");
    }

    @Test
    void shouldReturnFileSize() {
        storage.storeDocument(123_456L, "foo.txt", new ByteArrayInputStream("hello".getBytes()));
        assertThat(storage.documentSize(123_456L, "foo.txt")).isEqualTo(5L);
    }

    @Test
    void shouldDeleteAFile() {
        storage.storeDocument(123_456L, "foo.txt", new ByteArrayInputStream("hello".getBytes()));
        storage.delete(123_456L, "foo.txt");
        assertThat(tempDir.resolve("123/456-foo.txt")).doesNotExist();
    }
}
