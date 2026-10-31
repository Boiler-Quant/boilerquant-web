---
title: "Predictions Market Volatility Analysis"
description: "Comparing volatility indicators for prediction markets against each other on real data. Measuring movement of each contract to determine the fidelity of models in recent research."
status: current
leads: ["Dhruv Jhamb"]
members: ["Kashyap Maddala", "Tarun Venkatesh", "Ryan Challman", "David Oprea", "Peter Bossev"]
tags: ["Predictions Market"]
#image: 
order: 5
---

## Overview

A prediction market price is the crowd's probability: 70 cents means about a 70% chance. A price alone doesn't show how much it is likely to move (volatility), whether real money stands behind it (liquidity), or whether informed traders are pushing it (informed flow). We measure all three for every contract on Kalshi and Polymarket, starting with a head-to-head test of the volatility models proposed in recent research.

## Roadmap

**Level 0: Foundations.** Market microstructure basics and the Kalshi and Polymarket APIs.

**Level 1: Data Pipeline.** Live order book and trade collection from both venues, stored raw and validated against exchange snapshots.

**Level 2: Research Directions.** Direction A comes first, and the others build on it.

| Direction | Focus |
|---|---|
| **A. Microstructure Measurement** | Volatility, spreads, depth, price impact, order flow imbalance, informed flow (VPIN), jumps, cross-venue price discovery, calibration |
| **B. Mispricing Research** | Combo/parlay pricing, cross-venue gaps, multi-outcome markets summing above 100%, contracts vs options and sportsbook lines, favorite-longshot bias |
| **C. Strategies and Backtesting** | Backtester with realistic fills and fees; market making driven by Direction A measurements (paper trading only) |
| **D. Trading Simulator** | Practice trading against replayed real order books; club competitions |
| **E. Analytics Product** | Public site with per-contract metrics and a graded record of every forecast we make |
| **F. Derivatives** | Pricing options on event contracts using our volatility models |

## Volatility Benchmark

The first deliverable from Direction A:

1. Replicate published volatility results on Kalshi.
2. Add newer models: logit jump-diffusion, GARCH variants, Black-Scholes implied volatility for strike ladders.
3. Run every model on both Kalshi and Polymarket.
4. Score forecasts at 1-hour, 1-day, and 1-week horizons, broken down by venue, category, and time to resolution.

## Progress

- [x] Polymarket live data listener built and tested
- [ ] Continuous data collection and validation
- [ ] Kalshi collector
- [ ] Volatility benchmark
