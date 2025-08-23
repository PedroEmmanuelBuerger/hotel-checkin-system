package com.pedro.hotel.service;

import com.pedro.hotel.model.Checkin;
import com.pedro.hotel.model.Pessoa;
import com.pedro.hotel.repository.CheckinRepository;
import com.pedro.hotel.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CheckinService {
    
    @Autowired
    private CheckinRepository checkinRepository;
    
    @Autowired
    private PessoaRepository pessoaRepository;
    
    public Checkin criarCheckin(Checkin checkin) {
        if (checkin.getDataEntrada().isAfter(checkin.getDataSaida())) {
            throw new RuntimeException("Data de entrada não pode ser posterior à data de saída");
        }
        
        Pessoa pessoa = pessoaRepository.findByDocumento(checkin.getPessoa().getDocumento())
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        
        checkin.setPessoa(pessoa);
        
        return checkinRepository.save(checkin);
    }
    
    public List<Checkin> buscarPorDocumentoPessoa(String documento) {
        return checkinRepository.findByPessoaDocumento(documento);
    }
    
    public List<Checkin> buscarPorNomePessoa(String nome) {
        return checkinRepository.findByPessoaNomeContainingIgnoreCase(nome);
    }
    
    public List<Checkin> listarTodos() {
        return checkinRepository.findAll();
    }
    
    public long contarCheckins() {
        return checkinRepository.count();
    }
} 