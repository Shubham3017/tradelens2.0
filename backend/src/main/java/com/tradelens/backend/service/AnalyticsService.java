package com.tradelens.backend.service;

import com.tradelens.backend.model.*;
import com.tradelens.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;

    public AnalyticsService(TradeRepository tradeRepository,
                            UserRepository userRepository) {
        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // ── Fix 3: exclude invalid RR trades instead of treating as 0 ──
    private Double calcRR(Trade t) {
        if (t.getStopLoss() == null || t.getTarget() == null) return null;
        double risk = Math.abs(t.getEntryPrice() - t.getStopLoss());
        double reward = Math.abs(t.getTarget() - t.getEntryPrice());
        if (risk <= 0 || reward <= 0) return null;
        return reward / risk;
    }

    public Map<String, Object> getBasicAnalytics(String email) {
        User user = getUser(email);
        List<Trade> trades = tradeRepository.findByUser(user);

        Map<String, Object> analytics = new HashMap<>();

        if (trades.isEmpty()) {
            analytics.put("totalPnl", 0);
            analytics.put("winRate", 0);
            analytics.put("totalTrades", 0);
            analytics.put("avgRR", 0);
            analytics.put("maxDrawdown", 0);
            analytics.put("currentStreak", 0);
            analytics.put("equityCurve", Collections.emptyList());
            analytics.put("bestTrade", null);
            analytics.put("worstTrade", null);
            return analytics;
        }

        // ── Closed trades only ────────────────────────────────
        List<Trade> closedTrades = trades.stream()
                .filter(t -> t.getResult() != null)
                .filter(t -> !"OPEN".equals(t.getResult()))
                .collect(Collectors.toList());

        long wins = closedTrades.stream()
                .filter(t -> "WIN".equals(t.getResult()))
                .count();

        double winRate = closedTrades.isEmpty()
                ? 0
                : ((double) wins / closedTrades.size()) * 100;

        // ── Total P&L ─────────────────────────────────────────
        double totalPnl = trades.stream()
                .filter(t -> t.getPnl() != null)
                .mapToDouble(Trade::getPnl)
                .sum();

        // ── Fix 3: Avg R:R excludes invalid trades ────────────
        double avgRR = trades.stream()
                .map(this::calcRR)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        // ── Fix 1: filter both pnl and entryTime ─────────────
        List<Trade> sorted = trades.stream()
                .filter(t -> t.getPnl() != null)
                .filter(t -> t.getEntryTime() != null)
                .sorted(Comparator.comparing(Trade::getEntryTime))
                .collect(Collectors.toList());

        // ── Equity curve ──────────────────────────────────────
        List<Map<String, Object>> equityCurve = new ArrayList<>();
        double cumulative = 0;
        for (Trade t : sorted) {
            cumulative += t.getPnl();
            Map<String, Object> point = new HashMap<>();
            point.put("date", t.getEntryTime().toLocalDate().toString());
            point.put("value", round(cumulative));
            equityCurve.add(point);
        }

        // ── Max drawdown ──────────────────────────────────────
        double peak = 0;
        double running = 0;
        double maxDrawdown = 0;
        for (Trade t : sorted) {
            running += t.getPnl();
            peak = Math.max(peak, running);
            maxDrawdown = Math.max(maxDrawdown, peak - running);
        }

        // ── Fix 2: filter both result and entryTime ───────────
        List<Trade> byTime = trades.stream()
                .filter(t -> t.getResult() != null)
                .filter(t -> !"OPEN".equals(t.getResult()))
                .filter(t -> t.getEntryTime() != null)
                .sorted(Comparator.comparing(Trade::getEntryTime).reversed())
                .collect(Collectors.toList());
        
        int streak = 0;
        if (!byTime.isEmpty()) {
            String first = byTime.get(0).getResult();
            for (Trade t : byTime) {
                if (Objects.equals(t.getResult(), first)) streak++;
                else break;
            }
            if ("LOSS".equals(first)) streak = -streak;
        }

        // ── Best and worst trade ──────────────────────────────
        Trade best = trades.stream()
                .filter(t -> t.getPnl() != null)
                .max(Comparator.comparingDouble(Trade::getPnl))
                .orElse(null);

        Trade worst = trades.stream()
                .filter(t -> t.getPnl() != null)
                .min(Comparator.comparingDouble(Trade::getPnl))
                .orElse(null);

        analytics.put("totalPnl", round(totalPnl));
        analytics.put("winRate", round(winRate));
        analytics.put("totalTrades", trades.size());
        analytics.put("avgRR", round(avgRR));
        analytics.put("maxDrawdown", round(maxDrawdown));
        analytics.put("currentStreak", streak);
        analytics.put("equityCurve", equityCurve);
        analytics.put("bestTrade", best != null ? Map.of(
                "symbol", best.getSymbol(),
                "pnl", best.getPnl()) : null);
        analytics.put("worstTrade", worst != null ? Map.of(
                "symbol", worst.getSymbol(),
                "pnl", worst.getPnl()) : null);

        return analytics;
    }
}