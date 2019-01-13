# The Elements of Computing Systems: Building a Modern Computer from First Principles

## Nand2Tetris

### Module 1: Logic gates and boolean algebra

#### unit 1

Brief introduction of Boolean algebra, and learn how Boolean functions can be physically implemented using logic gates.

Project: build, simulate, and test 15 elementary logic gates.

How to deal with 0s and 1s?

The AND operation takes two 0 and 1 signals and retusn 1 only if both of them are 1.

Truth tables for the AND operation

x y AND
0 0 0
0 1 0
1 0 0
1 1 1

x y OR
0 0 0
0 1 1
1 0 1
1 1 1

NOT operation is different in that it takes only one input and returns its opposite.

We can combine Boolean operations just like we combine Arithmetic operations:

NOT(0 OR (1 AND 1)) = 0

Formulas and truth tables

We can describe Boolean functions using formulas and Trutch table. Because the boolean values have a very limited number of possible values, we can usually express the complete function in a tructh table.

Boolean identities that always give us equality

Commutative laws are when any finite sum or product is unaltered by reordering its terms or factors:

These commutative laws hold for Boolean algebra

(x AND y) = (y AND x)
(x OR y) = (y or x)

Associative laws: when it doesn't matter how you group the operations

(x AND (y AND z)) = ((x AND y) AND z)

In Algebra, the Distributive Law says that multiplying a number by a group of numbers added together is the same as doing each multiplication separately

(x AND (y OR z)) = ((x AND y) OR (x AND z))

(x OR (y AND z)) = ((x OR y) AND (x OR z))

De Morgan's law governs how NOTs work and how they interrelate with AND and OR

NOT(x AND y) = NOT(x) OR NOT(y)
NOT(x OR y) = NOT(x) AND NOT(y)

So this means that we can break down (custom) or more complex formulas using this laws to simplify the evaluation of a boolean formula

For example, we can apply de morgan's law to this complex formula:

NOT(NOT(x) AND NOT(x OR y)) =

NOT(NOT(x) AND (NOT(x) AND NOT(y)))

#### unit 2

How can we construct a function from basic operations (like boolean operations)?

Goal is to start with the description of a function given as a truth table and write out the formula. This is exactly what we need to do to design a computer

Constructing a disjonctive normal formula for a truth table

Generating a complex boolean function from a truth table: step 1 is to write a function for each row that produces 1 given the corresponding inputs. Step 2 is to "OR them together."

Any boolean function can be represented using an expression containing AND, OR and NOT operations

You can actually represent OR using just AND and NOT operations

proof:

(x OR y) = NOT(NOT(x) AND NOT(y))

Just if you have a NAND gate, you can compute everything, so you can compute all boolean functions:

(x NAND y) = NOT(x AND y)

We can define NOT using NAND:

NOT(x) = (x NAND x)

Now we have NOT defined, so we can define AND...

(x AND y) = NOT(x NAND y)

We just have to show how to do NOT with NAND gates and how to do AND with NAND gates. Then you can define OR and you are good to go.

#### unit 3

Gate Logic

This is a technique for implementing boolean functions using logic gates.

A logic gate is a standalone chip which is designed to deliver a well-defined functionality, such as NAND functionality.

There are elemental logic gates (such as NAND, AND, OR, NOT) and there are Composite logic gates (such as MUX, ADDER)

A standard NAND Gate has 2 inputs ('a' and 'b') and a single output (out). a, b and out are either 0 or 1. Everything here is binary.

Functional specification for the NAND gate:

```javascript
// (0|1), (0|1) -> (0|1)
// Produce 0 if a and b are both 1, else produce 1
function nandGate(a, b) {
  if (a === 1 && b === 1) {
    return 0;
  }
  return 1;
}
```

Interface vs. implementation

The gate interface is the gate abstraction. This is how the user thinks about what the gate is supposed to do. Interface answers the question 'what.' If you want to understand how the chip is doing what its doing, you have to go to another level of detail in which you see how the chip is actually constructed.

One abstraction and many different implementations. Whenever you build large systems, you have this duality.

Using these gates, we can realize hardwired circuits.

Circuits that represent "logic gates" can be constructed in many ways. One might imagine a circuit that has two "latches." If both latches are open, the circuit sends an output signal (example of lightbulb is given for simplicity) that can later be interpreted as "1." This is an AND circuit. That's about as far as we go.

The study and construction of circuits is a part of Electrical engineering. It is not a part of Computer science. This course does not deal with physical implementations. That is outside the scope of the field of CS and this course.

#### unit 4

On how we can actually build and implement the logic gates using a formalism called Hardware Description Language or HDL

In HDL, you can fan out as many given signal to as many destinations as you want.

HDL is a functional/ declarative language. It is a static description of the gate diagram. In out case it will go into a hardware simulator. We can assume that there is some sort of interpretor that will translate the HDL code (our external agent is the hardware simulator) into real procedures.

There are many "real" HDLs out there: VHDL and Verilog are the two most popular, but there are many more. Our own HDL is very similar in spirit. It is a minimal and simple version.

Since HDL is functional and declarative, every stement (see ex below) can be written in any order, but there is an obvious convention of starting with the "IN" values

```
// Example XOR chip in HDL

CHIP Xor {
  IN a, b;
  OUT out;

  PARTS:
  Not (in=a, out=nota);
  Not (in=b, out=notb);
  And (a=a, b=notb, out=aAndNotb)
  And (a=nota, b=b, out=notaAndb)
  Or (a=aAndNotb, b=notaAndb, out=out)
}
```

Hardware construction architects

How we actually carry out these projects. System architects and Developers are key players.

A system architect might be told, "go build a chip that monitors a certain medical device," so they work on the physical implementation of the CHIP. They look at the overall desired behavior of a CHIP and they have to decide how to break down this overall behavior into a set of smaller, lower-level chips. The architect then creates a chip API, which consists of the name of the chip, the names of its input and output pins, a test script and a compare file. Then the developers go out and build the actual chips.

So the same rules of "divide and conquer" apply, as well as the goal of emphasizing modular design.

#### unit 5

Multi-bit buses

When we design hardware we need to think about a bunch of bits being manipulated together. It is conceptually convenient to think of a group of bits grouped together as a "bus"

This allows us to think of the bits in a slightly higher abstraction level.

HDLs usually some kind of support for "buses." This comes from a latin word meaning many or multiple.

Our binary numbers will all have 16 bits.

For example, imagine we design a chip that adds two numbers. The chip would take two inputs a and b, and it will produce an "out" binary number. The inputs and output will all be 16-bit binary numbers.

So in reality, our chip has 32 wires feeding into it and 16 wires feeding out of it, but it is more convenient to think of it as two binary numbers feeding in and one binary number feeding out.

The chip interface in HDL might look like this:

```
/** Adds two 16-bit values */

CHIP Add16 {
  IN a[16], b[16];

  OUT out[16];

  PARTS:
  ...
}
```

We can then use our chip to build one that adds 3 values:

```
/** Adds two 16-bit values */

CHIP Add3Way16 {
  IN first[16], second[16], third[16];

  OUT out[16];

  PARTS:

  Add16(a=first, b=second, out=temp);
  Add16(a=temp, b=third, out=out);
}
```

The HACK computer we are going to build in this course consists of some 30-different chips.

For this first project we build 15 different gates that are widely used in the construction of many different types of digital devices or some version of these gates. And they comprise all the elementary logic we need to build a computer.
