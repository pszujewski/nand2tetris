// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.

(INFINITELOOP)
    // Initialize key variables
    @SCREEN
    D=A                         // Save address of first screen register
    @registerTracker            // create var to track each register to clear or blacken
    M=D                         //Init registerTracker to be first address for screen block

    // Read Keyboard state
    @KBD
    D=M
    @CLEARSCREEN
    D;JEQ
    @BLACKENSCREEN
    D;JGT

    (CLEARSCREEN)
        @setTo
        M=0
        @SETSCREEN
        0;JMP
    
    (BLACKENSCREEN)
        @setTo
        M=-1
        @SETSCREEN
        0;JMP
    
    (SETSCREEN)
        // Set mem[regTracker] = setTo
        @setTo
        D=M
        @registerTracker
        A=M
        M=D

        // Check if we need to start over
        @registerTracker
        D=M                      // Get Mem[registerTracker] in D
        @24575                   // Constant in A; totsl number of address in Screen memory map
        D=D-A
        @INFINITELOOP
        D;JEQ
        
        // Add 1 to registerTracker
        @1
        D=A
        @registerTracker
        M=M+D
        
        @SETSCREEN
        0;JMP


