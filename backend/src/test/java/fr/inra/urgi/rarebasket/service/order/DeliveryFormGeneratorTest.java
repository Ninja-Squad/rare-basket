package fr.inra.urgi.rarebasket.service.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import org.junit.jupiter.api.Test;

/**
 * Unit test for {@link DeliveryFormGenerator}. It doesn't do much except check that it doesn't crash and
 * open it with PDFReader
 * @author JB Nizet
 */
class DeliveryFormGeneratorTest {
    @Test
    void shouldGenerateDeliveryForm() throws IOException {
        Order order = new Order();
        Basket basket = new Basket();
        basket.setCustomer(new Customer(
            "John Doe",
            "Wheat SA",
            "john.doe@mail.com",
            "5, main street\n76543 New York",
            CustomerType.FARMER,
            SupportedLanguage.ENGLISH
        ));
        basket.setReference("ABCDEFGH");
        order.setBasket(basket);

        order.addItem(new OrderItem(1L, new Accession("rosa", "rosa1"), 12, "bags"));
        order.addItem(new OrderItem(1L, new Accession("violetta", "violetta1"), 10, null));

        AccessionHolder accessionHolder = new AccessionHolder();
        accessionHolder.setName("Contact1");
        Grc grc = new Grc();
        grc.setName("GRC1");
        accessionHolder.setGrc(grc);
        order.setAccessionHolder(accessionHolder);

        byte[] pdf = new DeliveryFormGenerator().generate(order);
        assertThat(pdf).isNotEmpty();
        PdfDocument parsed = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdf)));
        assertThat(parsed.getNumberOfPages()).isEqualTo(1);
    }
}
