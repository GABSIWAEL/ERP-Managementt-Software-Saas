package com.company.erp.accounting.repository;

import com.company.erp.accounting.entity.AccountingParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountingParameterRepository extends JpaRepository<AccountingParameter, Long> {

}
