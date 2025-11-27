package fr.inra.urgi.rarebasket.exception;

import java.util.Map;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.webmvc.error.DefaultErrorAttributes;
import org.springframework.web.context.request.WebRequest;

/**
 * Custom error attributes containing an additional <code>functionalError</code> attribute
 * @author JB Nizet
 */
class CustomErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, ErrorAttributeOptions options) {
        Map<String, Object> result = super.getErrorAttributes(webRequest, options);

        Throwable error = getError(webRequest);
        if (error instanceof FunctionalException) {
            result.put("functionalError", ((FunctionalException) error).getCode());
        }

        return result;
    }
}
