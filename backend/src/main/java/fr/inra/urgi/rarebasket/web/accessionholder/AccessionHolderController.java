package fr.inra.urgi.rarebasket.web.accessionholder;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final CurrentUser currentUser;

    public AccessionHolderController(AccessionHolderDao accessionHolderDao, CurrentUser currentUser) {
        this.accessionHolderDao = accessionHolderDao;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<AccessionHolderDTO> list() {
        currentUser.checkPermission(Permission.USER_MANAGEMENT);
        return this.accessionHolderDao.list()
                                      .stream()
                                      .map(AccessionHolderDTO::new)
                                      .collect(Collectors.toList());
    }

    @DeleteMapping("/{accessionHolderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("accessionHolderId") Long accessionHolderId) {
        currentUser.checkPermission(Permission.USER_MANAGEMENT);
        AccessionHolder accessionHolder = accessionHolderDao.findById(accessionHolderId).orElseThrow(NotFoundException::new);
        accessionHolderDao.delete(accessionHolder);
    }
}
