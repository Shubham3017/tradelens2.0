package com.tradelens.backend.service;

import com.tradelens.backend.dto.*;
import com.tradelens.backend.model.*;
import com.tradelens.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TradeResponse toResponse(Trade trade) {
        return TradeResponse.builder()
                .id(trade.getId())
                .symbol(trade.getSymbol())
                .tradeType(trade.getTradeType())
                .entryPrice(trade.getEntryPrice())
                .exitPrice(trade.getExitPrice())
                .stopLoss(trade.getStopLoss())
                .target(trade.getTarget())
                .quantity(trade.getQuantity())
                .entryTime(trade.getEntryTime())
                .exitTime(trade.getExitTime())
                .strategy(trade.getStrategy())
                .notes(trade.getNotes())
                .pnl(trade.getPnl())
                .result(trade.getResult())
                .createdAt(trade.getCreatedAt())
                .build();
    }

    public TradeResponse addTrade(TradeRequest request, String email) {
        User user = getUser(email);

        Trade trade = Trade.builder()
                .user(user)
                .symbol(request.getSymbol())
                .tradeType(request.getTradeType())
                .entryPrice(request.getEntryPrice())
                .exitPrice(request.getExitPrice())
                .stopLoss(request.getStopLoss())
                .target(request.getTarget())
                .quantity(request.getQuantity())
                .entryTime(request.getEntryTime())
                .exitTime(request.getExitTime())
                .strategy(request.getStrategy())
                .notes(request.getNotes())
                .build();

        return toResponse(tradeRepository.save(trade));
    }

    public List<TradeResponse> getAllTrades(String email) {
        User user = getUser(email);
        return tradeRepository.findByUserOrderByEntryTimeDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TradeResponse getTradeById(Long id, String email) {
        User user = getUser(email);
        Trade trade = tradeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trade not found"));
        return toResponse(trade);
    }

    public TradeResponse updateTrade(Long id, TradeRequest request, String email) {
        User user = getUser(email);
        Trade trade = tradeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trade not found"));

        trade.setSymbol(request.getSymbol());
        trade.setTradeType(request.getTradeType());
        trade.setEntryPrice(request.getEntryPrice());
        trade.setExitPrice(request.getExitPrice());
        trade.setStopLoss(request.getStopLoss());
        trade.setTarget(request.getTarget());
        trade.setQuantity(request.getQuantity());
        trade.setEntryTime(request.getEntryTime());
        trade.setExitTime(request.getExitTime());
        trade.setStrategy(request.getStrategy());
        trade.setNotes(request.getNotes());

        return toResponse(tradeRepository.save(trade));
    }

    public void deleteTrade(Long id, String email) {
        User user = getUser(email);
        Trade trade = tradeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trade not found"));
        tradeRepository.delete(trade);
    }
}