package fr.inra.urgi.rarebasket.service.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Optional;

import fr.inra.urgi.rarebasket.config.MailProperties;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.GrcContact;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.service.event.OrderCreated;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * Tests for {@link OrderCreatedMailer}
 * @author JB Nizet
 */
class OrderCreatedMailerTest {
    @Test
    void shouldSendOrderCreatedEmail() {
        Mailer mockMailer = mock(Mailer.class);
        OrderDao mockOrderDao = mock(OrderDao.class);

        MailProperties mailProperties = new MailProperties("noreply@rare-basket.fr", "http://localhost:4201");
        OrderCreatedMailer orderCreatedMailer =
            new OrderCreatedMailer(mockMailer, mockOrderDao, mailProperties);

        Basket basket = new Basket();
        basket.setReference("ABCDEFGH");
        Order order = new Order(42L);
        order.setBasket(basket);
        GrcContact contact = new GrcContact();
        contact.setEmail("contact@grc.com");
        order.setContact(contact);

        OrderCreated event = new OrderCreated(order.getId());
        when(mockOrderDao.findById(event.getOrderId())).thenReturn(Optional.of(order));

        orderCreatedMailer.onOrderCreated(event);

        ArgumentCaptor<MailMessage> sentMessageCaptor = ArgumentCaptor.forClass(MailMessage.class);

        verify(mockMailer).send(sentMessageCaptor.capture());

        MailMessage sentMessage = sentMessageCaptor.getValue();
        assertThat(sentMessage.getFrom()).isEqualTo(mailProperties.getFrom());
        assertThat(sentMessage.getTo()).isEqualTo(contact.getEmail());
        assertThat(sentMessage.getSubject()).contains(basket.getReference());
        assertThat(sentMessage.getPlainText())
            .contains(basket.getReference())
            .contains("http://localhost:4201/orders/42");
        assertThat(sentMessage.getHtmlText())
            .contains(basket.getReference())
            .contains("http://localhost:4201/orders/42");
    }
}
