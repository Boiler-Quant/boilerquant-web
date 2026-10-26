---
title: "Limit Order Book Simulation"
description: "Simulating the limit order book by modeling underlying noise as stochastic processes, and then running trading agents on top."
status: current
leads: ["Nathan Li", "Trinidad Segovia"]
members: ["Arya Bharath", "Dev Krishna", "Goktug Bas", "Nathan Witt", "Paolo Dapkins", "Patricio Putz", "Shayan Kashif"]
tags: ["Market Microstructure", "Stochastic Processes", "Trading Simulation"]
#image: 
---

# Goal
As a quant club, we want to explore market making strategies under various market conditions. 
Without the ability to trade on live markets, though, strategies that depend on market microstructure can't be properly backtested.
This is because historical data is static: it can't react to to the orders our strategy would have placed. 
If our algorithm posts a large buy order, real traders would adjust their quotes in response, but a replay of past data won’t.

A simulation of the market, represented at the most granular level as a limit order book, would let us develop and test these strategies in an environment that responds to our actions. 

This project has three goals:
1. Build a limit order book simulation and stream its data in a realistic format.
2. Validate the simulation by checking that its output matches statistical properties of real markets (for example, spread distributions and volatility clustering).
3. Apply the simulation to explore strategies that depend on microstructure.


# Methodology
Coming Soon

# Progress
Coming Soon
