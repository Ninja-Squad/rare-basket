package fr.inra.urgi.rarebasket.service.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Optional;

import fr.inra.urgi.rarebasket.config.MailProperties;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.service.event.BasketSaved;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * Tests for {@link BasketConfirmationMailer}
 * @author JB Nizet
 */
class BasketConfirmationMailerTest {

    @Test
    void shouldSendBasketConfirmationEmail() {
        Mailer mockMailer = mock(Mailer.class);
        BasketDao mockBasketDao = mock(BasketDao.class);

        MailProperties mailProperties = new MailProperties("noreply@rare-basket.fr", "http://localhost:4200");
        BasketConfirmationMailer basketConfirmationMailer =
            new BasketConfirmationMailer(mockMailer, mockBasketDao, mailProperties);

        Basket basket = new Basket(42L);
        basket.setReference("ABCDEFGH");
        basket.setConfirmationCode("ZYXWVUTS");
        basket.setCustomer(new Customer("John", "john@mail.com", "address", CustomerType.FARMER));
        BasketSaved event = new BasketSaved(basket.getId());
        when(mockBasketDao.findById(event.getBasketId())).thenReturn(Optional.of(basket));

        basketConfirmationMailer.onBasketSaved(event);

        ArgumentCaptor<MailMessage> sentMessageCaptor = ArgumentCaptor.forClass(MailMessage.class);

        verify(mockMailer).send(sentMessageCaptor.capture());

        MailMessage sentMessage = sentMessageCaptor.getValue();
        assertThat(sentMessage.getFrom()).isEqualTo(mailProperties.getFrom());
        assertThat(sentMessage.getTo()).isEqualTo(basket.getCustomer().getEmail());
        assertThat(sentMessage.getSubject()).contains(basket.getReference());
        assertThat(sentMessage.getPlainText())
            .contains(basket.getCustomer().getName())
            .contains(basket.getReference())
            .contains(basket.getConfirmationCode())
            .contains("http://localhost:4200/baskets/ABCDEFGH/confirmation?code=ZYXWVUTS");
        assertThat(sentMessage.getHtmlText())
            .contains(basket.getCustomer().getName())
            .contains(basket.getReference())
            .contains(basket.getConfirmationCode())
            .contains("http://localhost:4200/baskets/ABCDEFGH/confirmation?code=ZYXWVUTS");
    }
}
