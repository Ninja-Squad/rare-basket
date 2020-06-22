package fr.inra.urgi.rarebasket.service.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.context.support.ResourceBundleMessageSource;

/**
 * Unit test for {@link DeliveryFormGenerator}. It doesn't do much except check that it doesn't crash and
 * open it with PDFReader
 * @author JB Nizet
 */
class DeliveryFormGeneratorTest {
    @ParameterizedTest
    @EnumSource(SupportedLanguage.class)
    void shouldGenerateDeliveryForm(SupportedLanguage language) throws IOException {
        Order order = new Order();
        Basket basket = new Basket();
        basket.setCustomer(new Customer(
                "John Doe",
                "Wheat SA",
                "john.doe@mail.com",
                "5, main street\n76543 New York",
                "5, main street - billing service\n76543 New York",
                CustomerType.FARMER,
                language
        ));
        basket.setReference("ABCDEFGH");
        basket.setConfirmationInstant(Instant.now().minus(10, ChronoUnit.DAYS));
        order.setBasket(basket);

        order.addItem(new OrderItem(1L, new Accession("rosa", "rosa1"), 12, "bags"));
        order.addItem(new OrderItem(1L, new Accession("violetta", "violetta1"), 10, null));

        Document document = new Document();
        document.setType(DocumentType.MTA);;
        order.addDocument(document);

        AccessionHolder accessionHolder = new AccessionHolder();
        accessionHolder.setName("Contact1");
        accessionHolder.setEmail("contact1@mail.com");
        accessionHolder.setPhone("0123456789");
        Grc grc = new Grc();
        grc.setName("GRC1");
        grc.setAddress("13, rue du Louvres\n75000 Paris");
        grc.setInstitution("INRAE");
        accessionHolder.setGrc(grc);
        order.setAccessionHolder(accessionHolder);

        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        byte[] pdf = new DeliveryFormGenerator(messageSource).generate(order);
        assertThat(pdf).isNotEmpty();
        PdfDocument parsed = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdf)));
        assertThat(parsed.getNumberOfPages()).isEqualTo(1);
    }

    @ParameterizedTest
    @EnumSource(SupportedLanguage.class)
    void shouldHaveTranslationForEveryDocumentType(SupportedLanguage language) {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        for (DocumentType documentType : DocumentType.values()) {
            assertThat(messageSource.getMessage(
                "delivery-form.document-type." + documentType.name(),
                null,
                language.getLocale())
            ).isNotNull();
        }
    }
}
