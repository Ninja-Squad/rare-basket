package fr.inra.urgi.rarebasket.web.user;

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
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserController controller;

    @Captor
    private ArgumentCaptor<User> userCaptor;

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
               .andExpect(jsonPath("$.permissions.length()").value(1))
               .andExpect(jsonPath("$.permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.accessionHolder.grcName").value(user.getAccessionHolder().getGrc().getName()));
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
               .andExpect(jsonPath("$.content[0].permissions.length()").value(1))
               .andExpect(jsonPath("$.content[0].permissions[0]").value(Permission.ORDER_MANAGEMENT.name()))
               .andExpect(jsonPath("$.content[0].accessionHolder.id").value(user.getAccessionHolder().getId()))
               .andExpect(jsonPath("$.content[0].accessionHolder.name").value(user.getAccessionHolder().getName()))
               .andExpect(jsonPath("$.content[0].accessionHolder.grcName").value(user.getAccessionHolder()
                                                                                     .getGrc()
                                                                                     .getName()));

        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }

    @Test
    void shouldCreate() throws Exception {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    accessionHolder.getId());

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
                          tuple(Permission.USER_MANAGEMENT, createdUser));

        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenCreatingWithAlreadyExistingName() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    accessionHolder.getId());
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldThrowWhenCreatingWithNonExistingAccessionHolder() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    9765432L);
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldThrowWhenCreatingWithMissingAccessionHolder() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    null);
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.create(command)
        );
    }

    @Test
    void shouldNotThrowWhenCreatingWithMissingAccessionHolderIfNotOrderManager() {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.USER_MANAGEMENT),
                                                    null);
        assertThatCode(() -> controller.create(command)).doesNotThrowAnyException();
    }

    @Test
    void shouldUpdate() throws Exception {
        UserCommandDTO command = new UserCommandDTO("Claire",
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    accessionHolder.getId());

        mockMvc.perform(put("/api/users/{id}", user.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(user.getAccessionHolder()).isEqualTo(accessionHolder);
        assertThat(user.getName()).isEqualTo(command.getName());
        assertThat(user.getPermissions()).hasSize(2);
        assertThat(user.getPermissions()).extracting(UserPermission::getPermission, UserPermission::getUser)
                                         .containsOnly(tuple(Permission.ORDER_MANAGEMENT, user),
                                                       tuple(Permission.USER_MANAGEMENT, user));

        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }

    @Test
    void shouldThrowWhenUpdatingWithAlreadyExistingName() {
        User otherUser = new User();
        otherUser.setName("Claire");
        when(mockUserDao.findByName(otherUser.getName())).thenReturn(Optional.of(otherUser));
        UserCommandDTO command = new UserCommandDTO(otherUser.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    accessionHolder.getId());
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
            () -> controller.update(user.getId(), command)
        );
    }

    @Test
    void shouldNotThrowWhenUpdatingWithSameName() {
        UserCommandDTO command = new UserCommandDTO(user.getName(),
                                                    Set.of(Permission.ORDER_MANAGEMENT, Permission.USER_MANAGEMENT),
                                                    accessionHolder.getId());
        assertThatCode(() -> controller.update(user.getId(), command)).doesNotThrowAnyException();
    }

    @Test
    void shouldDelete() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", user.getId()))
               .andExpect(status().isNoContent());

        verify(mockUserDao).delete(user);
        verify(mockCurrentUser).checkPermission(Permission.USER_MANAGEMENT);
    }
}
