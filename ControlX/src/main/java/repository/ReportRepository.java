package repository;

import entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // Allows finding all reports for a specific mission
    List<Report> findByMissionId(Long missionId);
}