package fr.inra.urgi.rarebasket.service.mail;

import java.util.Objects;

/**
 * A mail message
 * @author JB Nizet
 */
public class MailMessage {
    private final String from;
    private final String to;
    private final String subject;
    private final String plainText;
    private final String htmlText;

    public MailMessage(String from, String to, String subject, String plainText, String htmlText) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.plainText = plainText;
        this.htmlText = htmlText;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }

    public String getSubject() {
        return subject;
    }

    public String getPlainText() {
        return plainText;
    }

    public String getHtmlText() {
        return htmlText;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MailMessage)) {
            return false;
        }
        MailMessage that = (MailMessage) o;
        return Objects.equals(from, that.from) &&
            Objects.equals(to, that.to) &&
            Objects.equals(subject, that.subject) &&
            Objects.equals(plainText, that.plainText) &&
            Objects.equals(htmlText, that.htmlText);
    }

    @Override
    public int hashCode() {
        return Objects.hash(from, to, subject, plainText, htmlText);
    }

    @Override
    public String toString() {
        return "MailMessage{" +
            "from='" + from + '\'' +
            ", to='" + to + '\'' +
            ", subject='" + subject + '\'' +
            ", plainText='" + plainText + '\'' +
            ", htmlText='" + htmlText + '\'' +
            '}';
    }
}
