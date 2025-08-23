package com.pedro.hotel.repository;

import com.pedro.hotel.model.Checkin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinRepository extends MongoRepository<Checkin, String> {
    
    List<Checkin> findByPessoaDocumento(String documento);
    
    List<Checkin> findByPessoaNomeContainingIgnoreCase(String nome);
    
    long count();
} 