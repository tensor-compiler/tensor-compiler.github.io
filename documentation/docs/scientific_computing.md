Sparse matrix-vector multiplication (SpMV) is a bottleneck computation in many
scientific and engineering computations. Mathematically, SpMV can be expressed
as 

$$y = Ax + z,$$

where \(A\) is a sparse matrix and \(x\), \(y\), and \(z\) are dense vectors.
The computation can also be expressed in [index
notation](pycomputations.md#specifying-tensor-algebra-computations) as 

$$y_i = A_{ij} \cdot x_j + z_i.$$

You can use the TACO C++ library to easily and efficiently compute SpMV, as
shown here:

```c++
// On Linux and MacOS, you can compile and run this program like so:
//   g++ -std=c++11 -O3 -DNDEBUG -DTACO -I ../../include -L../../build/lib spmv.cpp -o spmv -ltaco
//   LD_LIBRARY_PATH=../../build/lib ./spmv
#include <random>
#include "taco.h"
using namespace taco;
int main(int argc, char* argv[]) {
  std::default_random_engine gen(0);
  std::uniform_real_distribution<double> unif(0.0, 1.0);
  // Predeclare the storage formats that the inputs and output will be stored as.
  // To define a format, you must specify whether each dimension is dense or sparse 
  // and (optionally) the order in which dimensions should be stored. The formats 
  // declared below correspond to compressed sparse row (csr) and dense vector (dv). 
  Format csr({Dense,Sparse});
  Format  dv({Dense});
  
  // Load a sparse matrix from file (stored in the Matrix Market format) and 
  // store it as a compressed sparse row matrix. Matrices correspond to order-2 
  // tensors in taco. The matrix in this example can be downloaded from:
  // https://www.cise.ufl.edu/research/sparse/MM/Boeing/pwtk.tar.gz
  Tensor<double> A = read("pwtk.mtx", csr);

  // Generate a random dense vector and store it in the dense vector format. 
  // Vectors correspond to order-1 tensors in taco.
  Tensor<double> x({A.getDimension(1)}, dv);
  for (int i = 0; i < x.getDimension(0); ++i) {
    x.insert({i}, unif(gen));
  }
  x.pack();

  // Generate another random dense vetor and store it in the dense vector format..
  Tensor<double> z({A.getDimension(0)}, dv);
  for (int i = 0; i < z.getDimension(0); ++i) {
    z.insert({i}, unif(gen));
  }
  z.pack();

  // Declare and initializing the scaling factors in the SpMV computation. 
  // Scalars correspond to order-0 tensors in taco.
  Tensor<double> alpha(42.0);
  Tensor<double> beta(33.0);

  // Declare the output matrix to be a sparse matrix with the same dimensions as 
  // input matrix B, to be also stored as a doubly compressed sparse row matrix.
  Tensor<double> y({A.getDimension(0)}, dv);
  // Define the SpMV computation using index notation.
  IndexVar i, j;
  y(i) = alpha() * (A(i,j) * x(j)) + beta() * z(i);
  // At this point, we have defined how entries in the output vector should be 
  // computed from entries in the input matrice and vectorsbut have not actually 
  // performed the computation yet. To do so, we must first tell taco to generate 
  // code that can be executed to compute the SpMV operation.
  y.compile();
  // We can now call the functions taco generated to assemble the indices of the 
  // output vector and then actually compute the SpMV.
  y.assemble();
  y.compute();
  // Write the output of the computation to file (stored in the FROSTT format).
  write("y.tns", y);
}
```

You can also use the TACO Python library to perform the same computation, as
demonstrated here:

```python
import pytaco as pt
from pytaco import compressed, dense
import numpy as np

# Define formats for storing the sparse matrix and dense vectors
csr = pt.format([dense, compressed])
dv  = pt.format([dense])

# Load a sparse matrix stored in the matrix market format) and store it 
# as a CSR matrix.  The matrix in this example can be downloaded from:
# https://www.cise.ufl.edu/research/sparse/MM/Boeing/pwtk.tar.gz
A = pt.read("pwtk.mtx", csr)

# Generate two random vectors using NumPy and pass them into TACO
x = pt.from_array(np.random.uniform(size=A.shape[1]))
z = pt.from_array(np.random.uniform(size=A.shape[0]))

# Declare the result to be a dense vector
y = pt.tensor([A.shape[0]], dv)

# Declare index vars
i, j = pt.get_index_vars(2)

# Define the SpMV computation
y[i] = A[i, j] * x[j] + z[i]

# Perform the SpMV computation and write the result to file
pt.write("y.tns", y)
```

When you run the above Python program, TACO will generate code under the hood
that efficiently performs the computation in one shot.  This lets TACO avoid 
materializing the intermediate matrix-vector product, thus reducing the amount 
of memory accesses and speeding up the computation.
