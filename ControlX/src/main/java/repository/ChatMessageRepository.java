package repository;

import entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Fetch private chat history between a manager and an agent within a mission
    @Query("SELECT c FROM ChatMessage c WHERE c.mission.id = :missionId AND " +
            "((c.sender.id = :user1Id AND c.recipient.id = :user2Id) OR " +
            "(c.sender.id = :user2Id AND c.recipient.id = :user1Id)) " +
            "ORDER BY c.timestamp ASC")
    List<ChatMessage> findPrivateChatHistory(Long missionId, Long user1Id, Long user2Id);

    // Mark messages as read in this specific chat
    @Modifying
    @Query("UPDATE ChatMessage c SET c.isRead = true WHERE c.mission.id = :missionId " +
            "AND c.sender.id = :senderId AND c.recipient.id = :recipientId AND c.isRead = false")
    void markPrivateMessagesAsRead(Long missionId, Long senderId, Long recipientId);

    // Count unread messages for a given user against a given agent in a mission
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.mission.id = :missionId " +
            "AND c.sender.id = :senderId AND c.recipient.id = :recipientId AND c.isRead = false")
    long countUnreadPrivateMessages(Long missionId, Long senderId, Long recipientId);

    // Fetch the last message sent in a specific mission
    ChatMessage findFirstByMissionIdOrderByTimestampDesc(Long missionId);
}