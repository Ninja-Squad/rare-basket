package fr.inra.urgi.rarebasket.web.accessionholder;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    public AccessionHolderController(AccessionHolderDao accessionHolderDao) {
        this.accessionHolderDao = accessionHolderDao;
    }

    @GetMapping
    public List<AccessionHolderDTO> list() {
        return this.accessionHolderDao.list()
                                      .stream()
                                      .map(AccessionHolderDTO::new)
                                      .collect(Collectors.toList());
    }
}
