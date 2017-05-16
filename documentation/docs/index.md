**[taco](http://tensor-compiler.org)** is a library for compiling dense and sparse linear and tensor algebra expressions. The expressions can range from simple kernels like SpMV to more complex kernels like MTTKRP, where the operands can be dense, sparse, or a mix of dense and sparse. taco automatically generates efficient compute kernels (loops) to evaluate these expressions.

The sidebar to the left links to documentation for the taco C++ library as well as some examples demonstrating how taco can be used in real-world applications.

# System Requirements

* A C compiler that supports C99 and OpenMP (if parallelism is desired), such as GCC or Clang

# Getting Help

Questions and bug reports can be submitted [here](https://github.com/tensor-compiler/taco/issues).
