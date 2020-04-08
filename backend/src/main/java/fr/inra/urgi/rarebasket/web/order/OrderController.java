package fr.inra.urgi.rarebasket.web.order;

import java.util.Set;

import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.Permission;
import fr.inra.urgi.rarebasket.exception.ForbiddenException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.user.CurrentUser;
import fr.inra.urgi.rarebasket.web.common.PageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used to handle orders. This controller is used by accession holder users.
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/orders")
@Transactional
public class OrderController {

    public static final int PAGE_SIZE = 20;

    private final OrderDao orderDao;
    private final CurrentUser currentUser;

    public OrderController(OrderDao orderDao, CurrentUser currentUser) {
        this.orderDao = orderDao;
        this.currentUser = currentUser;
    }

    @GetMapping
    public PageDTO<OrderDTO> list(@RequestParam(name = "status", required = false) Set<OrderStatus> statuses,
                                  @RequestParam(name = "page", defaultValue = "0") int page) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);
        PageRequest pageRequest = PageRequest.of(page, PAGE_SIZE);

        Page<Order> orderPage;
        if (statuses == null || statuses.isEmpty()) {
            orderPage = orderDao.pageByAccessionHolder(getAccessionHolderId(), pageRequest);
        } else {
            orderPage = orderDao.pageByAccessionHolderAndStatuses(getAccessionHolderId(), statuses, pageRequest);
        }
        return PageDTO.fromPage(orderPage, OrderDTO::new);
    }

    @GetMapping("/{orderId}")
    public OrderDTO get(@PathVariable("orderId") Long orderId) {
        currentUser.checkPermission(Permission.ORDER_MANAGEMENT);

        Order order = orderDao.findById(orderId).orElseThrow(NotFoundException::new);
        if (!order.getAccessionHolder().getId().equals(getAccessionHolderId())) {
            throw new ForbiddenException();
        }
        return new OrderDTO(order);
    }

    private Long getAccessionHolderId() {
        return currentUser.getAccessionHolderId().orElseThrow(() -> new IllegalStateException("Current user should have an accession holder"));
    }
}
