package com.CrmAi.service;

import com.CrmAi.entity.AiChatHistory;
import com.CrmAi.repository.AiChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiChatHistoryService {

    private final AiChatHistoryRepository repository;

    public AiChatHistory save(String question, String answer) {
        AiChatHistory chat = new AiChatHistory();

        chat.setQuestion(question);
        chat.setAnswer(answer);
        chat.setCreatedAt(LocalDateTime.now());

        return repository.save(chat);
    }

    public List<AiChatHistory> getRecentHistory() {
        return repository.findTop20ByOrderByCreatedAtDesc();
    }
}