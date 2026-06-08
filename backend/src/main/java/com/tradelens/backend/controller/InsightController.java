package com.tradelens.backend.controller;

import com.tradelens.backend.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/insights")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(insightService.getInsights(userDetails.getUsername()));
    }
}