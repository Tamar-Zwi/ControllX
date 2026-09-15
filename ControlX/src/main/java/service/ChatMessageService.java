package service;

import entity.ChatMessage;
import entity.Mission;
import entity.AgencyEmployee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.ChatMessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Transactional
    public ChatMessage saveMessage(Mission mission, AgencyEmployee sender, AgencyEmployee recipient, String text) {
        ChatMessage message = new ChatMessage();
        message.setMission(mission);
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setMessageText(text);
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        return chatMessageRepository.save(message);
    }


     // Fetch private chat history between a manager and an agent in a specific mission

    public List<ChatMessage> getPrivateChatHistory(Long missionId, Long user1Id, Long user2Id) {
        return chatMessageRepository.findPrivateChatHistory(missionId, user1Id, user2Id);
    }


    // Mark messages as read
    @Transactional
    public void markPrivateMessagesAsRead(Long missionId, Long senderId, Long recipientId) {
        chatMessageRepository.markPrivateMessagesAsRead(missionId, senderId, recipientId);
    }

     // Count unread messages
    public long getUnreadPrivateMessagesCount(Long missionId, Long senderId, Long recipientId) {
        return chatMessageRepository.countUnreadPrivateMessages(missionId, senderId, recipientId);
    }

     // Fetch the last message in the mission
    public ChatMessage getLastMessageByMission(Long missionId) {
        return chatMessageRepository.findFirstByMissionIdOrderByTimestampDesc(missionId);
    }
}