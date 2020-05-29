package fr.inra.urgi.rarebasket.web.grc;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.GrcDao;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
