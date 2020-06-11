package fr.inra.urgi.rarebasket.web.grc;

import static fr.inra.urgi.rarebasket.exception.FunctionalException.Code.GRC_NAME_ALREADY_EXISTING;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.exception.FunctionalException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used to handle GRCs
 */
@RestController
@Transactional
@RequestMapping("/api/grcs")
public class GrcController {

    private final GrcDao grcDao;
    private final CurrentUser currentUser;

    public GrcController(GrcDao grcDao, CurrentUser currentUser) {
        this.grcDao = grcDao;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<GrcDTO> list() {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        return this.grcDao.list()
                          .stream()
                          .map(GrcDTO::new)
                          .collect(Collectors.toList());
    }

    @DeleteMapping("/{grcId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("grcId") Long grcId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        Grc grc = grcDao.findById(grcId).orElseThrow(NotFoundException::new);
        grcDao.delete(grc);
    }

    @GetMapping("/{grcId}")
    public GrcDTO get(@PathVariable("grcId") Long grcId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        Grc grc = grcDao.findById(grcId).orElseThrow(NotFoundException::new);
        return new GrcDTO(grc);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GrcDTO create(@Validated @RequestBody GrcCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        validateGrcName(command.getName(), null);

        Grc grc = new Grc();
        copyCommandToGrc(command, grc);

        grcDao.save(grc);
        return new GrcDTO(grc);
    }

    @PutMapping("/{grcId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable("grcId") Long grcId,
                       @Validated @RequestBody GrcCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        Grc grc = grcDao.findById(grcId)
                        .orElseThrow(NotFoundException::new);
        validateGrcName(command.getName(), grc);

        copyCommandToGrc(command, grc);
    }

    private void copyCommandToGrc(GrcCommandDTO command, Grc grc) {
        grc.setName(command.getName());
        grc.setInstitution(command.getInstitution());
        grc.setAddress(command.getAddress());
    }

    private void validateGrcName(String name, Grc grc) {
        grcDao.findByName(name)
              .filter(foundGrc -> !foundGrc.equals(grc))
              .ifPresent(foundGrc -> {
                  throw new FunctionalException(GRC_NAME_ALREADY_EXISTING);
              });
    }
}
