Sampled dense-dense matrix product (SDDMM) is a bottleneck operation in many
factor analysis algorithms used in machine learning, including Alternating
Least Squares and Latent Dirichlet Allocation [1]. Mathematically, the
operation can be expressed as 

$$A = B \circ CD,$$

where \(A\) and \(B\) are sparse matrices, \(C\) and \(D\) are dense matrices,
and \(\circ\) denotes component-wise multiplication. This operation can also be
expressed in [index
notation](pycomputations.md#specifying-tensor-algebra-computations) as 

$$A_{ij} = B_{ij} \cdot C_{ik} \cdot C_{kj}.$$

You can use the taco C++ library to easily and efficiently compute the SDDMM, as
shown here:

```c++
// On Linux and MacOS, you can compile and run this program like so:
//   g++ -std=c++11 -O3 -DNDEBUG -DTACO -I ../../include -L../../build/lib sddmm.cpp -o sddmm -ltaco
//   LD_LIBRARY_PATH=../../build/lib ./sddmm
#include <random>
#include "taco.h"
using namespace taco;
int main(int argc, char* argv[]) {
  std::default_random_engine gen(0);
  std::uniform_real_distribution<double> unif(0.0, 1.0);
  // Predeclare the storage formats that the inputs and output will be stored as.
  // To define a format, you must specify whether each dimension is dense or sparse
  // and (optionally) the order in which dimensions should be stored. The formats
  // declared below correspond to doubly compressed sparse row (dcsr), row-major
  // dense (rm), and column-major dense (dm).
  Format dcsr({Sparse,Sparse});
  Format   rm({Dense,Dense});
  Format   cm({Dense,Dense}, {1,0});

  // Load a sparse matrix from file (stored in the Matrix Market format) and
  // store it as a doubly compressed sparse row matrix. Matrices correspond to
  // order-2 tensors in taco. The matrix in this example can be download from:
  // https://www.cise.ufl.edu/research/sparse/MM/Williams/webbase-1M.tar.gz
  Tensor<double> B = read("webbase-1M.mtx", dcsr);
  // Generate a random dense matrix and store it in row-major (dense) format.
  Tensor<double> C({B.getDimension(0), 1000}, rm);
  for (int i = 0; i < C.getDimension(0); ++i) {
    for (int j = 0; j < C.getDimension(1); ++j) {
      C.insert({i,j}, unif(gen));
    }
  }
  C.pack();

  // Generate another random dense matrix and store it in column-major format.
  Tensor<double> D({1000, B.getDimension(1)}, cm);
  for (int i = 0; i < D.getDimension(0); ++i) {
    for (int j = 0; j < D.getDimension(1); ++j) {
      D.insert({i,j}, unif(gen));
    }
  }
  D.pack();

  // Declare the output matrix to be a sparse matrix with the same dimensions as
  // input matrix B, to be also stored as a doubly compressed sparse row matrix.
  Tensor<double> A(B.getDimensions(), dcsr);

  // Define the SDDMM computation using index notation.
  IndexVar i, j, k;
  A(i,j) = B(i,j) * C(i,k) * D(k,j);

  // At this point, we have defined how entries in the output matrix should be
  // computed from entries in the input matrices but have not actually performed
  // the computation yet. To do so, we must first tell taco to generate code that
  // can be executed to compute the SDDMM operation.
  A.compile();
  // We can now call the functions taco generated to assemble the indices of the
  // output matrix and then actually compute the SDDMM.
  A.assemble();
  A.compute();
  // Write the output of the computation to file (stored in the Matrix Market format).
  write("A.mtx", A);
}
```

You can also use the TACO Python library to perform the same computation, as
demonstrated here:

```python
import pytaco as pt
from pytaco import dense, compressed
import numpy as np

# Define formats that the inputs and output will be stored as.  To define a
# format, you must specify whether each dimension is dense or sparse and
# (optionally) the order in which dimensions should be stored. The formats
# declared below correspond to doubly compressed sparse row (dcsr), row-major
# dense (rm), and column-major dense (dm).
dcsr = pt.format([compressed, compressed])
rm   = pt.format([dense, dense])
cm   = pt.format([dense, dense], [1, 0])

# The matrix in this example can be download from:
# https://www.cise.ufl.edu/research/sparse/MM/Williams/webbase-1M.tar.gz
B = pt.read("webbase-1M.mtx", dcsr)

# Generate two random matrices using NumPy and pass them into TACO
x = pt.from_array(np.random.uniform(size=(B.shape[0], 1000)))
z = pt.from_array(np.random.uniform(size=(1000, B.shape[1])), out_format=cm)

# Declare the result to be a doubly compressed sparse row matrix
A = pt.tensor(B.shape, dcsr)

# Declare index vars
i, j, k = pt.get_index_vars(3)

# Define the SDDMM computation
A[i, j] = B[i, j] * C[i, k] * D[k, j]

# Perform the SDDMM computation and write the result to file
pt.write("A.mtx", A)
```

When you run the above Python program, TACO will generate code under the hood
that efficiently performs the computation in one shot.  This lets TACO only 
compute elements of the intermediate dense matrix product that are actually 
needed to compute the result, thus reducing the asymptotic complexity of the 
computation.

[1] Huasha Zhao. 2014. High Performance Machine Learning through Codesign and
Rooflining. Ph.D. Dissertation. EECS Department, University of California,
Berkeley. 
