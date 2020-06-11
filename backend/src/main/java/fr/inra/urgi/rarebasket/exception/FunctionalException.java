package fr.inra.urgi.rarebasket.exception;

/**
 * An exception thrown to signal a bad request, but with a well-defined error code that is i18ned at client side
 * @author JB Nizet
 */
public class FunctionalException extends BadRequestException {
    public enum Code {
        BASKET_ALREADY_CONFIRMED("The basket is already confirmed"),
        INCORRECT_BASKET_CONFIRMATION_CODE("Incorrect basket confirmation code"),
        ACCESSION_HOLDER_EMAIL_ALREADY_EXISTING("An accession holder with the given email already exists"),
        GRC_NAME_ALREADY_EXISTING("A GRC with the given name already exists"),
        USER_NAME_ALREADY_EXISTING("A user with the given name already exists");

        private final String message;

        Code(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }

    private final Code code;

    public FunctionalException(Code code) {
        super(code.getMessage());
        this.code = code;
    }

    public Code getCode() {
        return code;
    }
}
