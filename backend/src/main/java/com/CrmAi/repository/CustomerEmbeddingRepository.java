package com.CrmAi.repository;

import com.CrmAi.entity.CustomerEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerEmbeddingRepository extends JpaRepository<CustomerEmbedding, Long> {

    Optional<CustomerEmbedding> findByCustomerId(Long customerId);

    void deleteByCustomerId(Long customerId);
}