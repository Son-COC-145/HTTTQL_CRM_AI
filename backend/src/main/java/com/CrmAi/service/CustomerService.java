package com.CrmAi.service;

import com.CrmAi.entity.Customer;
import com.CrmAi.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    private final CustomerEmbeddingService customerEmbeddingService;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }

    public Customer createCustomer(Customer customer) {
        Customer saved = customerRepository.save(customer);
        customerEmbeddingService.syncCustomerEmbedding(saved);
        return saved;
    }

    public Customer updateCustomer(Long id, Customer request) {
        Customer customer = getCustomerById(id);

        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setSource(request.getSource());
        customer.setStatus(request.getStatus());
        customer.setPotentialScore(request.getPotentialScore());
        customer.setNote(request.getNote());

        Customer saved = customerRepository.save(customer);
        customerEmbeddingService.syncCustomerEmbedding(saved);
        return saved;
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerEmbeddingService.deleteByCustomerId(customer.getId());
        customerRepository.delete(customer);
    }

    public List<Customer> getTopPotentialCustomers() {
        return customerRepository.findTop5ByOrderByPotentialScoreDesc();
    }
}
