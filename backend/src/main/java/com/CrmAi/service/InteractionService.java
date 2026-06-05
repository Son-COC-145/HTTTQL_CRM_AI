package com.CrmAi.service;

import com.CrmAi.entity.Customer;
import com.CrmAi.entity.Interaction;
import com.CrmAi.entity.Order;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final CustomerRepository customerRepository;

    public List<Interaction> getInteractionsByCustomerId(Long customerId) {
        return interactionRepository.findByCustomerId(customerId);
    }

    public Interaction createInteraction(Long customerId, Interaction interaction) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        interaction.setCustomer(customer);

        if (interaction.getInteractionDate() == null) {
            interaction.setInteractionDate(LocalDateTime.now());
        }

        return interactionRepository.save(interaction);
    }

    public void deleteInteraction(Long id) {
        interactionRepository.deleteById(id);
    }
}
