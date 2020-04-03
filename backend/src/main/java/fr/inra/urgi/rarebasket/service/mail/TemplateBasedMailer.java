package fr.inra.urgi.rarebasket.service.mail;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import org.springframework.core.io.ClassPathResource;

/**
 * Base class for mailers which send an email based on mustache templates
 * @author JB Nizet
 */
public class TemplateBasedMailer {

    private final Mailer mailer;

    private final Set<SupportedLanguage> supportedLanguages;
    private final Map<SupportedLanguage, Template> textTemplates;
    private final Map<SupportedLanguage, Template> htmlTemplates;

    public TemplateBasedMailer(
        Mailer mailer,
        Set<SupportedLanguage> supportedLanguages,
        String textResourceName,
        String htmlResourceName) {

        this.supportedLanguages = new HashSet<>(supportedLanguages);
        this.mailer = mailer;

        textTemplates = new HashMap<>();
        htmlTemplates = new HashMap<>();

        for (SupportedLanguage supportedLanguage : supportedLanguages) {
            String textResourcePath = "/mail/" + supportedLanguage.getLanguageCode() + "/" + textResourceName;
            String htmlResourcePath = "/mail/" + supportedLanguage.getLanguageCode() + "/" + htmlResourceName;
            try (BufferedReader textReader =
                     new BufferedReader(
                         new InputStreamReader(
                             new ClassPathResource(textResourcePath, TemplateBasedMailer.class).getInputStream(),
                             StandardCharsets.UTF_8)
                     );
                 BufferedReader htmlReader =
                     new BufferedReader(
                         new InputStreamReader(
                             new ClassPathResource(htmlResourcePath, TemplateBasedMailer.class).getInputStream(),
                             StandardCharsets.UTF_8)
                     )
            ) {
                this.textTemplates.put(supportedLanguage, Mustache.compiler().escapeHTML(false).compile(textReader));
                this.htmlTemplates.put(supportedLanguage, Mustache.compiler().escapeHTML(true).compile(htmlReader));
            }
            catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    protected void sendEmail(SupportedLanguage language,
                             String from,
                             String to,
                             String subject,
                             Object context) {
        if (!supportedLanguages.contains(language)) {
            throw new IllegalArgumentException("Language " + language + " is not one of the supported languages for this mailer");
        }

        String plainText = textTemplates.get(language).execute(context);
        String htmlText = htmlTemplates.get(language).execute(context);

        MailMessage message = new MailMessage(
            from,
            to,
            subject,
            plainText,
            htmlText
        );

        mailer.send(message);
    }
}
