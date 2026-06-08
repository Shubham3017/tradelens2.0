package com.tradelens.backend.service;

import com.tradelens.backend.exception.ResourceNotFoundException;
import com.tradelens.backend.model.*;
import com.tradelens.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
public class InsightService {

    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;

    // ── Constants ──────────────────────────────────────────────
    private static final int    REVENGE_WINDOW_MINUTES         = 30;
    private static final int    OVERTRADING_THRESHOLD          = 5;
    private static final int    DISCIPLINE_PENALTY_PER_DAY     = 20;
    private static final int    DISCIPLINE_PENALTY_PER_REVENGE = 15;
    private static final int    DISCIPLINE_MAX_OVERTRADING_CAP = 60;
    private static final int    DISCIPLINE_MAX_REVENGE_CAP     = 40;
    private static final double PF_INFINITY_SENTINEL           = 999.0; // represents ∞ (no losses)
    private static final int    MIN_STRATEGY_TRADES            = 3;
    private static final int    MIN_DAY_SAMPLE                 = 3;
    private static final int    MIN_HOUR_SAMPLE                = 3;

    public InsightService(TradeRepository tradeRepository,
                          UserRepository userRepository) {
        this.tradeRepository = tradeRepository;
        this.userRepository  = userRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // Excludes trades where entry/stop-loss/target are missing or produce zero risk/reward.
    private Double calcRR(Trade t) {
        if (t.getEntryPrice() == null ||
            t.getStopLoss()   == null ||
            t.getTarget()     == null) return null;
        double risk   = Math.abs(t.getEntryPrice() - t.getStopLoss());
        double reward = Math.abs(t.getTarget()     - t.getEntryPrice());
        if (risk <= 0 || reward <= 0) return null;
        return reward / risk;
    }

    // Returns null when stop loss is absent so revenge-trading check can skip
    // pairs with no computable risk, avoiding false positives from full position value.
    private Double calcPositionRisk(Trade t) {
        if (t.getStopLoss() == null) return null;
        double risk = t.getQuantity() * Math.abs(t.getEntryPrice() - t.getStopLoss());
        return risk > 0 ? risk : null;
    }

    public Map<String, Object> getInsights(String email) {
        User user  = getUser(email);
        List<Trade> trades = tradeRepository.findByUser(user);
        Map<String, Object> result = new HashMap<>();

        if (trades.isEmpty()) {
            result.put("insights",       Collections.emptyList());
            result.put("winRateByDay",   Collections.emptyMap());
            result.put("winRateByHour",  Collections.emptyMap());
            result.put("pnlByStrategy",  Collections.emptyMap());
            result.put("profile",        Collections.emptyMap());
            return result;
        }

        List<String> insights = new ArrayList<>();

        // ── Closed trades only ────────────────────────────────
        List<Trade> closedTrades = trades.stream()
                .filter(t -> t.getResult() != null)
                .filter(t -> !"OPEN".equals(t.getResult()))
                .filter(t -> t.getEntryTime() != null)
                .collect(Collectors.toList());

        long wins   = closedTrades.stream().filter(t -> "WIN" .equals(t.getResult())).count();
        long losses = closedTrades.stream().filter(t -> "LOSS".equals(t.getResult())).count();

        double winRate = closedTrades.isEmpty()
                ? 0
                : ((double) wins / closedTrades.size()) * 100;

        // ── Avg win / avg loss ────────────────────────────────
        double avgWin = closedTrades.stream()
                .filter(t -> "WIN".equals(t.getResult()) && t.getPnl() != null)
                .mapToDouble(Trade::getPnl)
                .average().orElse(0);

        double avgLoss = Math.abs(closedTrades.stream()
                .filter(t -> "LOSS".equals(t.getResult()) && t.getPnl() != null)
                .mapToDouble(Trade::getPnl)
                .average().orElse(0));

        // ── Profit Factor — raw value, rounded only at output ─
        double grossProfit = closedTrades.stream()
                .filter(t -> "WIN".equals(t.getResult()) && t.getPnl() != null)
                .mapToDouble(Trade::getPnl).sum();

        double grossLoss = Math.abs(closedTrades.stream()
                .filter(t -> "LOSS".equals(t.getResult()) && t.getPnl() != null)
                .mapToDouble(Trade::getPnl).sum());

        double profitFactor;
        if (grossLoss == 0 && grossProfit > 0)
            profitFactor = PF_INFINITY_SENTINEL;  // no losses at all
        else if (grossLoss > 0)
            profitFactor = grossProfit / grossLoss; // raw — rounded only at output
        else
            profitFactor = 0;                       // no closed trades

        // ── Expectancy ────────────────────────────────────────
        double winProb  = closedTrades.isEmpty() ? 0 : (double) wins / closedTrades.size();
        double lossProb = 1 - winProb;
        double expectancy = round((winProb * avgWin) - (lossProb * avgLoss));

        // ── Small sample size warning ─────────────────────────
        if (closedTrades.size() < 20)
            insights.add("ℹ️ Small sample size (" + closedTrades.size() +
                " closed trades) — insights will become more reliable as you log more trades.");

        // ── Win rate insight ──────────────────────────────────
        if (winRate >= 60)
            insights.add("✅ Win rate: " + Math.round(winRate) + "% (" +
                wins + " wins / " + losses + " losses out of " +
                closedTrades.size() + " trades).");
        else if (winRate >= 50)
            insights.add("⚠️ Win rate: " + Math.round(winRate) + "% — room to improve.");
        else
            insights.add("❌ Low win rate: " + Math.round(winRate) +
                "% — review your entry criteria.");

        // ── Profit discipline ─────────────────────────────────
        if (avgWin > avgLoss)
            insights.add("✅ Good discipline — average profit ₹" +
                Math.round(avgWin) + " is larger than average loss ₹" +
                Math.round(avgLoss) + ".");
        else
            insights.add("⚠️ Average loss ₹" + Math.round(avgLoss) +
                " exceeds average win ₹" + Math.round(avgWin) +
                " — improve your exits.");

        // ── Profit Factor insight ─────────────────────────────
        if (profitFactor == PF_INFINITY_SENTINEL)
            insights.add("✅ Perfect profit factor — no losing trades recorded.");
        else if (profitFactor >= 2.0)
            insights.add("✅ Excellent profit factor: " + round(profitFactor) +
                " — for every ₹1 lost you earn ₹" + round(profitFactor) + ".");
        else if (profitFactor >= 1.5)
            insights.add("✅ Good profit factor: " + round(profitFactor) + ".");
        else if (profitFactor >= 1.0)
            insights.add("⚠️ Marginal profit factor: " + round(profitFactor) +
                " — work on cutting losses or letting winners run.");
        else if (profitFactor > 0)
            insights.add("❌ Losing profit factor: " + round(profitFactor) +
                " — you are losing more than you earn.");

        // ── Expectancy insight ────────────────────────────────
        if (expectancy > 0)
            insights.add("✅ Positive expectancy: ₹" + expectancy + " per trade on average.");
        else
            insights.add("❌ Negative expectancy: ₹" + expectancy +
                " per trade — system needs improvement.");

        // ── Overtrading detection ─────────────────────────────
        Map<String, Long> tradesByDay = closedTrades.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getEntryTime().toLocalDate().toString(),
                        Collectors.counting()));

