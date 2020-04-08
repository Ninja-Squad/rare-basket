package fr.inra.urgi.rarebasket.web.user;

import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used to handle users
 * @author JB Nizet
 */
@RequestMapping("/api/users")
@Transactional
@RestController
public class UserController {

    private final CurrentUser currentUser;
    private final UserDao userDao;

    public UserController(CurrentUser currentUser,
                          UserDao userDao) {
        this.currentUser = currentUser;
        this.userDao = userDao;
    }

    @GetMapping("/me")
    public UserDTO getCurrent() {
        return currentUser.getId().flatMap(userDao::findById)
                          .map(UserDTO::new)
                          .orElseThrow(NotFoundException::new);
    }
}
