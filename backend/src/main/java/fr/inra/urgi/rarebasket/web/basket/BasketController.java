package fr.inra.urgi.rarebasket.web.basket;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
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
    private final SecureRandom random;

    public BasketController(BasketDao basketDao) {
        this.basketDao = basketDao;
        try {
            this.random = SecureRandom.getInstance("SHA1PRNG");
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    @GetMapping("/{basketId}")
    public BasketDTO get(@PathVariable("basketId") Long basketId) {
        Basket basket = basketDao.findById(basketId).orElseThrow(NotFoundException::new);
        return new BasketDTO(basket);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BasketDTO create(@Validated @RequestBody BasketCommandDTO command) {
        Basket basket = basketDao.save(new Basket(generateRandomReference(), command.getEmail(), BasketStatus.DRAFT));
        return new BasketDTO(basket);
    }

    private String generateRandomReference() {
        byte[] randomBytes = new byte[16];
        random.nextBytes(randomBytes);
        return Base64.getUrlEncoder().encodeToString(randomBytes);
    }
}
