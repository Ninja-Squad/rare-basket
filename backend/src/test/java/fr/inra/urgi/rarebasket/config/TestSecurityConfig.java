package fr.inra.urgi.rarebasket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * The security configuration used in MVC tests, by annotating them with <code>ActiveProfiles("test")</code>.
 * This is necessary because Keycloak Spring support does not work in tests. Yay!
 * @author JB Nizet
 */
@Configuration
@Profile("test")
public class TestSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        SecurityConfig.configureHttp(http);
    }
}
