package fr.inra.urgi.rarebasket.service.mail;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import org.springframework.core.io.ClassPathResource;

/**
 * Base class for mailers which send an email based on mustache templates
 * @author JB Nizet
 */
public class TemplateBasedMailer {

    private final Mailer mailer;
    private final String textResourcePath;
    private final String htmlResourcePath;

    private Template textTemplate;
    private Template htmlTemplate;

    public TemplateBasedMailer(Mailer mailer, String textResourcePath, String htmlResourcePath) {
        this.mailer = mailer;
        this.textResourcePath = textResourcePath;
        this.htmlResourcePath = htmlResourcePath;

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
            this.textTemplate = Mustache.compiler().escapeHTML(false).compile(textReader);
            this.htmlTemplate = Mustache.compiler().escapeHTML(true).compile(htmlReader);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    protected void sendEmail(String from, String to, String subject, Object context) {
        String plainText = textTemplate.execute(context);
        String htmlText = htmlTemplate.execute(context);

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
