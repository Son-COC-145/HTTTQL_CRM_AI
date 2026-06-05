package com.CrmAi.service;

import com.CrmAi.entity.Customer;
import com.CrmAi.entity.Order;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Order createOrder(Long customerId, Order order) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        order.setCustomer(customer);

        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, Order request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderCode(request.getOrderCode());
        order.setOrderDate(request.getOrderDate());
        order.setAmount(request.getAmount());
        order.setStatus(request.getStatus());

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
