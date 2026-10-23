package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByContentTypeAndContentIdAndReporterId(
        String contentType,
        Long contentId,
        Long reporterId
    );

    @Transactional
    void deleteByContentTypeAndContentId(String contentType, Long contentId);
}