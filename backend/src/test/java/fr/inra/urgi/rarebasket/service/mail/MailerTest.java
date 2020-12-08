package fr.inra.urgi.rarebasket.service.mail;

import static org.mockito.Mockito.*;

import java.io.UnsupportedEncodingException;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

/**
 * Unit tests for {@link Mailer}
 * @author JB Nizet
 */
class MailerTest {
    @Test
    void shouldSendMimeMessage() throws MessagingException, UnsupportedEncodingException {
        JavaMailSender mockJavaMailSender = mock(JavaMailSender.class);
        MimeMessage mockMimeMessage = mock(MimeMessage.class);
        when(mockJavaMailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        MimeMessageHelper mockHelper = mock(MimeMessageHelper.class);
        Mailer mailer = new TestMailer(mockJavaMailSender, mockHelper);

        MailMessage mailMessage = new MailMessage(
            "john@amies.com",
            "Jenny (Gmail)",
            "jenny@gmail.com",
            "Hello",
            "This is plain text",
            "<html><body>This is html text</body></html>"
        );

        mailer.send(mailMessage);

        verify(mockJavaMailSender).send(mockMimeMessage);
        verify(mockHelper).setFrom(mailMessage.getFrom(), mailMessage.getDisplayName());
        verify(mockHelper).setTo(mailMessage.getTo());
        verify(mockHelper).setSubject(mailMessage.getSubject());
        verify(mockHelper).setText(mailMessage.getPlainText(), mailMessage.getHtmlText());
    }

    private static class TestMailer extends Mailer {
        private final MimeMessageHelper mimeMessageHelper;

        public TestMailer(JavaMailSender javaMailSender, MimeMessageHelper mimeMessageHelper) {
            super(javaMailSender);
            this.mimeMessageHelper = mimeMessageHelper;
        }

        @Override
        protected MimeMessageHelper createHelper(MimeMessage mimeMessage) {
            return mimeMessageHelper;
        }
    }
}
