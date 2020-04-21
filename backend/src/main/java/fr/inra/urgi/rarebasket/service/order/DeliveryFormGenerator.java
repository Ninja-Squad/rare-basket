package fr.inra.urgi.rarebasket.service.order;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Comparator;
import java.util.Locale;
import java.util.StringJoiner;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import org.springframework.stereotype.Component;

/**
 * Generator for PDF delivery forms.
 * @author JB Nizet
 */
@Component
public class DeliveryFormGenerator {
    public byte[] generate(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter pdfWriter = new PdfWriter(out);
        PdfDocument pdfDoc = new PdfDocument(pdfWriter);

        try (Document doc = new Document(pdfDoc, PageSize.A4)) {
            doc.add(
                new Paragraph(order.getAccessionHolder().getGrc().getName()
                                  + " - "
                                  + order.getAccessionHolder().getName())
                    .setMarginBottom(6F)
            ).add(
                new Paragraph("à").setMarginBottom(12F)
            ).add(
                new Paragraph(
                    new StringJoiner("\n")
                        .add(order.getBasket().getCustomer().getName())
                        .add(order.getBasket().getCustomer().getAddress())
                        .toString()
                ).setMarginBottom(12F)
            ).add(
                new Paragraph(
                    "Le " + LocalDate.now()
                                     .format(DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG)
                                                              .withLocale(Locale.FRENCH))
                )
                    .setMarginBottom(60F)
                    .setTextAlignment(TextAlignment.RIGHT)
            ).add(
                new Paragraph("Votre commande " + order.getBasket().getReference())
                    .setBold()
                    .setMarginBottom(6F)
            );

            Table table = new Table(new UnitValue[] {
                UnitValue.createPercentValue(75),
                UnitValue.createPercentValue(25),
            })
                .useAllAvailableWidth();

            order.getItems()
                 .stream()
                 .sorted(Comparator.comparing(OrderItem::getAccession))
                 .forEach(orderItem -> {
                     table.addCell(
                         createCell()
                            .add(
                                new Paragraph()
                                    .add(orderItem.getAccession().getName())
                                    .add(" ")
                                    .add(new Text(orderItem.getAccession().getIdentifier())
                                             .setFontSize(10F)
                                             .setFontColor(ColorConstants.GRAY)
                                    )
                            )
                            .setPaddingRight(6F)
                     );
                     table.addCell(
                         createCell()
                         .add(
                             new Paragraph(
                                 orderItem.getQuantity()
                                     + (orderItem.getUnit() == null ? "" : " " + orderItem.getUnit())
                             )
                         )
                     );
                 });

            doc.add(table);
        }

        return out.toByteArray();
    }

    private Cell createCell() {
        return new Cell().setBorderLeft(null).setBorderRight(null);
    }
}
