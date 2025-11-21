package fr.inra.urgi.rarebasket.dao;

import java.time.Instant;
import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;

/**
 * An object returned by the reporting queries of the {@link OrderDao}
 * @author JB Nizet
 */
public record ReportingOrder(
    Long orderId,
    String basketReference,
    String customerEmail,
    CustomerType customerType,
    SupportedLanguage customerLanguage,
    Instant basketConfirmationInstant,
    String grcName,
    String accessionHolderName,
    OrderStatus status,
    Instant finalizationInstant,
    String accessionName,
    String accessionNumber,
    String accessionTaxon,
    Integer accessionQuantity,
    String accessionUnit
) {}
