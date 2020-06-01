package fr.inra.urgi.rarebasket.util;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * Utility class to generate random references
 * @author JB Nizet
 */
public final class References {

    private static final String REFERENCE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM;

    static {
        try {
            RANDOM = SecureRandom.getInstance("SHA1PRNG");
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private References(){
    }

    public static String generateRandomReference() {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            builder.append(REFERENCE_CHARACTERS.charAt(RANDOM.nextInt(REFERENCE_CHARACTERS.length())));
        }
        return builder.toString();
    }
}
