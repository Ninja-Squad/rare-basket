package fr.inra.urgi.rarebasket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The security configuration used in MVC tests, by annotating them with <code>ActiveProfiles("test")</code>.
 * This is necessary because Keycloak Spring support does not work in tests. Yay!
 *
 * (see https://issues.redhat.com/browse/KEYCLOAK-6163, https://issues.redhat.com/browse/KEYCLOAK-4814)
 *
 * @author JB Nizet
 */
@Configuration
@Profile("test")
public class TestSecurityConfig implements WebMvcConfigurer {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        SecurityConfig.configureHttp(http);
        return http.build();
    }
}
