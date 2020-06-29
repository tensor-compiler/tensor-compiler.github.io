**[TACO](http://tensor-compiler.org)** is a library for performing sparse and
dense linear algebra and tensor algebra computations. The computations can
range from relatively simple ones like sparse matrix-vector multiplication to
more complex ones like matricized tensor times Khatri-Rao product.  All these
computations can be performed on any mix of dense and sparse tensors. Under the
hood, TACO automatically generates efficient code to perform these
computations.

The sidebar to the left links to documentation for the TACO C++ and Python
libraries as well as some examples demonstrating how TACO can be used in
real-world applications.

# System Requirements

* A C compiler that supports C99, such as GCC or Clang
    * Support for OpenMP is also required if parallel execution is desired
* Python 3 with NumPy and SciPy (for the Python library)

# Getting Help

Questions and bug reports can be submitted [here](https://github.com/tensor-compiler/taco/issues).
