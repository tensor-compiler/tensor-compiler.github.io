Matricized tensor times Khatri-Rao product (MTTKRP) is a bottleneck operation
in various algorithms - such as Alternating Least Squares - for computing
sparse tensor factorizations like the Canonical Polyadic Decomposition.
Mathematically, mode-1 MTTKRP (for three-dimensional tensors) can be expressed 
as 

$$A = B_{(1)} (D \odot C),$$

where \(A\), \(C\), and \(D\) are typically dense matrices, \(B\) is a
three-dimensional tensor (matricizied along the first mode), and \(\odot\)
denotes the Khatri-Rao product. This operation can also be expressed in [index
notation](pycomputations.md#specifying-tensor-algebra-computations) as 

$$A_{ij} = B_{ikl} \cdot D_{lj} \cdot C_{kj}.$$

You can use the TACO C++ library to easily and efficiently compute the MTTKRP,
as shown here:
```c++
// On Linux and MacOS, you can compile and run this program like so:
//   g++ -std=c++11 -O3 -DNDEBUG -DTACO -I ../../include -L../../build/lib mttkrp.cpp -o mttkrp -ltaco
//   LD_LIBRARY_PATH=../../build/lib ./mttkrp
#include <random>
#include "taco.h"
using namespace taco;
int main(int argc, char* argv[]) {
  std::default_random_engine gen(0);
  std::uniform_real_distribution<double> unif(0.0, 1.0);
  // Predeclare the storage formats that the inputs and output will be stored as.
  // To define a format, you must specify whether each dimension is dense or 
  // sparse and (optionally) the order in which dimensions should be stored. The 
  // formats declared below correspond to compressed sparse fiber (csf) and 
  // row-major dense (rm).
  Format csf({Sparse,Sparse,Sparse});
  Format  rm({Dense,Dense});
 
  // Load a sparse order-3 tensor from file (stored in the FROSTT format) and 
  // store it as a compressed sparse fiber tensor. The tensor in this example 
  // can be download from: http://frostt.io/tensors/nell-2/
  Tensor<double> B = read("nell-2.tns", csf);
  // Generate a random dense matrix and store it in row-major (dense) format. 
  // Matrices correspond to order-2 tensors in taco.
  Tensor<double> C({B.getDimension(1), 25}, rm);
  for (int i = 0; i < C.getDimension(0); ++i) {
    for (int j = 0; j < C.getDimension(1); ++j) {
      C.insert({i,j}, unif(gen));
    }
  }
  C.pack();


  // Generate another random dense matrix and store it in row-major format.
  Tensor<double> D({B.getDimension(2), 25}, rm);
  for (int i = 0; i < D.getDimension(0); ++i) {
    for (int j = 0; j < D.getDimension(1); ++j) {
      D.insert({i,j}, unif(gen));
    }
  }
  D.pack();

    // Declare the output matrix to be a dense matrix with 25 columns and the same
  // number of rows as the number of slices along the first dimension of input
  // tensor B, to be also stored as a row-major dense matrix.
  Tensor<double> A({B.getDimension(0), 25}, rm);


  // Define the MTTKRP computation using index notation.
  IndexVar i, j, k, l;
  A(i,j) = B(i,k,l) * D(l,j) * C(k,j);
  // At this point, we have defined how entries in the output matrix should be
  // computed from entries in the input tensor and matrices but have not actually
  // performed the computation yet. To do so, we must first tell taco to generate
  // code that can be executed to compute the MTTKRP operation.
  A.compile();
  // We can now call the functions taco generated to assemble the indices of the
  // output matrix and then actually compute the MTTKRP.
  A.assemble();
  A.compute();
  // Write the output of the computation to file (stored in the FROSTT format).
  write("A.tns", A);
}
```

You can also use the TACO Python library to perform the same computation, as
demonstrated here:

```python
import pytaco as pt
import numpy as np
from pytaco import compressed, dense

# Define formats for storing the sparse tensor and dense matrices
csf = pt.format([compressed, compressed, compressed])
rm  = pt.format([dense, dense])

# Load a sparse three-dimensional tensor from file (stored in the FROSTT
# format) and store it as a compressed sparse fiber tensor. The tensor in this
# example can be download from: http://frostt.io/tensors/nell-2/
B = pt.read("nell-2.tns", csf);

# Generate two random matrices using NumPy and pass them into TACO
C = pt.from_array(np.random.uniform(size=(B.shape[1], 25)))
D = pt.from_array(np.random.uniform(size=(B.shape[2], 25)))

# Declare the result to be a dense matrix
A = pt.tensor([B.shape[0], 25], rm)

# Declare index vars
i, j, k, l = get_index_vars(4)

# Define the MTTKRP computation
A[i, j] = B[i, k, l] * D[l, j] * C[k, j]

# Perform the MTTKRP computation and write the result to file
pt.write("A.tns", A)
```

When you run the above Python program, TACO will generate code under the hood
that efficiently performs the computation in one shot.  This lets TACO avoid
materializing the intermediate Khatri-Rao product, thus reducing the amount of
memory accesses and speeding up the computation.
