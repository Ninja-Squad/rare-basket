package fr.inra.urgi.rarebasket.config;

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;

/**
 * The security configuration, only active if the profile is not "test", because The Spring Boot Keycloak
 * integration doesn't work in tests. This means that all MVC tests should be annotated with
 * <code>ActiveProfiles("test")</code>.
 *
 * Most of the code in this file comes from this blog post:
 * https://www.thomasvitale.com/spring-security-keycloak/
 *
 * @author JB Nizet
 */
@Profile("!test")
@KeycloakConfiguration
public class SecurityConfig extends KeycloakWebSecurityConfigurerAdapter {

    /**
     * Register KeycloakAuthenticationProvider with the authentication manager.
     * In this way, Keycloak will be responsible for providing authentication services.
     * Spring Security has a convention to handle security roles in a format like ROLE_XX (where XXX is the actual
     * security role name defined in Keycloak).
     */
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) {
        SimpleAuthorityMapper grantedAuthorityMapper = new SimpleAuthorityMapper();
        grantedAuthorityMapper.setPrefix("ROLE_");

        KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(grantedAuthorityMapper);
        auth.authenticationProvider(keycloakAuthenticationProvider);
    }

    /**
     * We do not want to create any session. This should have the expected effect, but unfortunately doesn't.
     * So a session is created anyway (but I don't know why), for nothing.
     * If a session is necessary, replace the implementation by
     * <code>return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());</code>
     */
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new NullAuthenticatedSessionStrategy();
    }

    /**
     * Configure the HTTP security.
     * This is done by delegating to the standard Keycloak configuration for the technical part,
     * and then by calling {@link #configure(HttpSecurity)} for the functional part.
     * This public static method is there to allow the configuration used in MVC tests to use the
     * same functional configuration by also calling this public static method.
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        configureHttp(http);
    }

    /**
     * Configures the functional (i.e. application-specific) part of the http security. This method is
     * also called by the security configuration used in MVC tests, to share the same configuration
     * (keycloak excepted) in tests and in production.
     */
    public static void configureHttp(HttpSecurity http) throws Exception {
        http.csrf().disable();
        http.authorizeRequests()
            .antMatchers("/api/orders/**").authenticated()
            .antMatchers("/api/users/**").authenticated()
            .anyRequest().permitAll();
    }
}

