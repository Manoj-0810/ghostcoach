package com.playmotech.ghostcoach.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DocsController {

    @GetMapping("/docs")
    public String redirectToSwagger() {
        return "redirect:/swagger-ui/index.html";
    }
}
