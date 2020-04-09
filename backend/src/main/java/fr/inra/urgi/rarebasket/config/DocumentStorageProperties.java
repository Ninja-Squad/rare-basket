package fr.inra.urgi.rarebasket.config;

import java.nio.file.Path;
import javax.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * The properties used for document storage
 * @author JB Nizet
 */
@ConfigurationProperties(prefix = "rare-basket.document-storage")
@Validated
public class DocumentStorageProperties {

    /**
     * The base path where document files are stored on the file system
     */
    @NotNull
    private Path path;

    public DocumentStorageProperties() {
    }

    public DocumentStorageProperties(@NotNull Path path) {
        this.path = path;
    }

    public Path getPath() {
        return path;
    }

    public void setPath(Path path) {
        this.path = path;
    }
}
