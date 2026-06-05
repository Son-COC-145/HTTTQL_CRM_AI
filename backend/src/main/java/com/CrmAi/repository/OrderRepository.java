package com.CrmAi.repository;

import com.CrmAi.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o")
    BigDecimal getTotalRevenue();

    @Query("SELECT c.status, COUNT(c) FROM Customer c GROUP BY c.status")
    List<Object[]> countCustomersByStatus();

    @Query(value = """
    SELECT TO_CHAR(order_date, 'YYYY-MM') AS month,
           COALESCE(SUM(amount), 0) AS revenue
    FROM orders
    GROUP BY TO_CHAR(order_date, 'YYYY-MM')
    ORDER BY month
    """, nativeQuery = true)
    List<Object[]> getMonthlyRevenue();
}
