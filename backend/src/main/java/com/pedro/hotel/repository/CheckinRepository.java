package com.pedro.hotel.repository;

import com.pedro.hotel.model.Checkin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CheckinRepository extends MongoRepository<Checkin, String> {
    
    List<Checkin> findByPessoaDocumento(String documento);
    
    List<Checkin> findByPessoaNomeContainingIgnoreCase(String nome);
    
    @Query("{'dataEntrada': {$lte: ?0}, 'dataSaida': {$gte: ?0}}")
    List<Checkin> findCheckinsAtivos(LocalDateTime dataReferencia);
    
    @Query("{'adicionalVeiculo': true}")
    List<Checkin> findCheckinsComVeiculo();
    
    @Query("{'dataEntrada': {$gte: ?0}, 'dataSaida': {$lte: ?1}}")
    List<Checkin> findCheckinsPorPeriodo(LocalDateTime inicio, LocalDateTime fim);
    
    @Query("{'dataSaida': {$gte: ?0, $lte: ?1}}")
    List<Checkin> findCheckinsVencendo(LocalDateTime inicio, LocalDateTime fim);
    
    long count();
} 