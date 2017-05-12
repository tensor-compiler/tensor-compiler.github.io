**Machine Learning with taco: SDDMM**

Sampled dense-dense matrix product (SDDMM) is a bottleneck operation in many factor analysis algorithms used in machine learning, including Alternating 
Least Squares and Latent Dirichlet Allocation [1]. Mathematically, the operation can be expressed as `A = B .* (C * D)`, where `A` and `B` are sparse matrices, `C` and `D` are dense matrices, and `.*` denotes component-wise multiplication. This operation can also be expressed in index notation as 

```
  A(i,j) = B(i,j) * C(i,k) * D(k,j)
```

You can use the taco C++ library to easily and efficiently compute the SDDMM as demonstrated here:

```c++
// On Linux and MacOS, you can compile and run this program like so:
//   g++ -std=c++11 -O3 -DNDEBUG -DTACO -I ../../include -L../../build/lib -ltaco sddmm.cpp -o sddmm
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
  // order-2 tensors in taco.
  Tensor<double> B = read("../data/webbase.mtx", dcsr);

  // Generate a random dense matrix and store it in row-major (dense) format.
  Tensor<double> C({B.getDimensions()[0], 1000}, rm);
  for (int i = 0; i < C.getDimensions()[0]; ++i) {
    for (int j = 0; j < C.getDimensions()[1]; ++j) {
      C.insert({i,j}, unif(gen));
    }
  }
  C.pack();

  // Generate another random dense matrix and store it in column-major format.
  Tensor<double> D({1000, B.getDimensions()[1]}, cm);
  for (int i = 0; i < D.getDimensions()[0]; ++i) {
    for (int j = 0; j < D.getDimensions()[1]; ++j) {
      D.insert({i,j}, unif(gen));
    }
  }
  D.pack();

  // Declare the output matrix to be a sparse matrix with the same dimensions as 
  // input matrix B, to be also stored as a doubly compressed sparse row matrix.
  Tensor<double> A(B.getDimensions(), dcsr);

  // Define the SDDMM computation using index notation.
  Var i, j, k(Var::Sum);
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

Under the hood, when you run the above C++ program, taco generates the imperative code shown below to compute the SDDMM. taco is able to do this efficiently by only computing entries of the intermediate matrix product that are actually needed to compute the output tensor `A`.

```c++
int A1_pos = A.d1.pos[0];
int A2_pos = A.d2.pos[A1_pos];
for (int B1_pos = B.d1.pos[0]; B1_pos < B.d1.pos[(0 + 1)]; B1_pos++) {
  int iB = B.d1.idx[B1_pos];
  for (int B2_pos = B.d2.pos[B1_pos]; B2_pos < B.d2.pos[(B1_pos + 1)]; B2_pos++) {
    int jB = B.d2.idx[B2_pos];
    double tk = 0;
    for (int kC = 0; kC < 1000; kC++) {
      int C2_pos = (iB * 1000) + kC;
      int D2_pos = (jB * 1000) + kC;
      tk += (B.vals[B2_pos] * C.vals[C2_pos]) * D.vals[D2_pos];
    }
    A.vals[A2_pos] = tk;
    A2_pos++;
  }
  if (A.d2.pos[(A1_pos + 1)] > A.d2.pos[A1_pos]) A1_pos++;
}
```

[1] Huasha Zhao. 2014. High Performance Machine Learning through Codesign and Rooflining. Ph.D. Dissertation. EECS Department, University of California, Berkeley. 
