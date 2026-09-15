package entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("AGENT")
@Data
@EqualsAndHashCode(callSuper = true)
public class FieldAgent extends AgencyEmployee {

    public enum AgentStatus {
        AVAILABLE,    // Available
        ON_MISSION,   // On a mission
        INJURED,      // Injured
        ON_LEAVE      // Finished
    }

    public enum Specialty {
        COMBAT,        // Combat
        INFILTRATION,  // Infiltration
        SABOTAGE,      // Sabotage
        CYBER,         // General cyber
        SURVEILLANCE,  // Surveillance
        INTERROGATION, // Interrogation
        UNDERCOVER,    // Undercover activity
        HACKING,       // Hacking
        ENCRYPTION,    // Encryption
        SIGNALS,       // Signals intelligence
        WEAPONRY,      // Weaponry and armament
        TRANSPORT,     // Transport and logistics
        MEDICAL        // Medical
    }

    private String codename;

    @Enumerated(EnumType.STRING)
    private AgentStatus status;

    @Enumerated(EnumType.STRING)
    private Specialty specialty;

    @ManyToOne
    @JoinColumn(name = "recruiting_manager_id")
    private DeskManager recruitingManager;
}