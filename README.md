# Week 3: Sequential Logic

Having built the computer's ALU we turn to building the main memory unit. We will build it from the ground up using: flip-flop gates, 1-bit registers, then n-bit registers, which will then allow us to build a family of RAM chips.

It is important to note: "Unlike the computer's processing chips, which are based on combinational logic, the computer's memory logic requires a clock-based sequential logic."

In both cases however we are still working with "chips" and "logic."

#### Unit 1 Sequential logic

Why do we need to deal with the notion of time in computer architecture?

We'd like to use the same hardware over time, we need to remember "State" sometimes (i.e memory and counters). In otherwise we need to remember intermediate results and recall what happened in the past. Finally, we need to deal with speed constraints. 

We are going to have discrete time instead of physical time, which is very complicated to think about. 
