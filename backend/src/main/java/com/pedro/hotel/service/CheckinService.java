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

        if (inicio.isAfter(fim)) {
            throw new RuntimeException("Data de início não pode ser posterior à data de fim");
        }

        List<Checkin> todosCheckins = checkinRepository.findAll();
        long diasTotaisPeriodo = ChronoUnit.DAYS.between(inicio.toLocalDate(), fim.toLocalDate());
        if (diasTotaisPeriodo == 0) diasTotaisPeriodo = 1;

        long diasOcupados = todosCheckins.stream()
                .mapToLong(checkin -> {
                    LocalDateTime checkinInicio = checkin.getDataEntrada();
                    LocalDateTime checkinFim = checkin.getDataSaida();

                    LocalDateTime intersecaoInicio = checkinInicio.isAfter(inicio) ? checkinInicio : inicio;
                    LocalDateTime intersecaoFim = checkinFim.isBefore(fim) ? checkinFim : fim;

                    if (intersecaoInicio.isBefore(intersecaoFim)) {
                        return ChronoUnit.DAYS.between(intersecaoInicio.toLocalDate(), intersecaoFim.toLocalDate());
                    }
                    return 0;
                })
                .sum();

        return (double) diasOcupados / diasTotaisPeriodo;
    }

    public List<Checkin> buscarCheckinsPresentes() {
        LocalDateTime agora = LocalDateTime.now();
        return checkinRepository.findAll().stream()
                .filter(checkin -> checkin.getDataEntrada().isBefore(agora) && 
                                  checkin.getDataSaida().isAfter(agora))
                .toList();
    }

    public List<Checkin> buscarCheckinsQueSairam() {
        LocalDateTime agora = LocalDateTime.now();
        return checkinRepository.findAll().stream()
                .filter(checkin -> checkin.getDataSaida().isBefore(agora))
                .toList();
    }

    public List<Checkin> buscarCheckinsReservaFutura() {
        LocalDateTime agora = LocalDateTime.now();
        return checkinRepository.findAll().stream()
                .filter(checkin -> checkin.getDataEntrada().isAfter(agora))
                .toList();
    }

    public double calcularValorGasto(Checkin checkin) {
        double valorTotal = 0.0;
        
        // Percorre apenas as noites (dataEntrada inclusive, dataSaida exclusiva)
        LocalDateTime dataAtual = checkin.getDataEntrada().toLocalDate().atStartOfDay();
        LocalDateTime dataSaida = checkin.getDataSaida().toLocalDate().atStartOfDay();
        
        while (dataAtual.isBefore(dataSaida)) {
            // Verifica se é fim de semana (sábado = 6, domingo = 7)
            boolean isFimDeSemana = dataAtual.getDayOfWeek().getValue() >= 6;
            
            // Tarifa da diária
            double tarifaDiaria = isFimDeSemana ? 150.0 : 120.0;
            valorTotal += tarifaDiaria;
            
            // Taxa de garagem se houver veículo
            if (checkin.isAdicionalVeiculo()) {
                double taxaGaragem = isFimDeSemana ? 20.0 : 15.0;
                valorTotal += taxaGaragem;
            }
            
            // Avança para o próximo dia
            dataAtual = dataAtual.plusDays(1);
        }
        
        // Verifica se a hora de saída é maior que 16:30
        // Se sim, cobra +1 diária completa (inclusive garagem se houver)
        if (checkin.getDataSaida().toLocalTime().isAfter(java.time.LocalTime.of(16, 30))) {
            // Verifica se o dia de saída é fim de semana
            boolean isFimDeSemanaSaida = checkin.getDataSaida().getDayOfWeek().getValue() >= 6;
            
            // Adiciona tarifa da diária extra
            double tarifaDiariaExtra = isFimDeSemanaSaida ? 150.0 : 120.0;
            valorTotal += tarifaDiariaExtra;
            
            // Adiciona taxa de garagem extra se houver veículo
            if (checkin.isAdicionalVeiculo()) {
                double taxaGaragemExtra = isFimDeSemanaSaida ? 20.0 : 15.0;
                valorTotal += taxaGaragemExtra;
            }
        }
        
        return valorTotal;
    }

    public Checkin buscarPorId(String id) {
        return checkinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Check-in não encontrado com o ID: " + id));
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