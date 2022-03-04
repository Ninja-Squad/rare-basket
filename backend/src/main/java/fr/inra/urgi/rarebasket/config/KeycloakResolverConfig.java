package fr.inra.urgi.rarebasket.config;

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration class used to configure the keycloak configuration resolver.
 * This bean can't be in {@link SecurityConfig} otherwise there is a circular dependency.
 * @author JB Nizet
 */
@Profile("!test")
@Configuration
public class KeycloakResolverConfig {
    /**
     * This makes sure that the keycloak configuration is read from the standard Spring Boot
     * location (application.yml in our case) rather that the keycloak.json file
     */
    @Bean
    public KeycloakSpringBootConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
}
