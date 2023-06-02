package fr.inra.urgi.rarebasket.exception;

import java.util.Set;
import java.util.stream.Collectors;
import jakarta.validation.ConstraintViolation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception used to signal a bad request (HTTP status 400)
 * @author JB Nizet
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }

    public static <T> BadRequestException fromViolations(Set<ConstraintViolation<T>> violations) {
        return new BadRequestException(createMessage(violations));
    }

    private static <T> String createMessage(Set<ConstraintViolation<T>> violations) {
        return violations.stream()
                         .map(violation -> violation.getPropertyPath().toString()
                             + ": "
                             + violation.getMessage())
                         .collect(Collectors.joining("; "));
    }
}
