package controller;

import entity.Mission;
import entity.Report;
import service.MissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin(origins = "*")
public class MissionController {

    private final MissionService missionService;
    // Allows pushing messages in real time
    private final SimpMessagingTemplate messagingTemplate;

    public MissionController(MissionService missionService, SimpMessagingTemplate messagingTemplate) {
        this.missionService = missionService;
        this.messagingTemplate = messagingTemplate;
    }

    // Fetch all missions
    @GetMapping
    public List<Mission> getAll() {
        return missionService.getAllMissions();
    }

    // Filters missions by manager - guarded against an invalid ID
    @GetMapping("/manager/{managerId}")
    public List<Mission> getMissionsByManager(@PathVariable Long managerId) {
        return missionService.getMissionsByManager(managerId);
    }

    // Create a new mission
    @PostMapping
    public Mission createMission(@RequestBody Mission mission) {
        if (mission == null) {
            throw new IllegalArgumentException("נתוני המשימה שנשלחו אינם תקינים או ריקים.");
        }
        return missionService.saveMission(mission);
    }

    // Submit a report for a mission + broadcast a real-time notification to the manager
    @PostMapping("/{missionId}/report")
    public Report submitReport(@PathVariable Long missionId, @RequestParam Long agentId, @RequestParam String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("תוכן הדיווח אינו יכול להיות ריק.");
        }
        try {
            Report savedReport = missionService.addReport(missionId, agentId, text);
            try {
                // Identify the manager who created the mission
                Long managerId = savedReport.getMission().getCreatorManager().getId();

                Map<String, Object> notification = new HashMap<>();
                notification.put("senderId", agentId);

                Map<String, Object> senderInfo = new HashMap<>();
                // Fetch the agent's name from the report
                senderInfo.put("codename", savedReport.getAuthor().getCodename());
                notification.put("sender", senderInfo);

                // So the manager knows this is a report and not a regular chat message
                notification.put("text", "[FIELD REPORT] " + text);

                // Broadcast notifications to the manager
                messagingTemplate.convertAndSend("/topic/notifications/user/" + managerId, notification);
            } catch (Exception ex) {
                System.out.println("WebSocket Report Notification Failed: " + ex.getMessage());
            }
            return savedReport;
        } catch (Exception e) {
            throw new IllegalArgumentException("נכשל בהגשת הדיווח. ודא כי מזהה המשימה (" + missionId + ") ומזהה הסוכן (" + agentId + ") קיימים במערכת.");
        }
    }

    // Complete a mission
    @PostMapping("/{missionId}/complete")
    public Mission completeMission(@PathVariable Long missionId) {
        try {
            return missionService.completeMission(missionId);
        } catch (Exception e) {
            throw new IllegalArgumentException("לא ניתן להשלים את המשימה. מזהה משימה " + missionId + " לא נמצא במערכת.");
        }
    }

    // Summarize the mission using AI
    @PostMapping("/{id}/summarize")
    public ResponseEntity<?> summarizeMission(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(missionService.generateAiSummary(id));
        } catch (Exception e) {
            throw new IllegalArgumentException("נכשל בהפקת סיכום AI עבור משימה מספר " + id + ". ודא שהמשימה קיימת ומכילה דיווחים.");
        }
    }

    // Delete a mission
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMission(@PathVariable Long id) {
        try {
            missionService.deleteMission(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            throw new IllegalArgumentException("מחיקת המשימה נכשלה. מזהה משימה " + id + " לא נמצא במערכת.");
        }
    }
}