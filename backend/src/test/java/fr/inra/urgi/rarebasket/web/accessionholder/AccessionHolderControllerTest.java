package fr.inra.urgi.rarebasket.web.accessionholder;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for {@link AccessionHolderController}
 */
@WebMvcTest(AccessionHolderController.class)
@ActiveProfiles("test")
@WithMockUser
class AccessionHolderControllerTest {
    @MockBean
    private CurrentUser mockCurrentUser;

    @MockBean
    private AccessionHolderDao mockAccessionHolderDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccessionHolderController controller;

    @Captor
    private ArgumentCaptor<AccessionHolder> accessionHolderArgumentCaptor;

    private User user;
    private AccessionHolder accessionHolder;

    @BeforeEach
    void prepare() {
        accessionHolder = new AccessionHolder(54L);
        accessionHolder.setName("Contact1");
        accessionHolder.setGrc(new Grc());
        accessionHolder.getGrc().setName("GRC1");
        when(mockAccessionHolderDao.findById(accessionHolder.getId())).thenReturn(Optional.of(accessionHolder));

        user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolder(accessionHolder);
        when(mockCurrentUser.getId()).thenReturn(Optional.of(user.getId()));
    }

    @Test
    void shouldList() throws Exception {
        when(mockAccessionHolderDao.list()).thenReturn(List.of(accessionHolder));

        mockMvc.perform(get("/api/accession-holders"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(accessionHolder.getId()))
               .andExpect(jsonPath("$[0].name").value(accessionHolder.getName()))
               .andExpect(jsonPath("$[0].email").value(accessionHolder.getEmail()))
               .andExpect(jsonPath("$[0].grc.name").value(accessionHolder.getGrc().getName()));

        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }

    @Test
    void shouldDelete() throws Exception {
        when(mockAccessionHolderDao.findById(42L)).thenReturn(Optional.of(accessionHolder));

        mockMvc.perform(delete("/api/accession-holders/42"))
               .andExpect(status().isNoContent());

        verify(mockAccessionHolderDao).delete(accessionHolder);
        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }

    @Test
    void shouldThrowIfNotExistWhenDelete() throws Exception {
        when(mockAccessionHolderDao.findById(42L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/accession-holders/42"))
               .andExpect(status().isNotFound());
    }

}