        long overtradingDays = tradesByDay.values().stream()
                .filter(c -> c >= OVERTRADING_THRESHOLD).count();

        double overtradingPnl = closedTrades.stream()
                .filter(t -> t.getPnl() != null)
                .filter(t -> tradesByDay.getOrDefault(
                        t.getEntryTime().toLocalDate().toString(), 0L)
                        >= OVERTRADING_THRESHOLD)
                .mapToDouble(Trade::getPnl).sum();

        double normalPnl = closedTrades.stream()
                .filter(t -> t.getPnl() != null)
                .filter(t -> tradesByDay.getOrDefault(
                        t.getEntryTime().toLocalDate().toString(), 0L)
                        < OVERTRADING_THRESHOLD)
                .mapToDouble(Trade::getPnl).sum();

        if (overtradingDays == 0)
            insights.add("✅ No overtrading detected.");
        else
            insights.add("⚠️ Overtrading detected — " + overtradingDays +
                " day(s) with " + OVERTRADING_THRESHOLD + "+ trades. " +
                "P&L on heavy days: ₹" + Math.round(overtradingPnl) +
                " vs normal days: ₹" + Math.round(normalPnl) +
                ". More trades ≠ more profit.");

        // ── Revenge trading detection ─────────────────────────
        // Window measured from exitTime → next entryTime (not entry → entry)
        // so it reflects emotional state after the loss closed, not during it.
        List<Trade> sortedByTime = trades.stream()
                .filter(t -> t.getEntryTime() != null)
                .sorted(Comparator.comparing(Trade::getEntryTime))
                .collect(Collectors.toList());

