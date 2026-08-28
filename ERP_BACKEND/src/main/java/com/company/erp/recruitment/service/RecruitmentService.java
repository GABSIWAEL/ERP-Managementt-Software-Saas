package com.company.erp.recruitment.service;

import com.company.erp.recruitment.dto.CandidateDTO;
import java.util.List;

public interface RecruitmentService {
    
    CandidateDTO createCandidate(CandidateDTO candidateDTO);
    
    CandidateDTO updateCandidate(Long id, CandidateDTO candidateDTO);
    
    CandidateDTO updateCandidateStatus(Long id, String status);
    
    void deleteCandidate(Long id);
    
    CandidateDTO getCandidateById(Long id);
    
    List<CandidateDTO> getAllCandidates();
    
    List<CandidateDTO> getCandidatesByStatus(String status);
    
    List<CandidateDTO> getCandidatesByPosition(String position);
    
    List<CandidateDTO> getCandidatesByJobOffer(Long jobOfferId);
}
