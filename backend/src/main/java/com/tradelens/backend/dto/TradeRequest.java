package com.tradelens.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TradeRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Trade type is required")
    private String tradeType;

    @NotNull(message = "Entry price is required")
    private Double entryPrice;

    private Double exitPrice;
    private Double stopLoss;
    private Double target;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Entry time is required")
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;
    private String strategy;
    private String notes;
}