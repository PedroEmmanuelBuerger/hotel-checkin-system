package com.pedro.hotel.controller;

import com.pedro.hotel.model.Checkin;
import com.pedro.hotel.service.CheckinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkins")
@CrossOrigin(origins = "*")
public class CheckinController {
    
    @Autowired
    private CheckinService checkinService;
    
    @PostMapping
    public ResponseEntity<?> criarCheckin(@Valid @RequestBody Checkin checkin) {
        try {
            Checkin checkinCriado = checkinService.criarCheckin(checkin);
            return ResponseEntity.status(HttpStatus.CREATED).body(checkinCriado);
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().body(erro);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Checkin>> listarTodos() {
        List<Checkin> checkins = checkinService.listarTodos();
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/pessoa/documento/{documento}")
    public ResponseEntity<List<Checkin>> buscarPorDocumentoPessoa(@PathVariable String documento) {
        try {
            List<Checkin> checkins = checkinService.buscarPorDocumentoPessoa(documento);
            return ResponseEntity.ok(checkins);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pessoa/nome/{nome}")
    public ResponseEntity<List<Checkin>> buscarPorNomePessoa(@PathVariable String nome) {
        try {
            List<Checkin> checkins = checkinService.buscarPorNomePessoa(nome);
            return ResponseEntity.ok(checkins);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/ativos")
    public ResponseEntity<List<Checkin>> buscarCheckinsAtivos() {
        List<Checkin> checkins = checkinService.buscarCheckinsAtivos();
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/periodo")
    public ResponseEntity<List<Checkin>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        try {
            List<Checkin> checkins = checkinService.buscarCheckinsPorPeriodo(inicio, fim);
            return ResponseEntity.ok(checkins);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/veiculo")
    public ResponseEntity<List<Checkin>> buscarCheckinsComVeiculo() {
        List<Checkin> checkins = checkinService.buscarCheckinsComVeiculo();
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/vencendo")
    public ResponseEntity<List<Checkin>> buscarCheckinsVencendo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataReferencia) {
        List<Checkin> checkins = checkinService.buscarCheckinsVencendo(dataReferencia);
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarCheckins() {
        long total = checkinService.contarCheckins();
        long ativos = checkinService.contarCheckinsAtivos();
        long comVeiculo = checkinService.contarCheckinsComVeiculo();
        
        Map<String, Long> resultado = new HashMap<>();
        resultado.put("total", total);
        resultado.put("ativos", ativos);
        resultado.put("comVeiculo", comVeiculo);
        
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/taxa-ocupacao")
    public ResponseEntity<Map<String, Object>> calcularTaxaOcupacao(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        try {
            double taxa = checkinService.calcularTaxaOcupacao(inicio, fim);
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("taxaOcupacao", taxa);
            resultado.put("periodoInicio", inicio);
            resultado.put("periodoFim", fim);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            Map<String, Object> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().body(erro);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "OK");
        status.put("servico", "Checkin CRUD");
        status.put("versao", "2.0");
        return ResponseEntity.ok(status);
    }
} 