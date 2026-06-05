package com.CrmAi.seed;

import com.CrmAi.entity.Customer;
import com.CrmAi.entity.Interaction;
import com.CrmAi.entity.Order;
import com.CrmAi.entity.Task;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.InteractionRepository;
import com.CrmAi.repository.OrderRepository;
import com.CrmAi.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final InteractionRepository interactionRepository;
    private final OrderRepository orderRepository;
    private final TaskRepository taskRepository;

    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            return;
        }

        List<Customer> customers = List.of(
                createCustomer("Nguyễn Văn A", "0987654321", "nguyenvana@gmail.com", "Facebook", "LEAD", 85, "Quan tâm gói CRM Premium"),
                createCustomer("Trần Thị B", "0912345678", "tranthib@gmail.com", "Website", "POTENTIAL", 68, "Đã hỏi báo giá dịch vụ"),
                createCustomer("Lê Văn C", "0909999888", "levanc@gmail.com", "Zalo", "CUSTOMER", 45, "Khách cũ, lâu chưa tương tác"),
                createCustomer("Phạm Minh D", "0977111222", "minhd@gmail.com", "Referral", "LEAD", 92, "Được giới thiệu từ khách hàng cũ"),
                createCustomer("Hoàng Thu E", "0966333444", "thue@gmail.com", "Facebook", "POTENTIAL", 74, "Quan tâm gói tư vấn doanh nghiệp nhỏ"),
                createCustomer("Đặng Quốc F", "0933444555", "quocf@gmail.com", "Website", "LEAD", 55, "Mới để lại thông tin liên hệ"),
                createCustomer("Bùi Lan G", "0922555666", "lang@gmail.com", "Zalo", "CUSTOMER", 88, "Đã mua nhiều lần"),
                createCustomer("Vũ Hải H", "0911999000", "haih@gmail.com", "Facebook", "INACTIVE", 35, "Không phản hồi sau nhiều lần liên hệ"),
                createCustomer("Đỗ Ngọc I", "0900888777", "ngoci@gmail.com", "Website", "POTENTIAL", 63, "Đang so sánh nhiều giải pháp"),
                createCustomer("Mai Anh K", "0988123456", "anhk@gmail.com", "Referral", "CUSTOMER", 95, "Khách VIP, có nhu cầu mở rộng"),
                createCustomer("Ngô Đức L", "0977000111", "ducl@gmail.com", "Facebook", "LEAD", 58, "Cần tư vấn thêm về chi phí"),
                createCustomer("Lý Thanh M", "0966111000", "thanhm@gmail.com", "Website", "POTENTIAL", 72, "Quan tâm bản dùng thử"),
                createCustomer("Cao Huy N", "0955222333", "huyn@gmail.com", "Zalo", "LEAD", 41, "Chưa có nhu cầu rõ ràng"),
                createCustomer("Tạ Hà O", "0944333222", "hao@gmail.com", "Referral", "CUSTOMER", 82, "Đã mua và có khả năng mua thêm"),
                createCustomer("Chu Bảo P", "0933222111", "baop@gmail.com", "Website", "INACTIVE", 28, "Không tương tác trong 30 ngày")
        );

        customers.forEach(this::createRelatedData);
    }

    private Customer createCustomer(
            String fullName,
            String phone,
            String email,
            String source,
            String status,
            Integer score,
            String note
    ) {
        return customerRepository.save(Customer.builder()
                .fullName(fullName)
                .phone(phone)
                .email(email)
                .source(source)
                .status(status)
                .potentialScore(score)
                .note(note)
                .build());
    }

    private void createRelatedData(Customer customer) {
        int score = customer.getPotentialScore();

        int interactionCount = score >= 80 ? 4 : score >= 60 ? 3 : 1;
        int orderCount = score >= 80 ? 3 : score >= 60 ? 1 : 0;
        BigDecimal amount = score >= 80
                ? new BigDecimal("6000000")
                : score >= 60
                ? new BigDecimal("3000000")
                : BigDecimal.ZERO;

        for (int i = 1; i <= interactionCount; i++) {
            interactionRepository.save(Interaction.builder()
                    .customer(customer)
                    .type(i % 2 == 0 ? "MESSAGE" : "CALL")
                    .content("Tương tác lần " + i + " với khách hàng " + customer.getFullName())
                    .interactionDate(LocalDateTime.now().minusDays(random.nextInt(10) + 1))
                    .build());
        }

        for (int i = 1; i <= orderCount; i++) {
            orderRepository.save(Order.builder()
                    .customer(customer)
                    .orderCode("ORD-" + customer.getId() + "-" + i)
                    .amount(amount)
                    .status("COMPLETED")
                    .orderDate(LocalDateTime.now().minusDays(random.nextInt(20) + 1))
                    .build());
        }

        taskRepository.save(Task.builder()
                .customer(customer)
                .title("Chăm sóc " + customer.getFullName())
                .description("Theo dõi trạng thái và đề xuất chăm sóc phù hợp.")
                .status(score >= 80 ? "TODO" : score >= 60 ? "IN_PROGRESS" : "TODO")
                .dueDate(LocalDateTime.now().plusDays(random.nextInt(7) + 1))
                .build());
    }
}