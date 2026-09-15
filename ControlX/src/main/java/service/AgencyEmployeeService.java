package service;

import entity.AgencyEmployee;
import entity.DeskManager;
import entity.FieldAgent;
import entity.Mission;
import repository.AgencyEmployeeRepository;
import repository.MissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgencyEmployeeService {

    private final AgencyEmployeeRepository employeeRepository;
    private final MissionRepository missionRepository;

    public AgencyEmployeeService(AgencyEmployeeRepository employeeRepository, MissionRepository missionRepository) {
        this.employeeRepository = employeeRepository;
        this.missionRepository = missionRepository;
    }

    public AgencyEmployee saveEmployee(AgencyEmployee employee) {
        return employeeRepository.save(employee);
    }

    // Smart agent recruitment
    @Transactional
    public FieldAgent recruitNewAgent(FieldAgent agent, Long managerId) {
        // Fetch the recruiting manager
        DeskManager manager = (DeskManager) employeeRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("מנהל מגייס לא נמצא במערכת!"));

        // The agent inherits the department and manager of whoever recruited them
        agent.setDepartment(manager.getDepartment());
        agent.setRecruitingManager(manager);

        // Set initial status
        if (agent.getStatus() == null) {
            agent.setStatus(FieldAgent.AgentStatus.AVAILABLE);
        }

        return employeeRepository.save(agent);
    }

    public List<AgencyEmployee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional
    public void deleteEmployee(Long id) {
        AgencyEmployee employee = employeeRepository.findById(id).orElse(null);

        if (employee instanceof FieldAgent) {
            FieldAgent agent = (FieldAgent) employee;

            // Fetch all missions related to the agent
            List<Mission> allMissions = missionRepository.findAll();

            for (Mission mission : allMissions) {
                if (mission.getAssignedAgents() != null && mission.getAssignedAgents().contains(agent)) {

                    // Check whether the mission is active
                    boolean isActive = mission.getStatus() == Mission.MissionStatus.IN_PROGRESS;

                    // Check whether they are the last agent in the mission
                    boolean isLastAgent = mission.getAssignedAgents().size() == 1;

                    if (isActive && isLastAgent) {
                        // Active mission and they are alone - delete the mission
                        missionRepository.delete(mission);
                    } else {
                        // There are other agents, or the mission isn't active - just remove them from the list
                        mission.getAssignedAgents().remove(agent);
                        missionRepository.save(mission);
                    }
                }
            }
        }

        // Finally, delete the agent itself
        employeeRepository.deleteById(id);
    }
}