        int revengeCount = 0;
        for (int i = 0; i < sortedByTime.size() - 1; i++) {
            Trade current = sortedByTime.get(i);
            Trade next    = sortedByTime.get(i + 1);

            if (!"LOSS".equals(current.getResult())) continue;

            java.time.LocalDateTime windowStart = (current.getExitTime() != null)
                    ? current.getExitTime()
                    : current.getEntryTime();

            long minutes = Duration.between(windowStart, next.getEntryTime()).toMinutes();
            if (minutes < 0) continue;

            Double currentRisk = calcPositionRisk(current);
            Double nextRisk    = calcPositionRisk(next);

            if (currentRisk == null || nextRisk == null) continue;

            if (minutes <= REVENGE_WINDOW_MINUTES && nextRisk > currentRisk) {
                revengeCount++;
            }
        }

        if (revengeCount == 0)
            insights.add("✅ No revenge trading — consistent position sizing after losses. Good emotional control.");
        else
            insights.add("❌ Revenge trading detected " + revengeCount +
                " time(s) — higher risk taken after a loss within " +
                REVENGE_WINDOW_MINUTES + " mins.");

        // ── Best and worst day ────────────────────────────────
        String[] dayNames = {"MONDAY","TUESDAY","WEDNESDAY",
                             "THURSDAY","FRIDAY","SATURDAY","SUNDAY"};

        Map<String, Double> avgPnlByDay = new LinkedHashMap<>();
        for (String day : dayNames) {
            List<Trade> dayTrades = closedTrades.stream()
                    .filter(t -> t.getPnl() != null)
                    .filter(t -> t.getEntryTime().getDayOfWeek().name().equals(day))
                    .collect(Collectors.toList());
            if (!dayTrades.isEmpty()) {
                avgPnlByDay.put(day,
                        dayTrades.stream().mapToDouble(Trade::getPnl).average().orElse(0));
            }
        }

