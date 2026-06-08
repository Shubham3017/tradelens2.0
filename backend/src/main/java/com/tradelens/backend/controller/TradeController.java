package com.tradelens.backend.controller;

import com.tradelens.backend.dto.*;
import com.tradelens.backend.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @PostMapping
    public ResponseEntity<TradeResponse> addTrade(
            @Valid @RequestBody TradeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tradeService.addTrade(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<TradeResponse>> getAllTrades(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tradeService.getAllTrades(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TradeResponse> getTradeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tradeService.getTradeById(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TradeResponse> updateTrade(
            @PathVariable Long id,
            @Valid @RequestBody TradeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tradeService.updateTrade(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrade(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        tradeService.deleteTrade(id, userDetails.getUsername());
        return ResponseEntity.ok("Trade deleted successfully");
    }
}