package com.CrmAi.repository;

import com.CrmAi.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Long countByPotentialScoreGreaterThanEqual(Integer score);

    Long countByPotentialScoreBetween(Integer min, Integer max);

    Long countByPotentialScoreLessThan(Integer score);
}

