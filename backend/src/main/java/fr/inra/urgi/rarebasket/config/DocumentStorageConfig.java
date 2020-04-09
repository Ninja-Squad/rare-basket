package fr.inra.urgi.rarebasket.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for document storage related stuff
 * @author JB Nizet
 */
@Configuration
@EnableConfigurationProperties(DocumentStorageProperties.class)
public class DocumentStorageConfig {
}
