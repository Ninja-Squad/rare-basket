package fr.inra.urgi.rarebasket.service.event;

import java.util.Objects;

/**
 * Event fired when an event has been saved, used to trigger the sending of an email
 * after the transaction has been committed
 * @author JB Nizet
 */
public final class BasketSaved {
    private final Long basketId;

    public BasketSaved(Long basketId) {
        this.basketId = basketId;
    }

    public Long getBasketId() {
        return basketId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BasketSaved)) {
            return false;
        }
        BasketSaved that = (BasketSaved) o;
        return Objects.equals(basketId, that.basketId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(basketId);
    }

    @Override
    public String toString() {
        return "BasketSaved{" +
            "basketId='" + basketId + '\'' +
            '}';
    }
}
