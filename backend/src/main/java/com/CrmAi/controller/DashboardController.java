package com.CrmAi.controller;

import com.CrmAi.dto.DashboardDto;
import com.CrmAi.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public DashboardDto getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
}
