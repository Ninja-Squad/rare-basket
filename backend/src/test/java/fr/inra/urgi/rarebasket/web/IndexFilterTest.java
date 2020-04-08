package fr.inra.urgi.rarebasket.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for {@link IndexFilter}
 * @author JB Nizet
 */
@WebMvcTest(IndexFilter.class)
@ActiveProfiles("test")
class IndexFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {
        "",
        "/",
        "/index.html",
        "/favicon.ico",
        "/assets/foo.png",
        "/assets/foo.jpg",
        "/assets/foo.svg",
        "/assets/foo.gif",
        "/assets/font.eot",
        "/assets/font.ttf",
        "/assets/font.woff",
        "/assets/font.woff2",
        "/script.js",
        "/style.css",
        "/favicon.ico",
        "/i18n.json",
        "/api/foo",
        "/actuator/health",
    })
    void shouldNotForwardForGetRequestWithUri(String uri) throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/rarebasket" + uri);
        request.setContextPath("/rarebasket");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        IndexFilter filter = new IndexFilter();

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(any(), any());
        assertThat(response.getForwardedUrl()).isNull();
    }

    @Test
    void shouldNotForwardForNonGetRequest() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/foo");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        IndexFilter filter = new IndexFilter();

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(any(), any());
        assertThat(response.getForwardedUrl()).isNull();
    }

    @Test
    void shouldForwardForGetRequestToFrontendUri() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/foo");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        IndexFilter filter = new IndexFilter();

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        assertThat(response.getForwardedUrl()).isEqualTo("/index.html");
    }

    @Test
    void shouldInstallFilterInContext() throws Exception {
        mockMvc.perform(get("/foo"))
               .andExpect(forwardedUrl("/index.html"));
    }
}
