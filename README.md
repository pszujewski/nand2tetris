# Week 2: Boolean Arithmetic and ALU chip

Converting from Decimal to binary, for example 87. Take the largest power of 2 and continue until to get 87. Write out 87 as the sum of powers of 2.

We will not in hardware build any multiplication or division circuitry.

In case of overflow, we ignore the last carry-bit that exceeds the length of the defined byte size.

2s Complement (using 4-bit 2s complement representation)

We represent a negative number -x using the positive number: 2^n - x, so if we have 4 bits available and we want to represent -3: 2^4 - 3 = 13, which in binary is 1101. So 1101 will represent -3, even though in reality 1101 converted to base 10 is 13. In effect we reserv half the possible integers for negative numbers.

Example for 4-bit integers:

0000 (0)
0001 (1)
0010 (2)
0011 (3)
0100 (4)
0101 (5)
0110 (6)
0111 (7)
1000 (-8) (8) // applying 2s complement here, recognize the pattern
1001 (-7) (9)
1010 (-6) (10)
1011 (-5) (11)
1100 (-4) (12)
1101 (-3) (13)
1110 (-2) (14)
1111 (-1) (15)

Adding together 2 negative numbers:

We always encounter overflow because the msb (most significant bit) is 1 for the binary representations of negative numbers (thanks to 2s complement). When adding these together, because representaiton is modulo 2^n (addition is modulo 2^n), simply discarding the msb gives us the correct answer

-2 + -3 in 2s complement (for 4-bit long...)

-2 -> 16 - 2 = 14

-3 -> 16 - 3 = 13

14 + 13 = 27 -> 11011 however this includes an 'overflow bit' so we discard the end 1 and get

1011, which is 11 and which if converted from 2s complement is -5

It's possible to also expres 2^n - x as 1 + (2^n -1) - x -> (2^n - 1) is always 1111...n (all digits 1)

How do we design circuitry that takes in x and produces -x in 2s complement?

For example given 4, how do we get -4?

In 2s complement, -4 is 12 (ten) -> 1100 How did we get this using 1 + (2^n -1) - x in binary?

can be simplified to 1 + (1111) - 0100 = 1 + 1011 (flip the bits) = 1100

1100 is 12, which is the 2s complement of 4 so it is negative 4.

quick tip for adding 1: Flip the bits from right to left, stopping the first time 0 is flipped to 1.

Arithmetic Logic Unit (ALU)

Jon Von Neumann diagram described the ALU and CPU backin 1945.

The ALU receives 3 inputs: two multi-bit buses and a function. The function is one of a family of pre-determined functions available to the ALU. The output is the result of the function operating on the two inputs.

Some of the functions are arithmetic and some are logical. It might perform bit-wise AND, or OR, or it might add the two buses together.

Designing the ALU introduces the 'classical' hardware/ software trade-off question. Is you don't implement something in the hardware, sometimes you can implement it in the software (i.e operating system) that lies on top of the ALU. Which operations should the ALU perform?

The ALU executes a function that is one out of a family of 18 "functions of interest."
