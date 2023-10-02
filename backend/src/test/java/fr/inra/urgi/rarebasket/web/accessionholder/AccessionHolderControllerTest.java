package fr.inra.urgi.rarebasket.web.accessionholder;

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
import fr.inra.urgi.rarebasket.dao.GrcDao;
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
import org.springframework.http.MediaType;
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

    @MockBean
    private GrcDao mockGrcDao;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccessionHolderController controller;

    @Captor
    private ArgumentCaptor<AccessionHolder> accessionHolderArgumentCaptor;

    private AccessionHolder accessionHolder;
    private Grc grc;

    @BeforeEach
    void prepare() {
        grc = new Grc(43L);
        grc.setName("GRC1");
        when(mockGrcDao.findById(grc.getId())).thenReturn(Optional.of(grc));

        accessionHolder = new AccessionHolder(54L);
        accessionHolder.setName("Contact1");
        accessionHolder.setEmail("contact@grc1.com");
        accessionHolder.setGrc(grc);
        when(mockAccessionHolderDao.findById(accessionHolder.getId())).thenReturn(Optional.of(accessionHolder));
        when(mockAccessionHolderDao.findByEmail(accessionHolder.getEmail())).thenReturn(Optional.of(accessionHolder));
        when(mockAccessionHolderDao.findByName(accessionHolder.getName())).thenReturn(Optional.of(accessionHolder));

        User user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolders(Set.of(accessionHolder));
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
               .andExpect(jsonPath("$[0].phone").value(accessionHolder.getPhone()))
               .andExpect(jsonPath("$[0].grc.name").value(grc.getName()));

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldDelete() throws Exception {
        when(mockAccessionHolderDao.findById(42L)).thenReturn(Optional.of(accessionHolder));

        mockMvc.perform(delete("/api/accession-holders/42"))
               .andExpect(status().isNoContent());

        verify(mockAccessionHolderDao).delete(accessionHolder);
        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowIfNotExistWhenDelete() throws Exception {
        when(mockAccessionHolderDao.findById(42L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/accession-holders/42"))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldGet() throws Exception {
        when(mockAccessionHolderDao.findById(42L)).thenReturn(Optional.of(accessionHolder));

        mockMvc.perform(get("/api/accession-holders/42"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(accessionHolder.getId()))
               .andExpect(jsonPath("$.name").value(accessionHolder.getName()))
               .andExpect(jsonPath("$.email").value(accessionHolder.getEmail()))
               .andExpect(jsonPath("$.phone").value(accessionHolder.getPhone()))
               .andExpect(jsonPath("$.grc.name").value(grc.getName()));

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldCreate() throws Exception {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                "cyril@grc1.com",
                "0601020304",
                accessionHolder.getGrc().getId()
        );

        when(mockAccessionHolderDao.save(any())).thenAnswer(MoreAnswers.<AccessionHolder>firstArgWith(u -> u.setId(256L)));

        mockMvc.perform(post("/api/accession-holders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(256L));

        verify(mockAccessionHolderDao).save(accessionHolderArgumentCaptor.capture());

        AccessionHolder createdAccessionHolder = accessionHolderArgumentCaptor.getValue();
        assertThat(createdAccessionHolder.getName()).isEqualTo(command.getName());
        assertThat(createdAccessionHolder.getEmail()).isEqualTo(command.getEmail());
        assertThat(createdAccessionHolder.getPhone()).isEqualTo(command.getPhone());
        assertThat(createdAccessionHolder.getGrc()).isEqualTo(grc);

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenCreatingWithAlreadyExistingEmail() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                accessionHolder.getEmail(),
                "0601020304",
                accessionHolder.getGrc().getId()
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
                () -> controller.create(command)
        ).matches(e -> e.getCode() == FunctionalException.Code.ACCESSION_HOLDER_EMAIL_ALREADY_EXISTING);
    }

    @Test
    void shouldThrowWhenCreatingWithAlreadyExistingName() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
            accessionHolder.getName(),
            "foo@bar.com",
            "0601020304",
            accessionHolder.getGrc().getId()
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
            () -> controller.create(command)
        ).matches(e -> e.getCode() == FunctionalException.Code.ACCESSION_HOLDER_NAME_ALREADY_EXISTING);
    }

    @Test
    void shouldThrowWhenCreatingWithNonExistingGrc() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                "cyril@grc1.com",
                "0601020304",
                9876L
        );
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
                () -> controller.create(command)
        );
    }

    @Test
    void shouldThrowWhenCreatingWithMissingGrc() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                "cyril@grc1.com",
                "0601020304",
                null
        );
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(
                () -> controller.create(command)
        );
    }

    @Test
    void shouldUpdate() throws Exception {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                "cyril@grc1.com",
                "0601020304",
                grc.getId()
        );

        mockMvc.perform(put("/api/accession-holders/{id}", accessionHolder.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(accessionHolder.getName()).isEqualTo(command.getName());
        assertThat(accessionHolder.getEmail()).isEqualTo(command.getEmail());
        assertThat(accessionHolder.getPhone()).isEqualTo(command.getPhone());
        assertThat(accessionHolder.getGrc()).isEqualTo(grc);

        verify(mockCurrentUser).checkPermission(Permission.ADMINISTRATION);
    }

    @Test
    void shouldThrowWhenUpdatingWithAlreadyExistingEmail() {
        AccessionHolder otherAccessionHolder = new AccessionHolder();
        otherAccessionHolder.setEmail(accessionHolder.getEmail());
        when(mockAccessionHolderDao.findByEmail(otherAccessionHolder.getEmail()))
                .thenReturn(Optional.of(otherAccessionHolder));
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                accessionHolder.getEmail(),
                "0601020304",
                accessionHolder.getGrc().getId()
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
                () -> controller.update(accessionHolder.getId(), command)
        ).matches(e -> e.getCode() == FunctionalException.Code.ACCESSION_HOLDER_EMAIL_ALREADY_EXISTING);
    }

    @Test
    void shouldThrowWhenUpdatingWithAlreadyExistingName() {
        AccessionHolder otherAccessionHolder = new AccessionHolder();
        otherAccessionHolder.setName(accessionHolder.getName());
        when(mockAccessionHolderDao.findByName(otherAccessionHolder.getName())).thenReturn(Optional.of(otherAccessionHolder));
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
            accessionHolder.getName(),
            "foo@bar.com",
            "0601020304",
            accessionHolder.getGrc().getId()
        );
        assertThatExceptionOfType(FunctionalException.class).isThrownBy(
            () -> controller.update(accessionHolder.getId(), command)
        ).matches(e -> e.getCode() == FunctionalException.Code.ACCESSION_HOLDER_NAME_ALREADY_EXISTING);
    }

    @Test
    void shouldNotThrowWhenUpdatingWithTheSameEmail() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
                "Cyril",
                accessionHolder.getEmail(),
                "0601020304",
                accessionHolder.getGrc().getId()
        );
        assertThatCode(() -> controller.update(accessionHolder.getId(), command)).doesNotThrowAnyException();
    }

    @Test
    void shouldNotThrowWhenUpdatingWithTheSameName() {
        AccessionHolderCommandDTO command = new AccessionHolderCommandDTO(
            accessionHolder.getName(),
            "foo@bar.com",
            "0601020304",
            accessionHolder.getGrc().getId()
        );
        assertThatCode(() -> controller.update(accessionHolder.getId(), command)).doesNotThrowAnyException();
    }
}
