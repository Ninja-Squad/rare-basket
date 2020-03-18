package fr.inra.urgi.rarebasket;

import java.util.function.Consumer;

import org.mockito.stubbing.Answer;

/**
 * More Mockito answers
 * @author JB Nizet
 */
public final class MoreAnswers {
    public static <T> Answer<T> firstArgWith(Consumer<T> consumer) {
        return invocation -> {
            T argument = invocation.<T>getArgument(0);
            consumer.accept(argument);
            return argument;
        };
    }
}
