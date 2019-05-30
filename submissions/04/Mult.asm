// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.

@sum 
M=0
@R2
M=0
// Define Loop
(LOOP)
@sum
D=M
@R1
D=M-D
@END
D;JEQ
@R0
D=M
@R2
M=M+D
// Add one to sum
@1
D=A
@sum
M=M+D
// Continue Loop
@LOOP
0;JMP
// Define End
(END)
0;JMP
