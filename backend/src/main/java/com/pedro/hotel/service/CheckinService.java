package com.pedro.hotel.service;

import com.pedro.hotel.model.Checkin;
import com.pedro.hotel.model.Pessoa;
import com.pedro.hotel.repository.CheckinRepository;
import com.pedro.hotel.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CheckinService {
    
    @Autowired
    private CheckinRepository checkinRepository;
    
    @Autowired
    private PessoaRepository pessoaRepository;
    
    public Checkin criarCheckin(Checkin checkin) {
        validarCheckin(checkin);
        
        Pessoa pessoa = pessoaRepository.findByDocumento(checkin.getPessoa().getDocumento())
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada com documento: " + checkin.getPessoa().getDocumento()));
        
        checkin.setPessoa(pessoa);
        
        return checkinRepository.save(checkin);
    }
    
    private void validarCheckin(Checkin checkin) {
        if (checkin.getPessoa() == null || checkin.getPessoa().getDocumento() == null) {
            throw new RuntimeException("Pessoa e documento são obrigatórios");
        }
        
        if (checkin.getDataEntrada() == null) {
            throw new RuntimeException("Data de entrada é obrigatória");
        }
        
        if (checkin.getDataSaida() == null) {
            throw new RuntimeException("Data de saída é obrigatória");
        }
        
        if (checkin.getDataEntrada().isAfter(checkin.getDataSaida())) {
            throw new RuntimeException("Data de entrada não pode ser posterior à data de saída");
        }
        
        if (checkin.getDataEntrada().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Data de entrada não pode ser no passado");
        }
        
        if (ChronoUnit.DAYS.between(checkin.getDataEntrada(), checkin.getDataSaida()) > 30) {
            throw new RuntimeException("Estadia máxima permitida é de 30 dias");
        }
        
        verificarDisponibilidade(checkin);
    }
    
    private void verificarDisponibilidade(Checkin checkin) {
        List<Checkin> checkinsExistentes = checkinRepository.findByPessoaDocumento(checkin.getPessoa().getDocumento());
        
        for (Checkin existente : checkinsExistentes) {
            if (datasConflitam(checkin.getDataEntrada(), checkin.getDataSaida(), 
                               existente.getDataEntrada(), existente.getDataSaida())) {
                throw new RuntimeException("Já existe um check-in para esta pessoa no período especificado");
            }
        }
    }
    
    private boolean datasConflitam(LocalDateTime entrada1, LocalDateTime saida1, 
                                   LocalDateTime entrada2, LocalDateTime saida2) {
        return !(saida1.isBefore(entrada2) || entrada1.isAfter(saida2));
    }
    
    public List<Checkin> buscarPorDocumentoPessoa(String documento) {
        if (documento == null || documento.trim().isEmpty()) {
            throw new RuntimeException("Documento é obrigatório");
        }
        return checkinRepository.findByPessoaDocumento(documento);
    }
    
    public List<Checkin> buscarPorNomePessoa(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new RuntimeException("Nome é obrigatório");
        }
        return checkinRepository.findByPessoaNomeContainingIgnoreCase(nome);
    }
    
    public List<Checkin> buscarCheckinsAtivos() {
        LocalDateTime agora = LocalDateTime.now();
        List<Checkin> todos = checkinRepository.findAll();
        
        return todos.stream()
                .filter(checkin -> checkin.getDataEntrada().isBefore(agora) && 
                                  checkin.getDataSaida().isAfter(agora))
                .toList();
    }
    
    public List<Checkin> buscarCheckinsPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio == null || fim == null) {
            throw new RuntimeException("Datas de início e fim são obrigatórias");
        }
        
        if (inicio.isAfter(fim)) {
            throw new RuntimeException("Data de início deve ser anterior à data de fim");
        }
        
        List<Checkin> todos = checkinRepository.findAll();
        
        return todos.stream()
                .filter(checkin -> datasConflitam(inicio, fim, 
                                                 checkin.getDataEntrada(), checkin.getDataSaida()))
                .toList();
    }
    
    public List<Checkin> buscarCheckinsComVeiculo() {
        List<Checkin> todos = checkinRepository.findAll();
        return todos.stream()
                .filter(Checkin::isAdicionalVeiculo)
                .toList();
    }
    
    public List<Checkin> listarTodos() {
        return checkinRepository.findAll();
    }
    
    public long contarCheckins() {
        return checkinRepository.count();
    }
    
    public long contarCheckinsAtivos() {
        return buscarCheckinsAtivos().size();
    }
    
    public long contarCheckinsComVeiculo() {
        return buscarCheckinsComVeiculo().size();
    }
    
    public double calcularTaxaOcupacao(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio == null || fim == null) {
            throw new RuntimeException("Datas de início e fim são obrigatórias");
        }
        
        List<Checkin> checkinsNoPeriodo = buscarCheckinsPorPeriodo(inicio, fim);
        long diasPeriodo = ChronoUnit.DAYS.between(inicio, fim);
        
        if (diasPeriodo == 0) return 0.0;
        
        long totalDiasOcupacao = checkinsNoPeriodo.stream()
                .mapToLong(checkin -> {
                    LocalDateTime entrada = checkin.getDataEntrada().isBefore(inicio) ? inicio : checkin.getDataEntrada();
                    LocalDateTime saida = checkin.getDataSaida().isAfter(fim) ? fim : checkin.getDataSaida();
                    return ChronoUnit.DAYS.between(entrada, saida);
                })
                .sum();
        
        return (double) totalDiasOcupacao / diasPeriodo;
    }
    
    public List<Checkin> buscarCheckinsVencendo(LocalDateTime dataReferencia) {
        final LocalDateTime dataRef = dataReferencia != null ? dataReferencia : LocalDateTime.now();
        
        List<Checkin> todos = checkinRepository.findAll();
        
        return todos.stream()
                .filter(checkin -> {
                    LocalDateTime vencimento = checkin.getDataSaida().minusDays(1);
                    return vencimento.isAfter(dataRef) && 
                           vencimento.isBefore(dataRef.plusDays(7));
                })
                .toList();
    }
} 