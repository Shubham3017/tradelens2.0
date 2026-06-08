package com.tradelens.backend.repository;

import com.tradelens.backend.model.Trade;
import com.tradelens.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByUserOrderByEntryTimeDesc(User user);

    Optional<Trade> findByIdAndUser(Long id, User user);

    List<Trade> findByUser(User user);

    @Query("SELECT t FROM Trade t WHERE t.user = :user AND t.result = :result")
    List<Trade> findByUserAndResult(@Param("user") User user, @Param("result") String result);

    @Query("SELECT t FROM Trade t WHERE t.user = :user AND t.strategy = :strategy")
    List<Trade> findByUserAndStrategy(@Param("user") User user, @Param("strategy") String strategy);

    @Query("SELECT t FROM Trade t WHERE t.user = :user AND t.symbol = :symbol")
    List<Trade> findByUserAndSymbol(@Param("user") User user, @Param("symbol") String symbol);
}