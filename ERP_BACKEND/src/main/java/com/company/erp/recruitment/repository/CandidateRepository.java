package com.company.erp.recruitment.repository;

import com.company.erp.common.enums.CandidateStatus;
import com.company.erp.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByEmail(String email);

    List<Candidate> findByStatus(CandidateStatus status);

    boolean existsByEmail(String email);

    List<Candidate> findByJobOfferId(Long jobOfferId);

}