        if (!avgPnlByDay.isEmpty()) {
            String bestDay  = avgPnlByDay.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            String worstDay = avgPnlByDay.entrySet().stream()
                    .min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            long bestDayCount  = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getDayOfWeek().name().equals(bestDay))
                    .count();
            long worstDayCount = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getDayOfWeek().name().equals(worstDay))
                    .count();
            if (bestDayCount >= MIN_DAY_SAMPLE && worstDayCount >= MIN_DAY_SAMPLE)
                insights.add("📅 Best trading day: " + bestDay +
                    " (avg ₹" + Math.round(avgPnlByDay.get(bestDay)) + "). " +
                    "Worst: " + worstDay +
                    " (avg ₹" + Math.round(avgPnlByDay.get(worstDay)) + ").");
            else
                insights.add("ℹ️ Not enough data per day to determine best/worst day reliably.");
        }

        // ── Best and worst hour ───────────────────────────────
        Map<String, Double> avgPnlByHour = new LinkedHashMap<>();
        for (int h = 9; h <= 15; h++) {
            int hour = h;
            List<Trade> hourTrades = closedTrades.stream()
                    .filter(t -> t.getPnl() != null)
                    .filter(t -> t.getEntryTime().getHour() == hour)
                    .collect(Collectors.toList());
            if (!hourTrades.isEmpty()) {
                avgPnlByHour.put(String.valueOf(h),
                        hourTrades.stream().mapToDouble(Trade::getPnl).average().orElse(0));
            }
        }

        if (!avgPnlByHour.isEmpty()) {
            int bestHour  = avgPnlByHour.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(e -> Integer.parseInt(e.getKey())).orElse(0);
            int worstHour = avgPnlByHour.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(e -> Integer.parseInt(e.getKey())).orElse(0);

            long bestHourWinRate  = computeHourWinRate(closedTrades, bestHour);
            long worstHourWinRate = computeHourWinRate(closedTrades, worstHour);
            long bestHourCount    = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getHour() == bestHour).count();
            long worstHourCount   = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getHour() == worstHour).count();

            if (bestHourCount >= MIN_HOUR_SAMPLE && worstHourCount >= MIN_HOUR_SAMPLE)
                insights.add("⏰ Best hour: " + bestHour + ":00 (win rate " +
                    bestHourWinRate + "%). Worst hour: " + worstHour + ":00 (win rate " +
                    worstHourWinRate + "%) — consider avoiding it.");
            else
                insights.add("ℹ️ Not enough hourly data yet to determine best/worst trading hour.");
        }

        // ── Best and worst strategy ───────────────────────────
        Map<String, Double> pnlByStrategy = closedTrades.stream()
                .filter(t -> t.getStrategy() != null && t.getPnl() != null)
                .collect(Collectors.groupingBy(
                        Trade::getStrategy,
                        Collectors.toList()))
                .entrySet().stream()
                .filter(e -> e.getValue().size() >= MIN_STRATEGY_TRADES)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream()
                                .mapToDouble(Trade::getPnl)
                                .average().orElse(0)));

        if (pnlByStrategy.isEmpty()) {
            insights.add("ℹ️ Not enough strategy data yet — at least " +
                MIN_STRATEGY_TRADES + " trades per strategy are required.");
        } else {
            String bestStrategy  = pnlByStrategy.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            String worstStrategy = pnlByStrategy.entrySet().stream()
                    .min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");

            insights.add("💹 Best strategy: '" + bestStrategy +
                "' (avg ₹" + Math.round(pnlByStrategy.get(bestStrategy)) + "/trade).");

            if (!worstStrategy.equals(bestStrategy) &&
                    pnlByStrategy.get(worstStrategy) < 0)
                insights.add("❌ Strategy '" + worstStrategy +
                    "' is losing money (avg ₹" +
                    Math.round(pnlByStrategy.get(worstStrategy)) +
                    "). Review or stop using it.");
        }

        // ── Disciplined trader summary (conclusion — kept at end) ─
        if (overtradingDays == 0 && revengeCount == 0 && profitFactor >= 1.5)
            insights.add("✅ Disciplined trader — strong profit factor (" +
                (profitFactor == PF_INFINITY_SENTINEL ? "∞" : round(profitFactor)) +
                "), profits larger than losses, " +
                "no size increase after losses. Keep following your plan.");

        // ── Win rate by day ───────────────────────────────────
        Map<String, Object> winRateByDay = new LinkedHashMap<>();
        for (String day : dayNames) {
            List<Trade> dayTrades = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getDayOfWeek().name().equals(day))
                    .collect(Collectors.toList());
            if (!dayTrades.isEmpty()) {
                long w = dayTrades.stream()
                        .filter(t -> "WIN".equals(t.getResult())).count();
                winRateByDay.put(day, round((double) w / dayTrades.size() * 100));
            } else {
                winRateByDay.put(day, 0);
            }
        }

        // ── Win rate by hour ──────────────────────────────────
        Map<String, Object> winRateByHour = new LinkedHashMap<>();
        for (int h = 9; h <= 15; h++) {
            int hour = h;
            List<Trade> hourTrades = closedTrades.stream()
                    .filter(t -> t.getEntryTime().getHour() == hour)
                    .collect(Collectors.toList());
            if (!hourTrades.isEmpty()) {
                long w = hourTrades.stream()
                        .filter(t -> "WIN".equals(t.getResult())).count();
                winRateByHour.put(h + ":00", round((double) w / hourTrades.size() * 100));
            } else {
                winRateByHour.put(h + ":00", 0);
            }
        }

        // ── P&L by strategy output ────────────────────────────
        Map<String, Object> pnlByStrategyOut = new LinkedHashMap<>();
        pnlByStrategy.forEach((k, v) -> pnlByStrategyOut.put(k, round(v)));

        // ── Trader profile ────────────────────────────────────
        Map<String, Object> profile = buildProfile(
                closedTrades, winRate,
                overtradingDays, revengeCount,
                profitFactor, expectancy);

        result.put("insights",      insights);
        result.put("winRateByDay",  winRateByDay);
        result.put("winRateByHour", winRateByHour);
        result.put("pnlByStrategy", pnlByStrategyOut);
        result.put("profitFactor",  profitFactor == PF_INFINITY_SENTINEL ? "∞" : round(profitFactor));
        result.put("expectancy",    expectancy);
        result.put("profile",       profile);

        return result;
    }

    // ── Helper: hour win rate ─────────────────────────────────
    private long computeHourWinRate(List<Trade> closedTrades, int hour) {
        List<Trade> hourTrades = closedTrades.stream()
                .filter(t -> t.getEntryTime() != null)
                .filter(t -> t.getEntryTime().getHour() == hour)
                .collect(Collectors.toList());
        if (hourTrades.isEmpty()) return 0;
        long hourWins = hourTrades.stream()
                .filter(t -> "WIN".equals(t.getResult())).count();
        return Math.round((double) hourWins / hourTrades.size() * 100);
    }

    private Map<String, Object> buildProfile(
            List<Trade> closedTrades,
            double winRate,
            long   overtradingDays,
            int    revengeCount,
            double profitFactor,
            double expectancy) {

        Map<String, Object> profile = new HashMap<>();
        List<String> positiveTraits = new ArrayList<>();
        List<String> negativeTraits = new ArrayList<>();

        // Win rate score: ×1.5 multiplier compresses the range intentionally.
        // 50% WR → 75 pts, 67%+ WR → 100 pts (capped).
        int winRateScore = (int) Math.min(winRate * 1.5, 100);

        double avgRR = closedTrades.stream()
                .map(this::calcRR)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average().orElse(0);
        int rrScore = (int) Math.min(avgRR * 40, 100);

        int disciplineScore = 100;
        disciplineScore -= (int) Math.min(
                overtradingDays * DISCIPLINE_PENALTY_PER_DAY,
                DISCIPLINE_MAX_OVERTRADING_CAP);
        disciplineScore -= (int) Math.min(
                revengeCount    * DISCIPLINE_PENALTY_PER_REVENGE,
                DISCIPLINE_MAX_REVENGE_CAP);
        disciplineScore = Math.max(disciplineScore, 0);

        int profitabilityScore;
        if      (profitFactor == PF_INFINITY_SENTINEL || profitFactor >= 2.0) profitabilityScore = 100;
        else if (profitFactor >= 1.5) profitabilityScore = 75;
        else if (profitFactor >= 1.0) profitabilityScore = 50;
        else if (profitFactor >  0)   profitabilityScore = 25;
        else                          profitabilityScore = 0;

        int overallScore = (winRateScore + rrScore +
                disciplineScore + profitabilityScore) / 4;

        // ── Traits ────────────────────────────────────────────
        if (winRate >= 60)
            positiveTraits.add("Strong Win Rate (" + Math.round(winRate) + "%)");
        else
            negativeTraits.add("Low Win Rate (" + Math.round(winRate) + "%)");

        if (avgRR >= 2.0)
            positiveTraits.add("Excellent R:R (" + round(avgRR) + ")");
        else if (avgRR >= 1.5)
            positiveTraits.add("Good R:R (" + round(avgRR) + ")");
        else if (avgRR > 0)
            negativeTraits.add("Poor R:R (" + round(avgRR) + ")");

        if (profitFactor == PF_INFINITY_SENTINEL)
            positiveTraits.add("Perfect Profit Factor (no losses)");
        else if (profitFactor >= 1.5)
            positiveTraits.add("Good Profit Factor (" + round(profitFactor) + ")");
        else if (profitFactor > 0 && profitFactor < 1.0)
            negativeTraits.add("Losing Profit Factor (" + round(profitFactor) + ")");

        if (expectancy > 0)
            positiveTraits.add("Positive Expectancy (₹" + expectancy + "/trade)");
        else
            negativeTraits.add("Negative Expectancy (₹" + expectancy + "/trade)");

        if (overtradingDays == 0)
            positiveTraits.add("No Overtrading");
        else
            negativeTraits.add("Overtrading Risk (" + overtradingDays + " days)");

        if (revengeCount == 0)
            positiveTraits.add("No Revenge Trading");
        else
            negativeTraits.add("Revenge Trading (" + revengeCount + " instances)");

        // ── Trading style ─────────────────────────────────────
        OptionalDouble avgHoldingOpt = closedTrades.stream()
                .filter(t -> t.getExitTime() != null)
                .mapToLong(t -> Duration.between(
                        t.getEntryTime(), t.getExitTime()).toMinutes())
                .average();

        String style;
        if (!avgHoldingOpt.isPresent()) {
            style = "Unknown";
        } else {
            double avgHolding = avgHoldingOpt.getAsDouble();
            style = avgHolding < 30  ? "Scalper"
                  : avgHolding < 120 ? "Intraday"
                  : "Swing";
        }
        positiveTraits.add(style + " Trader");

        // ── Label ─────────────────────────────────────────────
        String label;
        if      (overallScore >= 80) label = "Disciplined " + style + " Trader";
        else if (overallScore >= 60) label = "Developing " + style + " Trader";
        else                         label = "High Risk — Needs Improvement";

        // ── Recommendation: target the weakest sub-score ──────
        int minScore = Math.min(
                Math.min(winRateScore, rrScore),
                Math.min(disciplineScore, profitabilityScore));

        String recommendation;
        if      (minScore == winRateScore)
            recommendation = "Focus on improving your win rate — review entry criteria and avoid low-probability setups.";
        else if (minScore == rrScore)
            recommendation = "Improve your R:R ratio — widen targets or tighten stop losses before entering trades.";
        else if (minScore == disciplineScore)
            recommendation = "Work on discipline — avoid overtrading and revenge trades after losses.";
        else
            recommendation = "Improve profitability — your profit factor is low. Focus on letting winners run and cutting losers quickly.";

        profile.put("label",               label);
        profile.put("overallScore",        overallScore);
        profile.put("winRateScore",        winRateScore);
        profile.put("rrScore",             rrScore);
        profile.put("disciplineScore",     disciplineScore);
        profile.put("profitabilityScore",  profitabilityScore);
        profile.put("profitFactor",        profitFactor == PF_INFINITY_SENTINEL ? "∞" : round(profitFactor));
        profile.put("expectancy",          expectancy);
        profile.put("positiveTraits",      positiveTraits);
        profile.put("negativeTraits",      negativeTraits);
        profile.put("recommendation",      recommendation);

        return profile;
    }
}