package fr.inra.urgi.rarebasket.web.user;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.dao.UserDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.domain.User;
import fr.inra.urgi.rarebasket.domain.UserPermission;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import fr.inra.urgi.rarebasket.web.common.PageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used to handle users
 * @author JB Nizet
 */
@RequestMapping("/api/users")
@Transactional
@RestController
public class UserController {

    public static final int PAGE_SIZE = 20;

    private final CurrentUser currentUser;
    private final UserDao userDao;
    private final AccessionHolderDao accessionHolderDao;
    private final GrcDao grcDao;

    public UserController(CurrentUser currentUser,
                          UserDao userDao,
                          AccessionHolderDao accessionHolderDao,
                          GrcDao grcDao) {
        this.currentUser = currentUser;
        this.userDao = userDao;
        this.accessionHolderDao = accessionHolderDao;
        this.grcDao = grcDao;
    }

    @GetMapping("/me")
    public UserDTO getCurrent() {
        return currentUser.getId().flatMap(userDao::findById)
                          .map(UserDTO::new)
                          .orElseThrow(NotFoundException::new);
    }

    @GetMapping
    public PageDTO<UserDTO> list(@RequestParam(defaultValue = "0") int page) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        Page<User> users = userDao.pageAll(PageRequest.of(page, PAGE_SIZE));
        return PageDTO.fromPage(users, UserDTO::new);
    }

    @GetMapping("/{userId}")
    public UserDTO get(@PathVariable("userId") Long userId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        User user = userDao.findById(userId).orElseThrow(NotFoundException::new);
        return new UserDTO(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO create(@Validated @RequestBody UserCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        validateUserName(command.getName(), null);

        User user = new User();
        copyCommandToUser(command, user);

        userDao.save(user);
        return new UserDTO(user);
    }

    @PutMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable("userId") Long userId,
                       @Validated @RequestBody UserCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        User user = userDao.findById(userId).orElseThrow(NotFoundException::new);
        validateUserName(command.getName(), user);

        copyCommandToUser(command, user);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("userId") Long userId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        User user = userDao.findById(userId).orElseThrow(NotFoundException::new);
        userDao.delete(user);
    }

    private void copyCommandToUser(UserCommandDTO command, User user) {
        if (command.getPermissions().contains(Permission.ORDER_MANAGEMENT) && command.getAccessionHolderId() == null) {
            throw new BadRequestException("An accession holder is mandatory for permission " + Permission.ORDER_MANAGEMENT);
        }
        AccessionHolder accessionHolder =
            command.getAccessionHolderId() == null
                ? null
                : accessionHolderDao.findById(command.getAccessionHolderId()).orElseThrow(
                () -> new BadRequestException("No accession holder with ID " + command.getAccessionHolderId())
            );

        user.setAccessionHolder(accessionHolder);
        user.setName(command.getName());
        user.setPermissions(command.getPermissions().stream().map(UserPermission::new).collect(Collectors.toSet()));
        user.setGlobalVisualization(false);
        user.setVisualizationGrcs(Collections.emptySet());

        if (command.getPermissions().contains(Permission.ORDER_VISUALIZATION)) {
            if (!command.isGlobalVisualization() && command.getVisualizationGrcIds().isEmpty()) {
                throw new BadRequestException("At least one visualization GRC must be provided");
            }

            user.setGlobalVisualization(command.isGlobalVisualization());
            if (!command.isGlobalVisualization()) {
                Set<Grc> visualizationGrcs =
                    command.getVisualizationGrcIds()
                           .stream()
                           .map(grcId -> grcDao.findById(grcId).orElseThrow(() -> new BadRequestException("No GRC with ID " + grcId)))
                           .collect(Collectors.toSet());
                user.setVisualizationGrcs(visualizationGrcs);
            }
        }
    }

    private void validateUserName(String name, User user) {
        userDao.findByName(name)
               .filter(u -> !u.equals(user))
               .ifPresent(u -> {
                   throw new BadRequestException("A user with that name already exists");
               });
        // TODO check that the name is a valid keycloak name,
        //  or better, use the keycloak user ID and get the name from keycloak
    }
}
