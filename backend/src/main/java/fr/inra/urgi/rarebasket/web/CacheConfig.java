package fr.inra.urgi.rarebasket.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class used to cache static JS and CSS resources forever (since their name changes every time
 * their content changes)
 * @author JB Nizet
 */
@Configuration
public class CacheConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("*.js", "*.css")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(Integer.MAX_VALUE);
    }
}

