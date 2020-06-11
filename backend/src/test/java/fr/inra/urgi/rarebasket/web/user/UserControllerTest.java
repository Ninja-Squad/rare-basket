package fr.inra.urgi.rarebasket.web.user;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
import fr.inra.urgi.rarebasket.exception.FunctionalException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
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

    @MockBean
    private AccessionHolderDao mockAccessionHolderDao;

    @MockBean
    private GrcDao mockGrcDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserController controller;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User user;
    private Grc grc;
    private AccessionHolder accessionHolder;

    @BeforeEach
    void prepare() {
        grc = new Grc(1L);
        grc.setName("GRC1");
        when(mockGrcDao.findById(grc.getId())).thenReturn(Optional.of(grc));

        accessionHolder = new AccessionHolder(54L);
        accessionHolder.setName("Contact1");
        accessionHolder.setGrc(grc);
        when(mockAccessionHolderDao.findById(accessionHolder.getId())).thenReturn(Optional.of(accessionHolder));

        user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.addPermission(new UserPermission(Permission.ORDER_VISUALIZATION));
        user.setAccessionHolder(accessionHolder);
        user.setVisualizationGrcs(Set.of(accessionHolder.getGrc()));

        when(mockUserDao.findById(user.getId())).thenReturn(Optional.of(user));
        when(mockUserDao.findByName(user.getName())).thenReturn(Optional.of(user));

        when(mockCurrentUser.getId()).thenReturn(Optional.of(user.getId()));
    }

    @Test
    void shouldGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/users/me"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(user.getId()))
               .andExpect(jsonPath("$.name").value(user.getName()))
               .andExpect(jsonPath("$.permissions.length()").value(2))
               .andExpect(jsonPath("$.permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.permissions[1]").value(Permission.ORDER_VISUALIZATION.name()))
               .andExpect(jsonPath("$.accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.accessionHolder.grc.name").value(user.getAccessionHolder().getGrc().getName()))
               .andExpect(jsonPath("$.globalVisualization").value(false))
               .andExpect(jsonPath("$.visualizationGrcs.length()").value(1))
               .andExpect(jsonPath("$.visualizationGrcs[0].id").value(grc.getId()));
    }

    @Test
    void shouldList() throws Exception {
        Pageable pageRequest = PageRequest.of(1, UserController.PAGE_SIZE);
        when(mockUserDao.pageAll(pageRequest)).thenReturn(
            new PageImpl<>(List.of(user), pageRequest, UserController.PAGE_SIZE + 1)
        );

        mockMvc.perform(get("/api/users").param("page", "1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.content[0].id").value(user.getId()))
               .andExpect(jsonPath("$.content[0].name").value(user.getName()))
               .andExpect(jsonPath("$.content[0].permissions.length()").value(2))
               .andExpect(jsonPath("$.content[0].permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.content[0].permissions[1]").value(Permission.ORDER_VISUALIZATION.name()))
               .andExpect(jsonPath("$.content[0].accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.content[0].accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.content[0].accessionHolder.grc.name").value(user.getAccessionHolder().getGrc().getName()))
               .andExpect(jsonPath("$.content[0].globalVisualization").value(false))
               .andExpect(jsonPath("$.content[0].visualizationGrcs.length()").value(1))
               .andExpect(jsonPath("$.content[0].visualizationGrcs[0].id").value(grc.getId()));

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldGet() throws Exception {
        mockMvc.perform(get("/api/users/{userid}", user.getId()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(user.getId()))
               .andExpect(jsonPath("$.name").value(user.getName()))
               .andExpect(jsonPath("$.permissions.length()").value(2))
               .andExpect(jsonPath("$.permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.permissions[1]").value(Permission.ORDER_VISUALIZATION.name()))
               .andExpect(jsonPath("$.accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.accessionHolder.grc.name").value(user.getAccessionHolder().getGrc().getName()))
               .andExpect(jsonPath("$.globalVisualization").value(false))
               .andExpect(jsonPath("$.visualizationGrcs.length()").value(1))
               .andExpect(jsonPath("$.visualizationGrcs[0].id").value(grc.getId()));

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldCreate() throws Exception {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Set.of(grc.getId()));

        when(mockUserDao.save(any())).thenAnswer(MoreAnswers.<User>firstArgWith(u -> u.setId(763L)));

        mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(763L));

        verify(mockUserDao).save(userCaptor.capture());

        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getAccessionHolder()).isEqualTo(accessionHolder);
        assertThat(createdUser.getName()).isEqualTo(command.getName());
        assertThat(createdUser.getPermissions()).hasSize(2);
        assertThat(createdUser.getPermissions()).extracting(UserPermission::getPermission, UserPermission::getUser)
            .containsOnly(tuple(Permission.ORDER_MANAGEMENT, createdUser),
                          tuple(Permission.ORDER_VISUALIZATION, createdUser));
        assertThat(createdUser.isGlobalVisualization()).isFalse();
        assertThat(createdUser.getVisualizationGrcs()).containsOnly(grc);

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenCreatingWithAlreadyExistingName() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Set.of(grc.getId()));
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
            () -> controller.create(command)
        ).matches(e -> e.getCode() == FunctionalException.Code.USER_NAME_ALREADY_EXISTING);
    }

    @Test
    void shouldThrowWhenCreatingWithNonExistingAccessionHolder() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    9765432L,
                                                    false,
                                                    Set.of(grc.getId()));
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldThrowWhenCreatingWithMissingAccessionHolder() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    null,
                                                    false,
                                                    Set.of(grc.getId()));
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldNotThrowWhenCreatingWithMissingAccessionHolderIfNotOrderManager() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_VISUALIZATION),
                                                    null,
                                                    false,
                                                    Set.of(grc.getId()));
        assertThatCode(() -> controller.create(command)).doesNotThrowAnyException();
    }

    @Test
    void shouldThrowWhenCreatingWithNoVisualizationGrc() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Collections.emptySet());
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldThrowWhenCreatingWithInvalidVisualizationGrc() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Set.of(45678L));
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldUpdate() throws Exception {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ORDER_VISUALIZATION),
                                                    accessionHolder.getId(),
                                                    true,
                                                    Collections.emptySet());

        mockMvc.perform(put("/api/users/{id}", user.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(user.getAccessionHolder()).isEqualTo(accessionHolder);
        assertThat(user.getName()).isEqualTo(command.getName());
        assertThat(user.getPermissions()).hasSize(2);
        assertThat(user.getPermissions()).extracting(UserPermission::getPermission, UserPermission::getUser)
                                         .containsOnly(tuple(Permission.ORDER_MANAGEMENT, user),
                                                       tuple(Permission.ORDER_VISUALIZATION, user));
        assertThat(user.isGlobalVisualization()).isTrue();
        assertThat(user.getVisualizationGrcs()).isEmpty();
        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenUpdatingWithAlreadyExistingName() {
        User otherUser = new User();
        otherUser.setName("Claire");
        when(mockUserDao.findByName(otherUser.getName())).thenReturn(Optional.of(otherUser));
        UserCommandDTO command = new UserCommandDTO(otherUser.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ADMINISTRATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Collections.emptySet());
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
            () -> controller.update(user.getId(), command)
        ).matches(e -> e.getCode() == FunctionalException.Code.USER_NAME_ALREADY_EXISTING);
    }

    @Test
    void shouldNotThrowWhenUpdatingWithSameName() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.ADMINISTRATION),
                                                    accessionHolder.getId(),
                                                    false,
                                                    Collections.emptySet());
        assertThatCode(() -> controller.update(user.getId(), command)).doesNotThrowAnyException();
    }

    @Test
    void shouldDelete() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", user.getId()))
               .andExpect(status().isNoContent());

        verify(mockUserDao).delete(user);
        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }
}
