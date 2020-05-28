package fr.inra.urgi.rarebasket.web.grc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for {@link GrcController}
 */
@WebMvcTest(GrcController.class)
@ActiveProfiles("test")
@WithMockUser
class GrcControllerTest {
    @MockBean
    private CurrentUser mockCurrentUser;

    @MockBean
    private GrcDao mockGrcDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GrcController controller;

    private Grc grc;

    @BeforeEach
    void prepare() {
        grc = new Grc(43L);
        grc.setName("GRC1");
        grc.setInstitution("INRA");
        grc.setAddress("12 Boulevard Marie Curie, 69007 LYON");
        when(mockGrcDao.findById(grc.getId())).thenReturn(Optional.of(grc));

        User user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolder(new AccessionHolder(54L));
        when(mockCurrentUser.getId()).thenReturn(Optional.of(user.getId()));
    }

    @Test
    void shouldList() throws Exception {
        when(mockGrcDao.list()).thenReturn(List.of(grc));

        mockMvc.perform(get("/api/grcs"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(grc.getId()))
               .andExpect(jsonPath("$[0].name").value(grc.getName()))
               .andExpect(jsonPath("$[0].address").value(grc.getAddress()))
               .andExpect(jsonPath("$[0].institution").value(grc.getInstitution()));

        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }
}
