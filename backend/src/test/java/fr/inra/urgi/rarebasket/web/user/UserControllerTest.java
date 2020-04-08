package fr.inra.urgi.rarebasket.web.user;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import fr.inra.urgi.rarebasket.dao.UserDao;
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
 * Tests for {@link UserController}
 * @author JB Nizet
 */
@WebMvcTest(UserController.class)
@ActiveProfiles("test")
@WithMockUser
class UserControllerTest {
    @MockBean
    private CurrentUser mockCurrentUser;

    @MockBean
    private UserDao mockUserDao;

    @Autowired
    private MockMvc mockMvc;

    private User user;

    @BeforeEach
    void prepare() {
        user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolder(new AccessionHolder(54L));
        user.getAccessionHolder().setName("Contact1");
        user.getAccessionHolder().setGrc(new Grc());
        user.getAccessionHolder().getGrc().setName("GRC1");
        when(mockUserDao.findById(user.getId())).thenReturn(Optional.of(user));

        when(mockCurrentUser.getId()).thenReturn(Optional.of(user.getId()));
    }

    @Test
    void shouldGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/users/me"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(user.getId()))
               .andExpect(jsonPath("$.name").value(user.getName()))
               .andExpect(jsonPath("$.permissions.length()").value(1))
               .andExpect(jsonPath("$.permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.accessionHolder.grcName").value(user.getAccessionHolder().getGrc().getName()));
    }
}
