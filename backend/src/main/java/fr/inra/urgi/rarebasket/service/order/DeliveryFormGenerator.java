package fr.inra.urgi.rarebasket.service.order;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.ListItem;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import fr.inra.urgi.rarebasket.config.Constants;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.DocumentType;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Generator for PDF delivery forms.
 * @author JB Nizet
 */
@Component
public class DeliveryFormGenerator {

    private static final float ONE_MILLIMETER = 2.8346456692913F;

    private final MessageSource messageSource;

    public DeliveryFormGenerator(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public byte[] generate(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter pdfWriter = new PdfWriter(out);
        PdfDocument pdfDoc = new PdfDocument(pdfWriter);

        try (Document doc = new Document(pdfDoc, PageSize.A4)) {
            doc.add(createTitle(order))
               .add(createHeaderTable(order))
               .add(createAccessionTable(order));

        }
        return out.toByteArray();
    }

    private Paragraph createTitle(Order order) {
        return new Paragraph(
            messageSource.getMessage("delivery-form.title",
                                     null,
                                     order.getBasket().getCustomer().getLanguage().getLocale())
        )
            .setMarginBottom(12F)
            .setFontSize(24F);
    }

    private Table createHeaderTable(Order order) {
        return new Table(
            new UnitValue[]{
                UnitValue.createPercentValue(50),
                UnitValue.createPercentValue(50),
                }
        )
            .useAllAvailableWidth()
            .addCell(createLeftHeaderCell(order))
            .addCell(createRightHeaderCell(order))
            .setMarginBottom(12F);
    }

    private Cell createLeftHeaderCell(Order order) {
        Locale locale = order.getBasket().getCustomer().getLanguage().getLocale();
        return new Cell().setBorder(Border.NO_BORDER)
                         .add(
                new Paragraph(
                    messageSource.getMessage("delivery-form.supplier",
                                             null,
                                             locale)
                )
                    .setFontSize(14F)
                    .simulateBold()
                    .setMarginBottom(6F)
            )
                         .add(
                new Paragraph(
                order.getAccessionHolder().getGrc().getName()
                    + " – "
                    + order.getAccessionHolder().getGrc().getInstitution()
                )
            )
                         .add(new Paragraph(order.getAccessionHolder().getName()))
                         .add(new Paragraph(order.getAccessionHolder().getGrc().getAddress()))
                         .add(new Paragraph(order.getAccessionHolder().getEmail()))
                         .add(new Paragraph(order.getAccessionHolder().getPhone()))
                         .add(
                new Div()
                    .setWidth(42 * ONE_MILLIMETER)
                    .setHeight(42 * ONE_MILLIMETER)
                    .setPadding(3 * ONE_MILLIMETER)
                    .setBorder(new DashedBorder(ColorConstants.LIGHT_GRAY, 1F))
                    .setMargin(7 * ONE_MILLIMETER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .add(
                        // this is not i18ned because the message is for the accession holder, not for the customer
                        new Paragraph("Emplacement pour coller la vignette (phyto)sanitaire")
                            .setFontColor(ColorConstants.LIGHT_GRAY)
                            .setTextAlignment(TextAlignment.CENTER)
                    )
            );
    }

    private Cell createRightHeaderCell(Order order) {
        Cell cell =  new Cell()
            .setBorder(Border.NO_BORDER)
            .add(
                new Paragraph()
                    .add(
                        new Text(messageSource.getMessage(
                            "delivery-form.order-date",
                                  null,
                                  order.getBasket().getCustomer().getLanguage().getLocale())
                        ).simulateBold()
                    )
                    .add(formatInstant(order.getBasket().getConfirmationInstant(), order))
            )
            .add(
                new Paragraph()
                    .add(new Text(
                        messageSource.getMessage(
                            "delivery-form.order-number",
                            null,
                            order.getBasket().getCustomer().getLanguage().getLocale())
                    ).simulateBold())
                    .add(order.getBasket().getReference())
            )
            .add(
                new Paragraph()
                    .add(new Text(messageSource.getMessage(
                        "delivery-form.delivery-date",
                        null,
                        order.getBasket().getCustomer().getLanguage().getLocale())).simulateBold())
                    .add(formatInstant(Instant.now(), order))
            );

        addDocuments(cell, order);

        cell.add(
                new Paragraph(
                    messageSource.getMessage(
                        "delivery-form.recipient",
                        null,
                        order.getBasket().getCustomer().getLanguage().getLocale())
                )
                    .setFontSize(14F)
                    .simulateBold()
                    .setMarginTop(6F)
                    .setMarginBottom(6F)
            )
            .add(new Paragraph(order.getBasket().getCustomer().getName()));

        if (StringUtils.hasText(order.getBasket().getCustomer().getOrganization())) {
            cell.add(new Paragraph(order.getBasket().getCustomer().getOrganization()));
        }
        cell.add(new Paragraph(order.getBasket().getCustomer().getDeliveryAddress()))
            .add(new Paragraph(order.getBasket().getCustomer().getEmail()));

        return cell;
    }

    private void addDocuments(Cell cell, Order order) {
        Map<DocumentType, List<fr.inra.urgi.rarebasket.domain.Document>> documentsByType =
            order.getDocuments()
                 .stream()
                 .filter(fr.inra.urgi.rarebasket.domain.Document::isOnDeliveryForm)
                 .sorted(Comparator.comparing(fr.inra.urgi.rarebasket.domain.Document::getCreationInstant))
                 .collect(Collectors.groupingBy(fr.inra.urgi.rarebasket.domain.Document::getType,
                                                TreeMap::new,
                                                Collectors.toList()));
        if (!documentsByType.isEmpty()) {
            cell.add(
                new Paragraph()
                    .add(new Text(messageSource.getMessage(
                        "delivery-form.documents",
                        null,
                        order.getBasket().getCustomer().getLanguage().getLocale())).simulateBold())
            );

            com.itextpdf.layout.element.List documentList = new com.itextpdf.layout.element.List().setFontSize(10F);
            documentsByType.forEach((docType, docs) -> {
                for (int i = 0; i < docs.size(); i++) {
                    StringBuilder text = new StringBuilder(
                        messageSource.getMessage(
                            "document-type." + docType.name(),
                            null,
                            order.getBasket().getCustomer().getLanguage().getLocale())
                    );
                    if (docs.size() > 1) {
                        text.append(" (").append(i + 1).append(')');
                    }
                    if (StringUtils.hasText(docs.get(i).getDescription())) {
                        text.append(" – ").append(docs.get(i).getDescription());
                    }
                    documentList.add(new ListItem(text.toString()));
                }
            });
            cell.add(documentList);
        }
    }

    private Table createAccessionTable(Order order) {
        Table table = new Table(new UnitValue[]{
            UnitValue.createPercentValue(25),
            UnitValue.createPercentValue(25),
            UnitValue.createPercentValue(25),
            UnitValue.createPercentValue(25),
            })
            .useAllAvailableWidth();

        Locale locale = order.getBasket().getCustomer().getLanguage().getLocale();
        table.addCell(
            createAccessionHeadingCell()
                .add(new Paragraph(messageSource.getMessage("delivery-form.name-heading", null, locale)))
                .setPaddingRight(6F)
        );
        table.addCell(
            createAccessionHeadingCell()
                .add(new Paragraph(messageSource.getMessage("delivery-form.accession-number-heading", null, locale)))
                .setPaddingRight(6F)
        );
        table.addCell(
            createAccessionHeadingCell()
                .add(new Paragraph(messageSource.getMessage("delivery-form.taxon-heading", null, locale)))
                .setPaddingRight(6F)
        );
        table.addCell(
            createAccessionHeadingCell()
                .add(new Paragraph(messageSource.getMessage("delivery-form.quantity-heading", null, locale)))
        );

        order.getItems()
             .stream()
             .sorted(Comparator.comparing(OrderItem::getAccession))
             .forEach(orderItem -> {
                 Accession accession = orderItem.getAccession();
                 Paragraph accessionName = new Paragraph()
                     .add(accession.getName());
                 if (StringUtils.hasText(accession.getIdentifier()) && !StringUtils.hasText(accession.getTaxon())) {
                     accessionName = accessionName
                         .add(" ")
                         .add(new Text(accession.getIdentifier())
                                  .setFontSize(10F)
                                  .setFontColor(ColorConstants.GRAY)
                         );
                 }

                 table.addCell(
                     createAccessionCell()
                         .add(accessionName)
                         .setPaddingRight(6F)
                 );
                 table.addCell(
                     createAccessionCell()
                         .add(
                             new Paragraph(
                                 accession.getAccessionNumber() == null ? "" : accession.getAccessionNumber()
                             )
                         )
                         .setPaddingRight(6F)
                 );
                 table.addCell(
                     createAccessionCell()
                         .add(
                             new Paragraph(
                                 accession.getTaxon() == null ? "" : accession.getTaxon()
                             )
                         )
                         .setPaddingRight(6F)
                 );
                 table.addCell(
                     createAccessionCell()
                         .add(
                             new Paragraph(
                                 ((orderItem.getQuantity() == null ? "" : orderItem.getQuantity())
                                     + (orderItem.getUnit() == null ? "" : " " + orderItem.getUnit())).trim()
                             )
                         )
                 );
             });

        return table;
    }

    private Cell createAccessionHeadingCell() {
        return createAccessionCell().simulateBold();
    }

    private Cell createAccessionCell() {
        return new Cell().setBorderLeft(null).setBorderRight(null);
    }

    private String formatInstant(Instant instant, Order order) {
        return DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT)
                                .withLocale(order.getBasket().getCustomer().getLanguage().getLocale())
                                .format(instant.atZone(Constants.FRANCE_TIMEZONE));
    }
}
