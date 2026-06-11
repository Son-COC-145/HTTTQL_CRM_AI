package com.CrmAi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="customer_id", unique = true)
    private Long customerId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "embedding_json", columnDefinition = "TEXT")
    private String embeddingJson;
}