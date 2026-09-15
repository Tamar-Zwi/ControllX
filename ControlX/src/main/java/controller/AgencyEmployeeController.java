package controller;

import entity.AgencyEmployee;
import entity.FieldAgent;
import service.AgencyEmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.JwtService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class AgencyEmployeeController {

    private final AgencyEmployeeService employeeService;
    private final JwtService jwtService;

    public AgencyEmployeeController(AgencyEmployeeService employeeService, JwtService jwtService) {
        this.employeeService = employeeService;
        this.jwtService = jwtService;
    }

    @GetMapping("/login/{passkey}")
    public ResponseEntity<?> login(@PathVariable String passkey) {
        return employeeService.getAllEmployees().stream()
                .filter(e -> e.getId().toString().equals(passkey))
                .findFirst()
                .map(employee -> {
                    String employeeType = employee instanceof entity.DeskManager ? "DeskManager" : "FieldAgent";
                    String token = jwtService.generateToken(employee.getId(), employeeType, employee.getFullName()); // Generate a token
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", employee.getId());
                    response.put("name", employee.getFullName());
                    response.put("department", employee.getDepartment());
                    response.put("employeeType", employeeType);
                    response.put("token", token);

                    return ResponseEntity.ok(response);
                })
                .orElseThrow(() -> new IllegalArgumentException("קוד הגישה (Passkey) שהוזן אינו קיים במערכת."));
    }

    // Smart agent recruitment
    @PostMapping("/recruit")
    public AgencyEmployee recruitAgent(@RequestBody FieldAgent agent, @RequestParam Long managerId) {
        return employeeService.recruitNewAgent(agent, managerId);
    }

    // Fetch agents by department - updated to handle an invalid Enum
    @GetMapping("/department/{dept}")
    public List<FieldAgent> getAgentsByDepartment(@PathVariable String dept) {
        try {
            AgencyEmployee.Department department = AgencyEmployee.Department.valueOf(dept.toUpperCase());
            return employeeService.getAllEmployees().stream()
                    .filter(e -> e instanceof FieldAgent)
                    .map(e -> (FieldAgent) e)
                    .filter(a -> a.getDepartment() == department)
                    .toList();

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("המחלקה המבוקשת '" + dept + "' אינה קיימת במערכת.");
        }
    }

    // Delete an employee
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    // Create a regular employee
    @PostMapping
    public AgencyEmployee create(@RequestBody AgencyEmployee employee) {
        return employeeService.saveEmployee(employee);
    }

    // Fetch all employees in the organization
    @GetMapping
    public List<AgencyEmployee> getAll() {
        return employeeService.getAllEmployees();
    }
}