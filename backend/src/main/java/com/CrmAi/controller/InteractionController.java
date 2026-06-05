package com.CrmAi.controller;

import com.CrmAi.entity.Interaction;
import com.CrmAi.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping("/customer/{customerId}")
    public List<Interaction> getInteractionsByCustomer(@PathVariable Long customerId) {
        return interactionService.getInteractionsByCustomerId(customerId);
    }

    @PostMapping("/customer/{customerId}")
    public Interaction createInteraction(@PathVariable Long customerId, @RequestBody Interaction interaction) {
        return interactionService.createInteraction(customerId, interaction);
    }

    @DeleteMapping("/{id}")
    public String deleteInteraction(@PathVariable Long id) {
        interactionService.deleteInteraction(id);
        return "Deleted interaction successfully";
    }
}
