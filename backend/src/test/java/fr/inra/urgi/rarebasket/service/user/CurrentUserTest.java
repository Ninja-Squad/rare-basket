package fr.inra.urgi.rarebasket.service.user;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.Set;

import com.sun.security.auth.UserPrincipal;
import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

/**
 * Unit tests for {@link CurrentUser}
 * @author JB Nizet
 */
class CurrentUserTest {

    private UserDao mockUserDao;

    private User user;

    @BeforeEach
    void prepare() {
        mockUserDao = mock(UserDao.class);
        user = new User(42L);
        user.setName("JB");
        user.addPermission(new UserPermission(Permission.ORDER_MANAGEMENT));
        user.setAccessionHolders(Set.of(new AccessionHolder(54L)));
        when(mockUserDao.findByName(user.getName())).thenReturn(Optional.of(user));
    }

    @Test
    void shouldHandleCaseWhereUserIsNotAuthenticated() {
        CurrentUser currentUser = new CurrentUser(new MockHttpServletRequest(), mockUserDao);

        assertThat(currentUser.getId()).isEmpty();
        assertThat(currentUser.getAccessionHolderIds()).isEmpty();
        assertThat(currentUser.hasPermission(Permission.ORDER_MANAGEMENT)).isFalse();
        assertThatExceptionOfType(ForbiddenException.class).isThrownBy(
            () -> currentUser.checkPermission(Permission.ORDER_MANAGEMENT)
        );
    }

    @Test
    void shouldHandleCaseWhereUserIsAuthenticatedButDoesNotExist() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setUserPrincipal(new UserPrincipal("Cedric"));

        CurrentUser currentUser = new CurrentUser(request, mockUserDao);

        assertThat(currentUser.getId()).isEmpty();
        assertThat(currentUser.getAccessionHolderIds()).isEmpty();
        assertThat(currentUser.hasPermission(Permission.ORDER_MANAGEMENT)).isFalse();
        assertThatExceptionOfType(ForbiddenException.class).isThrownBy(
            () -> currentUser.checkPermission(Permission.ORDER_MANAGEMENT)
        );


        verify(mockUserDao, times(1)).findByName("Cedric");
    }

    @Test
    void shouldHandleCaseWhereUserIsAuthenticatedAndDoesExist() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setUserPrincipal(new UserPrincipal(user.getName()));

        CurrentUser currentUser = new CurrentUser(request, mockUserDao);

        assertThat(currentUser.getId()).contains(user.getId());
        assertThat(currentUser.getAccessionHolderIds()).contains(54L);
        assertThat(currentUser.hasPermission(Permission.ORDER_MANAGEMENT)).isTrue();
        assertThatCode(
            () -> currentUser.checkPermission(Permission.ORDER_MANAGEMENT)
        ).doesNotThrowAnyException();

        verify(mockUserDao, times(1)).findByName(user.getName());
    }
}
