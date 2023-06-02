package fr.inra.urgi.rarebasket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The security configuration, only active if the profile is not "test", because The Spring Boot Keycloak
 * integration doesn't work in tests. This means that all MVC tests should be annotated with
 * <code>ActiveProfiles("test")</code>.
 *
 * @author JB Nizet
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(configurer -> configurer.disable())
            .sessionManagement(customizer -> customizer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(
                customizer -> customizer.requestMatchers("/api/baskets/**").permitAll()
                                        .requestMatchers("/api/**").authenticated()
                                        .anyRequest().permitAll()
            )
            .oauth2ResourceServer(
            customizer -> customizer.jwt(
                jwtCustomizer -> jwtCustomizer.jwtAuthenticationConverter(
                    source -> new JwtAuthenticationToken(source, null, source.getClaimAsString("preferred_username"))
                )
            )
        );
        return http.build();
    }

    public static void configureHttp(HttpSecurity http) throws Exception {

    }
}

