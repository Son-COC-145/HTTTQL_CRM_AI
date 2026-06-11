package com.CrmAi.repository;

import com.CrmAi.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Objects;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Long countByPotentialScoreGreaterThanEqual(Integer score);

    Long countByPotentialScoreBetween(Integer min, Integer max);

    Long countByPotentialScoreLessThan(Integer score);

    @Query("SELECT c.source, COUNT(c) FROM Customer c GROUP BY c.source")
    List<Object[]> countCustomersBySource();

    @Query("SELECT c.status, COUNT(c) FROM Customer c GROUP BY c.status")
    List<Object[]> countCustomersByStatus();

    List<Customer> findTop5ByOrderByPotentialScoreDesc();

    List<Customer> findTop10ByOrderByPotentialScoreDesc();

    List<Customer> findByStatus(String status);

    List<Customer> findBySourceIgnoreCase(String source);
}

