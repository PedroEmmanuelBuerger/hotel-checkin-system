package com.pedro.hotel.controller;

import com.pedro.hotel.model.Pessoa;
import com.pedro.hotel.service.PessoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoas")
@CrossOrigin(origins = "*")
public class PessoaController {
    
    @Autowired
    private PessoaService pessoaService;
    
    @PostMapping
    public ResponseEntity<?> criarPessoa(@Valid @RequestBody Pessoa pessoa) {
        try {
            Pessoa pessoaCriada = pessoaService.criarPessoa(pessoa);
            return ResponseEntity.status(HttpStatus.CREATED).body(pessoaCriada);
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().body(erro);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Pessoa>> listarTodas() {
        List<Pessoa> pessoas = pessoaService.listarTodas();
        return ResponseEntity.ok(pessoas);
    }
    
    @GetMapping("/documento/{documento}")
    public ResponseEntity<?> buscarPorDocumento(@PathVariable String documento) {
        Optional<Pessoa> pessoa = pessoaService.buscarPorDocumento(documento);
        if (pessoa.isPresent()) {
            return ResponseEntity.ok(pessoa.get());
        } else {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Pessoa com documento " + documento + " não encontrada");
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<?> buscarPorTelefone(@PathVariable String telefone) {
        Optional<Pessoa> pessoa = pessoaService.buscarPorTelefone(telefone);
        if (pessoa.isPresent()) {
            return ResponseEntity.ok(pessoa.get());
        } else {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Pessoa com telefone " + telefone + " não encontrada");
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<Pessoa>> buscarPorNome(@PathVariable String nome) {
        List<Pessoa> pessoas = pessoaService.buscarPorNome(nome);
        return ResponseEntity.ok(pessoas);
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarPessoas() {
        long total = pessoaService.contarPessoas();
        Map<String, Long> resultado = new HashMap<>();
        resultado.put("total", total);
        return ResponseEntity.ok(resultado);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarPessoa(@PathVariable String id, @Valid @RequestBody Pessoa pessoa) {
        try {
            Pessoa pessoaAtualizada = pessoaService.atualizarPessoaPorId(id, pessoa);
            return ResponseEntity.ok(pessoaAtualizada);
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().body(erro);
        }
    }
    
    @DeleteMapping("/documento/{documento}")
    public ResponseEntity<?> deletarPessoa(@PathVariable String documento) {
        boolean deletado = pessoaService.deletarPessoa(documento);
        if (deletado) {
            Map<String, String> mensagem = new HashMap<>();
            mensagem.put("mensagem", "Pessoa com documento " + documento + " deletada com sucesso");
            return ResponseEntity.ok(mensagem);
        } else {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Pessoa com documento " + documento + " não encontrada");
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "OK");
        status.put("servico", "Pessoa CRUD");
        return ResponseEntity.ok(status);
    }
} 