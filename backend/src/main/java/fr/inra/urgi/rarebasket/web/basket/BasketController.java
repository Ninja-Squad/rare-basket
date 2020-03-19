package fr.inra.urgi.rarebasket.web.basket;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.GrcContactDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.GrcContact;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller used to handle baskets
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/baskets")
@Transactional
public class BasketController {

    private final BasketDao basketDao;
    private final GrcContactDao grcContactDao;
    private final SecureRandom random;

    private static final String REFERENCE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public BasketController(BasketDao basketDao, GrcContactDao grcContactDao) {
        this.basketDao = basketDao;
        this.grcContactDao = grcContactDao;
        try {
            this.random = SecureRandom.getInstance("SHA1PRNG");
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /**
     * Endpoint used by RARe to submit a basket, i.e. create a new draft basket that the customer will then have
     * to complete and save (or cancel)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BasketDTO create(@Validated @RequestBody BasketCommandDTO command) {
        Basket basket = createBasket(command);
        basketDao.save(basket);
        return new BasketDTO(basket);
    }

    /**
     * Endpoint used by rare-basket to get a basket by its secret reference. Once RARe has created a draft basket,
     * it redirects the user to a rare-basket URL containing the generated secret reference, so that the customer
     * can edit the basket (i.e. fill the customer information, the quantities, etc.)
     */
    @GetMapping("/{basketReference}")
    public BasketDTO get(@PathVariable("basketReference") String basketReference) {
        Basket basket = basketDao.findByReference(basketReference).orElseThrow(NotFoundException::new);
        return new BasketDTO(basket);
    }

    private Basket createBasket(BasketCommandDTO command) {
        Basket basket = new Basket();
        basket.setReference(generateRandomReference());
        basket.setStatus(BasketStatus.DRAFT);

        Map<String, GrcContact> contactsByEmail = new HashMap<>();
        command.getItems().forEach(itemCommand -> {
            BasketItem item = new BasketItem();
            item.setAccession(itemCommand.getAccession());
            GrcContact contact = contactsByEmail.computeIfAbsent(
                itemCommand.getContactEmail(),
                email -> grcContactDao.findByEmail(itemCommand.getContactEmail())
                                      .orElseThrow(() -> new BadRequestException("No GRC contact with email " + email))
            );
            item.setContact(contact);
            basket.addItem(item);
        });
        return basket;
    }

    private String generateRandomReference() {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            builder.append(REFERENCE_CHARACTERS.charAt(random.nextInt(REFERENCE_CHARACTERS.length())));
        };
        return builder.toString();
    }
}
