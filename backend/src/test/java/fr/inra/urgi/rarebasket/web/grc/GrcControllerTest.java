package fr.inra.urgi.rarebasket.web.grc;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.FunctionalException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for {@link GrcController}
 */
@WebMvcTest(GrcController.class)
@ActiveProfiles("test")
@WithMockUser
class GrcControllerTest {
    @MockitoBean
    private CurrentUser mockCurrentUser;

    @MockitoBean
    private GrcDao mockGrcDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GrcController controller;

    @Captor
    private ArgumentCaptor<Grc> grcArgumentCaptor;

    private Grc grc;

    @BeforeEach
    void prepare() {
        grc = new Grc(43L);
        grc.setName("GRC1");
        grc.setInstitution("INRA");
        grc.setAddress("12 Boulevard Marie Curie, 69007 LYON");
        when(mockGrcDao.findById(grc.getId())).thenReturn(Optional.of(grc));
        when(mockGrcDao.findByName(grc.getName())).thenReturn(Optional.of(grc));

        User user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolders(Set.of(new AccessionHolder(54L)));
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

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldDelete() throws Exception {
        when(mockGrcDao.findById(42L)).thenReturn(Optional.of(grc));

        mockMvc.perform(delete("/api/grcs/42"))
               .andExpect(status().isNoContent());

        verify(mockGrcDao).delete(grc);
        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowIfNotExistWhenDelete() throws Exception {
        when(mockGrcDao.findById(42L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/grcs/42"))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldGet() throws Exception {
        when(mockGrcDao.findById(42L)).thenReturn(Optional.of(grc));

        mockMvc.perform(get("/api/grcs/42"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(grc.getId()))
               .andExpect(jsonPath("$.name").value(grc.getName()))
               .andExpect(jsonPath("$.institution").value(grc.getInstitution()))
               .andExpect(jsonPath("$.address").value(grc.getAddress()));

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldCreate() throws Exception {
        GrcCommandDTO command = new GrcCommandDTO(
                "GRC3",
                "Ninja Squad Institute",
                "Saint Just/Saint Rambert"
        );

        when(mockGrcDao.save(any())).thenAnswer(MoreAnswers.<Grc>firstArgWith(u -> u.setId(256L)));

        mockMvc.perform(post("/api/grcs")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(256L));

        verify(mockGrcDao).save(grcArgumentCaptor.capture());

        Grc createdGrc = grcArgumentCaptor.getValue();
        assertThat(createdGrc.getName()).isEqualTo(command.getName());
        assertThat(createdGrc.getInstitution()).isEqualTo(command.getInstitution());
        assertThat(createdGrc.getAddress()).isEqualTo(command.getAddress());

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenCreatingWithAlreadyExistingName() {
        GrcCommandDTO command = new GrcCommandDTO(
                grc.getName(),
                "Ninja Squad Institute",
                "Saint Just/Saint Rambert"
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
                () -> controller.create(command)
        ).matches(e -> e.getCode() == FunctionalException.Code.GRC_NAME_ALREADY_EXISTING);
    }

    @Test
    void shouldUpdate() throws Exception {
        GrcCommandDTO command = new GrcCommandDTO(
                "GRC 3",
                "Ninja Squad Institute",
                "Saint Just/Saint Rambert"
        );

        mockMvc.perform(put("/api/grcs/{id}", grc.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(grc.getName()).isEqualTo(command.getName());
        assertThat(grc.getInstitution()).isEqualTo(command.getInstitution());
        assertThat(grc.getAddress()).isEqualTo(command.getAddress());

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenUpdatingWithAlreadyExistingName() {
        Grc otherGrc = new Grc();
        otherGrc.setName(grc.getName());
        when(mockGrcDao.findByName(otherGrc.getName()))
                .thenReturn(Optional.of(otherGrc));
        GrcCommandDTO command = new GrcCommandDTO(
                grc.getName(),
                "Ninja Squad Institute",
                "Saint Just/Saint Rambert"
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
                () -> controller.update(grc.getId(), command)
        ).matches(e -> e.getCode() == FunctionalException.Code.GRC_NAME_ALREADY_EXISTING);;
    }

    @Test
    void shouldNotThrowWhenUpdatingWithTheSameName() {
        GrcCommandDTO command = new GrcCommandDTO(
                grc.getName(),
                "Ninja Squad Science Institute",
                "Saint Just/Saint Rambert"
        );
        assertThatCode(() -> controller.update(grc.getId(), command)).doesNotThrowAnyException();
    }
}
