---
title: "Predictor Return Decay"
description: "Testing published stock predictors on recent data to measure how much returns have decayed compared to original performance."
status: current
leads: ["Kevin Karram"]
members: ["Goktug Bas", "Nathan Witt"]
tags: ["Alpha Decay"]
#image: 
order: 7
---

# Overview
This project tests whether published stock-return predictors maintain legitimacy after academics publish them. 

We extend McLean and Pontiff (2016), who found that across 97 predictors, returns were 26% lower after the original sample ended and 58% lower after publication, using data through 2013. 

We use Chen and Zimmermann's 212 published predictors from the Open Source Asset Pricing October 2025 release, whose returns mostly run through December 2024. 
Each predictor's monthly long-short returns are split into three windows: the original paper's sample, the gap before publication, and the years after publication. 

We first estimate McLean and Pontiff's regression on data through 2013 to confirm we get similar results. The regression gives each predictor its own average return and clusters standard errors by month. We then extend it through 2024 to test whether post-publication returns changed in the last decade, controlling for years since publication. Finally, we examine how predictors relate to each other: whether they become more correlated with other published predictors after publication, and whether they still earn returns after controlling for the Fama–French factors. Throughout, we correct for multiple testing across all 212 predictors.
