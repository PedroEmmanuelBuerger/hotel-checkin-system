package com.pedro.hotel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "OK");
        status.put("servico", "Hotel Check-in System");
        status.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthDetailed() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "OK");
        status.put("servico", "Hotel Check-in System");
        status.put("timestamp", java.time.LocalDateTime.now().toString());
        status.put("versao", "1.0.0");
        return ResponseEntity.ok(status);
    }
} 