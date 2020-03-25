package fr.inra.urgi.rarebasket.service.event;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Component which abstracts away the Spring `ApplicationEventPublisher` and makes it easier to mock with Mockito
 * @author JB Nizet
 */
@Component
public class EventPublisher {
    private final ApplicationEventPublisher publisher;

    public EventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publish(Object event) {
        publisher.publishEvent(event);
    }
}
