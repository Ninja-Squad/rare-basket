package fr.inra.urgi.rarebasket.service.mail;

import java.util.EnumSet;

import fr.inra.urgi.rarebasket.config.MailProperties;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.event.OrderCreated;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Mailer used to send an email to the accession holder of an order when it's created, i.e.
 * when the customer has confirmed a basket.
 * @author JB Nizet
 */
@Component
public class OrderCreatedMailer extends TemplateBasedMailer {
    private final OrderDao orderDao;
    private final MailProperties mailProperties;

    public OrderCreatedMailer(Mailer mailer, OrderDao orderDao, MailProperties mailProperties) {
        super(mailer,
              EnumSet.of(SupportedLanguage.FRENCH),
              "order-created.text.mustache",
              "order-created.html.mustache");
        this.orderDao = orderDao;
        this.mailProperties = mailProperties;
    }

    @TransactionalEventListener(OrderCreated.class)
    public void onOrderCreated(OrderCreated event) {
        orderDao.findById(event.getOrderId()).ifPresent(order -> {
            OrderCreatedContext context =
                new OrderCreatedContext(order.getBasket().getReference(),
                                        String.format("%s/orders/%d",
                                                      mailProperties.getBaseUrl(),
                                                      order.getId()));
            sendEmail(
                SupportedLanguage.FRENCH,
                mailProperties.getFrom(),
                mailProperties.getDisplayName(),
                order.getAccessionHolder().getEmail(),
                "Nouvelle commande d'accessions " + order.getBasket().getReference(),
                context
            );
        });
    }

    private static final class OrderCreatedContext {
        private final String basketReference;
        private final String orderUrl;

        public OrderCreatedContext(String basketReference, String orderUrl) {
            this.basketReference = basketReference;
            this.orderUrl = orderUrl;
        }

        public String getBasketReference() {
            return basketReference;
        }

        public String getOrderUrl() {
            return orderUrl;
        }
    }
}
