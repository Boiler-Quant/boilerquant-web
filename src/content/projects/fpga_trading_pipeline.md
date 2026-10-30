---
title: "FPGA Trading Pipeline"
description: "Building an FPGA pipeline that processes bid/ask quotes, generates an order-book imbalance signal, and checks proposed orders against risk limits."
status: current
leads: ["Aarush Agarwal"]
members: ["Aiden Drepaniotis", "Mixuan Pan", "Mike Carranza"]
tags: ["FPGA"]
#image: 
order: 6
---


# Goal

A trading signal is only useful while it is still true. An order-book imbalance can predict the next move in the book, but only if the order reaches the market before the book changes again. In software, the delay between a quote arriving and an order leaving is hard to pin down: the network stack, the OS scheduler, and the runtime all add time that varies from run to run. On an FPGA, each stage takes a fixed number of clock cycles, so that delay is something we choose and can measure.

This project builds the path from quote to order in hardware and uses it to answer one question: how much does decision delay reduce the value of a signal?

Our goals:

1. Build a working FPGA pipeline that replays quote updates, computes an order-book imbalance signal, checks proposed orders against basic risk limits, and records the orders it would have sent.
2. Extend the pipeline with a Nasdaq ITCH parser and order-book reconstruction so it works on a real exchange feed format, not only synthetic quotes.
3. Replay the same feed at several latencies and compare signal hit rate and simulated PnL, producing a curve of signal value against delay.

The project also gives members hands-on work with RTL design, hardware verification, binary feed parsing, and the market-microstructure research behind low-latency trading.

# Methodology

We build each component twice: first in Python as a reference, then in SystemVerilog against that reference. The Python model defines expected behavior, so an RTL bug shows up as a mismatch in the testbench instead of a quiet change in results.

**Reference model and test data.** A Python model replays quote updates into a price-level book, computes imbalance over the top five levels, applies risk limits, and emits orders. A synthetic feed generator produces streams with controlled update rates and imbalance, and the model writes each input and expected output to a test vector file.

**RTL pipeline.** The SystemVerilog pipeline handles one message per cycle through fixed-point stages: quote ingest, book update, imbalance, risk gate, and order output. Stages use valid/ready handshakes, the book is stored in on-chip block RAM, and cycle counters at the input and output measure latency directly. Risk checks cover maximum position, maximum order size, maximum notional, and a loss limit that disables trading.

**ITCH front end.** A parser for Nasdaq TotalView-ITCH handles add, execute, cancel, delete, and replace messages, checks sequence numbers, and feeds the same book engine. This is where the project stops being synthetic: messages arrive as a binary stream, orders are referenced by ID, and a cancel can remove the best price.

**Delay experiment.** We replay one recorded feed with added delays from a few hundred nanoseconds to a few milliseconds and compare the signal's hit rate and simulated PnL at each point. Running the same experiment against the Python model gives a software baseline, so the FPGA result is measured against something rather than reported alone.

Verification runs throughout. A self-checking testbench compares RTL output against Python vectors, randomized tests cover message mixes and boundary cases, and assertions check invariants such as non-negative quantities, valid book state after each update, and risk limits that are never exceeded.

# Progress

Fall 2026 is the first semester of the project. The current milestone is the Python reference model and the simulation harness; the RTL pipeline in simulation comes next, then the ITCH parser, then board bring-up. The pipeline stays in replay and simulation for now. We are not connecting to a live feed or routing real orders.
