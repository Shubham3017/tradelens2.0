package com.tradelens.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TradeResponse {
    private Long id;
    private String symbol;
    private String tradeType;
    private Double entryPrice;
    private Double exitPrice;
    private Double stopLoss;
    private Double target;
    private Integer quantity;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String strategy;
    private String notes;
    private Double pnl;
    private String result;
    private LocalDateTime createdAt;
}