package fr.inra.urgi.rarebasket.config;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Properties class used to hold email-related properties
 * @author JB Nizet
 */
@ConfigurationProperties(prefix = "rare-basket.mail")
@Validated
public class MailProperties {
    @NotBlank
    @Email
    private String from;

    private String displayName;

    /**
     * The base URL of the application, without a trailing `/`
     */
    @NotBlank
    @Pattern(regexp = ".*[^/]$", message = "must not have a trailing /")
    private String baseUrl;

    public MailProperties() {
    }

    public MailProperties(String from, String baseUrl) {
        this.from = from;
        this.baseUrl = baseUrl;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
