package fr.inra.urgi.rarebasket.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for email-related stuff
 * @author JB Nizet
 */
@Configuration
@EnableConfigurationProperties(MailProperties.class)
public class MailConfig {
}
