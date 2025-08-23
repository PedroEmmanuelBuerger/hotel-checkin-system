package com.pedro.hotel.service;

import com.pedro.hotel.model.Pessoa;
import com.pedro.hotel.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PessoaService {
    
    @Autowired
    private PessoaRepository pessoaRepository;
    
    public Pessoa criarPessoa(Pessoa pessoa) {
        if (pessoaRepository.existsByDocumento(pessoa.getDocumento())) {
            throw new RuntimeException("Pessoa com documento " + pessoa.getDocumento() + " já existe");
        }
        
        if (pessoaRepository.existsByTelefone(pessoa.getTelefone())) {
            throw new RuntimeException("Pessoa com telefone " + pessoa.getTelefone() + " já existe");
        }
        
        return pessoaRepository.save(pessoa);
    }
    
    public Optional<Pessoa> buscarPorDocumento(String documento) {
        return pessoaRepository.findByDocumento(documento);
    }
    
    public Optional<Pessoa> buscarPorTelefone(String telefone) {
        return pessoaRepository.findByTelefone(telefone);
    }
    
    public List<Pessoa> buscarPorNome(String nome) {
        return pessoaRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    public List<Pessoa> listarTodas() {
        return pessoaRepository.findAll();
    }
    
    public long contarPessoas() {
        return pessoaRepository.count();
    }
    
    public Pessoa atualizarPessoa(String documento, Pessoa pessoaAtualizada) {
        Optional<Pessoa> pessoaExistente = pessoaRepository.findByDocumento(documento);
        
        if (pessoaExistente.isPresent()) {
            Pessoa pessoa = pessoaExistente.get();
            
            if (!pessoa.getDocumento().equals(pessoaAtualizada.getDocumento()) &&
                pessoaRepository.existsByDocumento(pessoaAtualizada.getDocumento())) {
                throw new RuntimeException("Documento " + pessoaAtualizada.getDocumento() + " já existe");
            }
            
            if (!pessoa.getTelefone().equals(pessoaAtualizada.getTelefone()) &&
                pessoaRepository.existsByTelefone(pessoaAtualizada.getTelefone())) {
                throw new RuntimeException("Telefone " + pessoaAtualizada.getTelefone() + " já existe");
            }
            
            pessoa.setNome(pessoaAtualizada.getNome());
            pessoa.setDocumento(pessoaAtualizada.getDocumento());
            pessoa.setTelefone(pessoaAtualizada.getTelefone());
            
            return pessoaRepository.save(pessoa);
        } else {
            throw new RuntimeException("Pessoa com documento " + documento + " não encontrada");
        }
    }
    
    public boolean deletarPessoa(String documento) {
        if (pessoaRepository.existsByDocumento(documento)) {
            pessoaRepository.deleteByDocumento(documento);
            return true;
        }
        return false;
    }
    
    public boolean existePorDocumento(String documento) {
        return pessoaRepository.existsByDocumento(documento);
    }
    
    public boolean existePorTelefone(String telefone) {
        return pessoaRepository.existsByTelefone(telefone);
    }
} 