package com.pedro.hotel.model;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Document(collection = "checkins")
public class Checkin {
    
    @NotNull(message = "Pessoa é obrigatória")
    private Pessoa pessoa;
    
    @NotNull(message = "Data de entrada é obrigatória")
    private LocalDateTime dataEntrada;
    
    @NotNull(message = "Data de saída é obrigatória")
    private LocalDateTime dataSaida;
    
    private boolean adicionalVeiculo;
    
    public Checkin() {
    }
    
    public Checkin(Pessoa pessoa, LocalDateTime dataEntrada, LocalDateTime dataSaida, boolean adicionalVeiculo) {
        this.pessoa = pessoa;
        this.dataEntrada = dataEntrada;
        this.dataSaida = dataSaida;
        this.adicionalVeiculo = adicionalVeiculo;
    }
    
    public Pessoa getPessoa() {
        return pessoa;
    }
    
    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }
    
    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }
    
    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;
    }
    
    public LocalDateTime getDataSaida() {
        return dataSaida;
    }
    
    public void setDataSaida(LocalDateTime dataSaida) {
        this.dataSaida = dataSaida;
    }
    
    public boolean isAdicionalVeiculo() {
        return adicionalVeiculo;
    }
    
    public void setAdicionalVeiculo(boolean adicionalVeiculo) {
        this.adicionalVeiculo = adicionalVeiculo;
    }
    
    @Override
    public String toString() {
        return "Checkin{" +
                "pessoa=" + pessoa +
                ", dataEntrada=" + dataEntrada +
                ", dataSaida=" + dataSaida +
                ", adicionalVeiculo=" + adicionalVeiculo +
                '}';
    }
} 