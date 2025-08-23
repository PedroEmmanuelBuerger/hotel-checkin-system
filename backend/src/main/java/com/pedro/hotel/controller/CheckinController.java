package com.pedro.hotel.controller;

import com.pedro.hotel.model.Checkin;
import com.pedro.hotel.service.CheckinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
        List<Checkin> checkins = checkinService.buscarPorDocumentoPessoa(documento);
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/pessoa/nome/{nome}")
    public ResponseEntity<List<Checkin>> buscarPorNomePessoa(@PathVariable String nome) {
        List<Checkin> checkins = checkinService.buscarPorNomePessoa(nome);
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarCheckins() {
        long total = checkinService.contarCheckins();
        Map<String, Long> resultado = new HashMap<>();
        resultado.put("total", total);
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "OK");
        status.put("servico", "Checkin CRUD");
        return ResponseEntity.ok(status);
    }
} 