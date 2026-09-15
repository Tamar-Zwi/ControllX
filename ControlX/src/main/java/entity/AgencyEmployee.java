package entity;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@Entity
@Table(name = "employees")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "employee_type", discriminatorType = DiscriminatorType.STRING)
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "employee_type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = FieldAgent.class, name = "AGENT"),
        @JsonSubTypes.Type(value = DeskManager.class, name = "MANAGER")
})
public class AgencyEmployee {

    public enum ClearanceLevel {
        STANDARD, // Basic clearance
        CONFIDENTIAL, // Restricted
        SECRET, // Secret
        TOP_SECRET, // Top secret
        COSMIC // Highest clearance level
    }
    public enum Department {
        CYBER,          // Cyber unit
        INTELLIGENCE,   // Intelligence division
        OPERATIONS,     // Operations division
        LOGISTICS       // Logistics and equipment
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private ClearanceLevel clearanceLevel;

    @Enumerated(EnumType.STRING)
    private Department department;
}