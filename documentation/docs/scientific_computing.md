Sparse matrix-vector multiplication (SpMV) is a bottleneck operation in many scientific and engineering computations. Mathematically, the operation demonstrated in this example can be expressed as \(y = \alpha Ax + \beta z\), where \(x\), \(y\), and \(z\) are dense vectors, \(A\) is a sparse matrix, and \(\alpha\) and \(\beta\) are scalar values. This operation can also be expressed in [index notation](computations.md#specifying-tensor-algebra-computations) as 

```c++
y(i) = alpha * A(i,j) * x(j) + beta * z(i)
```

You can use the taco C++ library to easily and efficiently compute the SpMV as demonstrated here:

```c++
// On Linux and MacOS, you can compile and run this program like so:
//   g++ -std=c++11 -O3 -DNDEBUG -DTACO -I ../../include -L../../build/lib -ltaco spmv.cpp -o spmv
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
  for (int i = 0; i < x.getDimension(0)]; ++i) {
    x.insert({i}, unif(gen));
  }
  x.pack();

  // Generate another random dense vetor and store it in the dense vector format..
  Tensor<double> z({A.getDimension(0)}, dv);
  for (int i = 0; i < z.getDimension(0)]; ++i) {
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

You can also use the Python library to compute SpMV as shown here:
```python
import pytaco as pt
from pytaco import compressed, dense
import numpy as np

# Declare the storage formats as explained in the C++ sample
csr = pt.format([dense, compressed])
dv  = pt.format([dense])

# Load a sparse matrix stored in the matrix market format) and store it as a csr matrix. 
# The matrix  # in this example can be downloaded from:
# https://www.cise.ufl.edu/research/sparse/MM/Boeing/pwtk.tar.gz
A = pt.read("pwtk.mtx", csr)

# Generate two random vectors using numpy and pass them into taco
x = pt.from_numpy_array(np.random.uniform(size=A.shape[0]))
z = pt.from_numpy_array(np.random.uniform(size=A.shape[0]))

# Declare output vector as dense
y = pt.tensor([A.shape[0]], dv)

# Create index vars
i, j = pt.get_index_vars(2)

# Define the SpMV computation
y[i] = 42 * A[i, j] * x[j] + 33 * z[i]

# Store the output
pt.write("y.tns", y)
```

Under the hood, when you run the above C++ program, taco generates the imperative code shown below to compute the SpMV. taco is able to evaluate this compound operation efficiently with a single kernel that avoids materializing the intermediate matrix-vector product.

```c++
for (int iA = 0; iA < 217918; iA++) {
  double tj = 0;
  for (int A2_pos = A.d2.pos[iA]; A2_pos < A.d2.pos[(iA + 1)]; A2_pos++) {
    int jA = A.d2.idx[A2_pos];
    tj += A.vals[A2_pos] * x.vals[jA];
  }
  y.vals[iA] = (alpha.vals[0] * tj) + (beta.vals[0] * z.vals[iA]);
}
```
