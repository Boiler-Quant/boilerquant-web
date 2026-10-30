---
title: "MD Feed Handler"
description: "Building a high-throughput market data feed handler that ingests an ITCH binary stream, decodes into a normalized internal representation, and maintains an in-memory order book."
status: current
leads: ["Ayush Agarwal"]
members: ["Thomas Mackey", "Chenxi Zhang", "Aryan Salian", "Pranith Revella", "Shivani Sinha"]
tags: ["Market Microstructure", "Kernel Bypass", "Low Latency", "Networking", "Concurrency"]
#image: 
order: 1
---

# Project Overview & Goals
We are building a working market data feed handler to parse and handle incoming data from Nasdaq's ITCH protocol over MoldUDP64. 
This is a concurrent application primarily utilizing C++ and the project focuses primarily on the software implementation over hardware. 

The handler will be able to keep an up-to-date order book which other downstream applications (eg. visualization dashboard) can use. 

During implementation, we will use a simulate sending historical data. 
Members will profile and analyze the application to identify bottlenecks and locations to improve latency. 
We will also use DPDK to bypass the OS's network stack for incoming packets. 