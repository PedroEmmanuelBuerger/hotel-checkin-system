package com.pedro.hotel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Backend funcionando corretamente!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
} 