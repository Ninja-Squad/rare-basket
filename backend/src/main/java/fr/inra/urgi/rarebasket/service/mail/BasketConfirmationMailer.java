package fr.inra.urgi.rarebasket.service.mail;

import java.util.Objects;

import fr.inra.urgi.rarebasket.config.MailProperties;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.service.event.BasketSaved;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Mailer used to send a confirmation email containing a secret code when someone saves a basket
 * @author JB Nizet
 */
@Component
public class BasketConfirmationMailer extends TemplateBasedMailer {
    private final BasketDao basketDao;
    private final MailProperties mailProperties;

    public BasketConfirmationMailer(Mailer mailer, BasketDao basketDao, MailProperties mailProperties) {
        super(mailer, "/mail/basket-confirmation.text.mustache", "/mail/basket-confirmation.html.mustache");
        this.basketDao = basketDao;
        this.mailProperties = mailProperties;
    }

    @TransactionalEventListener(BasketSaved.class)
    public void onBasketSaved(BasketSaved event) {
        basketDao.findById(event.getBasketId()).ifPresent(basket -> {
            BasketConfirmationContext context =
                new BasketConfirmationContext(basket.getCustomer().getName(),
                                              basket.getReference(),
                                              basket.getConfirmationCode(),
                                              String.format("%s/baskets/%s/confirmation?code=%s",
                                                            mailProperties.getBaseUrl(),
                                                            basket.getReference(),
                                                            basket.getConfirmationCode()));
            sendEmail(
                mailProperties.getFrom(),
                basket.getCustomer().getEmail(),
                "Votre commande " + basket.getReference() + " : confirmation",
                context
            );
        });
    }

    private static final class BasketConfirmationContext {
        private final String customerName;
        private final String basketReference;
        private final String confirmationCode;
        private final String confirmationUrl;

        public BasketConfirmationContext(String customerName,
                                         String basketReference,
                                         String confirmationCode,
                                         String confirmationUrl) {
            this.customerName = customerName;
            this.basketReference = basketReference;
            this.confirmationCode = confirmationCode;
            this.confirmationUrl = confirmationUrl;
        }

        public String getCustomerName() {
            return customerName;
        }

        public String getBasketReference() {
            return basketReference;
        }

        public String getConfirmationCode() {
            return confirmationCode;
        }

        public String getConfirmationUrl() {
            return confirmationUrl;
        }
    }
}
