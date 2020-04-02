package fr.inra.urgi.rarebasket.web.order;

import java.util.Set;

import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
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
 * Controller used to handle orders. This controller is used by GRC contact users.
 * // TODO handle access rights
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/orders")
@Transactional
public class OrderController {

    public static final int PAGE_SIZE = 20;

    private final OrderDao orderDao;

    public OrderController(OrderDao orderDao) {
        this.orderDao = orderDao;
    }

    @GetMapping
    public PageDTO<OrderDTO> list(@RequestParam(name = "status", required = false) Set<OrderStatus> statuses,
                                  @RequestParam(name = "page", defaultValue = "0") int page) {
        PageRequest pageRequest = PageRequest.of(page, PAGE_SIZE);

        Page<Order> orderPage;
        if (statuses == null || statuses.isEmpty()) {
            orderPage = orderDao.pageAll(pageRequest);
        } else {
            orderPage = orderDao.pageByStatuses(statuses, pageRequest);
        }
        return PageDTO.fromPage(orderPage, OrderDTO::new);
    }

    @GetMapping("/{orderId}")
    public OrderDTO get(@PathVariable("orderId") Long orderId) {
        Order order = orderDao.findById(orderId).orElseThrow(NotFoundException::new);
        return new OrderDTO(order);
    }
}
