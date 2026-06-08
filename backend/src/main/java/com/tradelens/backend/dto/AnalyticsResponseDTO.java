package com.tradelens.backend.dto;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Typed response for GET /analytics/basic.
 * Replaces the raw Map<String, Object> return from AnalyticsService
 * to give compile-time safety and clean Swagger documentation.
 */
public class AnalyticsResponseDTO {

    private double   totalPnl;
    private double   winRate;
    private int      totalTrades;
    private int      closedTrades;
    private int      openTrades;
    private double   avgRR;
    private double   maxDrawdown;
    private int      currentStreak;
    private List<Map<String, Object>> equityCurve;
    private Map<String, Object> bestTrade;
    private Map<String, Object> worstTrade;

    // ── No-arg constructor ────────────────────────────────────
    public AnalyticsResponseDTO() {}

    // ── All-arg constructor ───────────────────────────────────
    public AnalyticsResponseDTO(
            double totalPnl,
            double winRate,
            int    totalTrades,
            int    closedTrades,
            int    openTrades,
            double avgRR,
            double maxDrawdown,
            int    currentStreak,
            List<Map<String, Object>> equityCurve,
            Map<String, Object> bestTrade,
            Map<String, Object> worstTrade) {
        this.totalPnl      = totalPnl;
        this.winRate       = winRate;
        this.totalTrades   = totalTrades;
        this.closedTrades  = closedTrades;
        this.openTrades    = openTrades;
        this.avgRR         = avgRR;
        this.maxDrawdown   = maxDrawdown;
        this.currentStreak = currentStreak;
        this.equityCurve   = equityCurve;
        this.bestTrade     = bestTrade;
        this.worstTrade    = worstTrade;
    }

    // ── Static empty factory ──────────────────────────────────
    public static AnalyticsResponseDTO empty() {
        return new AnalyticsResponseDTO(
                0, 0, 0, 0, 0, 0, 0, 0,
                Collections.emptyList(), null, null);
    }

    // ── Getters ───────────────────────────────────────────────
    public double   getTotalPnl()      { return totalPnl; }
    public double   getWinRate()       { return winRate; }
    public int      getTotalTrades()   { return totalTrades; }
    public int      getClosedTrades()  { return closedTrades; }
    public int      getOpenTrades()    { return openTrades; }
    public double   getAvgRR()         { return avgRR; }
    public double   getMaxDrawdown()   { return maxDrawdown; }
    public int      getCurrentStreak() { return currentStreak; }
    public List<Map<String, Object>> getEquityCurve() { return equityCurve; }
    public Map<String, Object> getBestTrade()         { return bestTrade; }
    public Map<String, Object> getWorstTrade()        { return worstTrade; }

    // ── Setters ───────────────────────────────────────────────
    public void setTotalPnl(double totalPnl)           { this.totalPnl = totalPnl; }
    public void setWinRate(double winRate)              { this.winRate = winRate; }
    public void setTotalTrades(int totalTrades)         { this.totalTrades = totalTrades; }
    public void setClosedTrades(int closedTrades)       { this.closedTrades = closedTrades; }
    public void setOpenTrades(int openTrades)           { this.openTrades = openTrades; }
    public void setAvgRR(double avgRR)                  { this.avgRR = avgRR; }
    public void setMaxDrawdown(double maxDrawdown)      { this.maxDrawdown = maxDrawdown; }
    public void setCurrentStreak(int currentStreak)     { this.currentStreak = currentStreak; }
    public void setEquityCurve(List<Map<String, Object>> equityCurve) { this.equityCurve = equityCurve; }
    public void setBestTrade(Map<String, Object> bestTrade)           { this.bestTrade = bestTrade; }
    public void setWorstTrade(Map<String, Object> worstTrade)         { this.worstTrade = worstTrade; }

    @Override
    public String toString() {
        return "AnalyticsResponseDTO{" +
                "totalPnl=" + totalPnl +
                ", winRate=" + winRate +
                ", totalTrades=" + totalTrades +
                ", closedTrades=" + closedTrades +
                ", openTrades=" + openTrades +
                ", avgRR=" + avgRR +
                ", maxDrawdown=" + maxDrawdown +
                ", currentStreak=" + currentStreak +
                '}';
    }
}