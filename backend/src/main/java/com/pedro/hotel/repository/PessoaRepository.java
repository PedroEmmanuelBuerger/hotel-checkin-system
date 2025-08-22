package com.pedro.hotel.repository;

import com.pedro.hotel.model.Pessoa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PessoaRepository extends MongoRepository<Pessoa, String> {
    
    Optional<Pessoa> findByDocumento(String documento);
    
    List<Pessoa> findByNomeContainingIgnoreCase(String nome);
    
    Optional<Pessoa> findByTelefone(String telefone);
    
    boolean existsByDocumento(String documento);
    
    boolean existsByTelefone(String telefone);
    
    List<Pessoa> findByDataCriacaoBetween(java.time.LocalDateTime inicio, java.time.LocalDateTime fim);
    
    long count();
} 