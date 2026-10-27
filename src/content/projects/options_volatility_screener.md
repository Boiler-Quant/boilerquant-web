---
title: "Options Volatility Screener"
description: "Using options chain data to calculate implied volatility and visualizing as an interactive 3D surface. Highlighting contracts with unusual IVs and comparing market prices."
status: current
leads: ["Neel Chawla"]
members: ["Ryan Challman", "Arnav Mody", "Sairah Ghule"]
tags: ["Options Theory"]
#image: 
---

# Goal
Options with different strike prices and maturity dates trade at different implied volatilities. Through visualizing these differences, we can understand market expectations and potential inefficencies.

Our goal is to build an interactive screener to turn options data into a three-dimensional implied volatility surface and highlight deviations from the fitted surface.

This project has three goals:
1. Understand the Black-Scholes model, its assumptions, and how implied volatility is derived from market prices.
2. Explore how implied volatilty varies across strike prices and expiration dates, including volatility skews and smiles.
3. Apply the learning to real options data on selected equities to build visualizer and flag potential discrepancies.


# Methodology
Starting with a single stock, we will collect and clean relevant options change data, and then implement a solver for estimating IV through the Black-Scholes framework.

Next, we will fit a smooth volatility surface across plotted strikes price and times to expiration creating an interactive type visualization.

Finally, we will expand our analysis to other equities and flag deviations to re-evaluate our model or identify potential mispricing.

# Progress
Coming Soon