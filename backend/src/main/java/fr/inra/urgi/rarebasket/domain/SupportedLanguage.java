package fr.inra.urgi.rarebasket.domain;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * The languages that the application supports.
 * Note that this enum, when being serialized and deserialized to JSON, uses the language code (i.e. "en", "fr").
 * @author JB Nizet
 */
public enum SupportedLanguage {
    FRENCH("fr"),
    ENGLISH("en");

    private final String languageCode;
    private final Locale locale;

    SupportedLanguage(String languageCode) {
        this.languageCode = languageCode;
        this.locale = new Locale(languageCode);
    }

    @JsonValue
    public String getLanguageCode() {
        return languageCode;
    }

    public Locale getLocale() {
        return locale;
    }
}
