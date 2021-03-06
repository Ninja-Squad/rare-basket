package fr.inra.urgi.rarebasket.web.accessionholder;

import static fr.inra.urgi.rarebasket.exception.FunctionalException.Code.*;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
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
 * Controller used to handle accession holders
 * @author JB Nizet
 */
@RestController
@Transactional
@RequestMapping("/api/accession-holders")
public class AccessionHolderController {

    private final AccessionHolderDao accessionHolderDao;
    private final GrcDao grcDao;
    private final CurrentUser currentUser;

    public AccessionHolderController(AccessionHolderDao accessionHolderDao, GrcDao grcDao, CurrentUser currentUser) {
        this.accessionHolderDao = accessionHolderDao;
        this.grcDao = grcDao;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<AccessionHolderDTO> list() {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        return this.accessionHolderDao.list()
                                      .stream()
                                      .map(AccessionHolderDTO::new)
                                      .collect(Collectors.toList());
    }

    @DeleteMapping("/{accessionHolderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("accessionHolderId") Long accessionHolderId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        AccessionHolder accessionHolder = accessionHolderDao.findById(accessionHolderId).orElseThrow(NotFoundException::new);
        accessionHolderDao.delete(accessionHolder);
    }

    @GetMapping("/{accessionHolderId}")
    public AccessionHolderDTO get(@PathVariable("accessionHolderId") Long accessionHolderId) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        AccessionHolder accessionHolder = accessionHolderDao.findById(accessionHolderId).orElseThrow(NotFoundException::new);
        return new AccessionHolderDTO(accessionHolder);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccessionHolderDTO create(@Validated @RequestBody AccessionHolderCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        validateAccessionHolderEmail(command.getEmail(), null);
        validateAccessionHolderName(command.getName(), null);

        AccessionHolder accessionHolder = new AccessionHolder();
        copyCommandToAccessionHolder(command, accessionHolder);

        accessionHolderDao.save(accessionHolder);
        return new AccessionHolderDTO(accessionHolder);
    }

    @PutMapping("/{accessionHolderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable("accessionHolderId") Long accessionHolderId,
                       @Validated @RequestBody AccessionHolderCommandDTO command) {
        currentUser.checkPermission(Permission.ADMINISTRATION);
        AccessionHolder accessionHolder = accessionHolderDao.findById(accessionHolderId)
                                                            .orElseThrow(NotFoundException::new);
        validateAccessionHolderEmail(command.getEmail(), accessionHolder);
        validateAccessionHolderName(command.getName(), accessionHolder);

        copyCommandToAccessionHolder(command, accessionHolder);
    }

    private void copyCommandToAccessionHolder(AccessionHolderCommandDTO command, AccessionHolder accessionHolder) {
        Long grcId = command.getGrcId();
        Grc grc = grcDao.findById(grcId).orElseThrow(
                () -> new BadRequestException("No GRC with ID " + command.getGrcId()));
        accessionHolder.setGrc(grc);

        accessionHolder.setName(command.getName());
        accessionHolder.setEmail(command.getEmail());
        accessionHolder.setPhone(command.getPhone());
    }

    private void validateAccessionHolderEmail(String email, AccessionHolder accessionHolder) {
        accessionHolderDao.findByEmail(email)
                          .filter(foundAccessionHolder -> !foundAccessionHolder.equals(accessionHolder))
                          .ifPresent(foundAccessionHolder -> {
                              throw new FunctionalException(ACCESSION_HOLDER_EMAIL_ALREADY_EXISTING);
                          });
    }

    private void validateAccessionHolderName(String name, AccessionHolder accessionHolder) {
        accessionHolderDao.findByName(name)
                          .filter(foundAccessionHolder -> !foundAccessionHolder.equals(accessionHolder))
                          .ifPresent(foundAccessionHolder -> {
                              throw new FunctionalException(ACCESSION_HOLDER_NAME_ALREADY_EXISTING);
                          });
    }
}
