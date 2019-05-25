Sampled dense-dense matrix product (SDDMM) is a bottleneck operation in many factor analysis algorithms used in machine learning, including Alternating 
Least Squares and Latent Dirichlet Allocation [1]. Mathematically, the operation can be expressed as \(A = B \circ CD\), where \(A\) and \(B\) are sparse matrices, \(C\) and \(D\) are dense matrices, and \(\circ\) denotes component-wise multiplication. This operation can also be expressed in [index notation](computations.md#specifying-tensor-algebra-computations) as 

```c++
A(i,j) = B(i,j) * C(i,k) * D(k,j)
```

You can use the taco Python library to easily and efficiently compute the SDDMM as demonstrated here:


```python
import pytaco as pt
from pytaco import dense, compressed, format
import numpy as np

# Predeclare the storage formats that the inputs and output will be stored as.
# To define a format, you must specify whether each dimension is dense or sparse 
# and (optionally) the order in which dimensions should be stored. The formats 
# declared below correspond to doubly compressed sparse row (dcsr), row-major 
# dense (rm), and column-major dense (dm).
dcsr = format([compressed, compressed])
rm   = format([dense, dense])
cm   = format([dense, dense], [1, 0])

# The matrix in this example can be download from:
# https://www.cise.ufl.edu/research/sparse/MM/Williams/webbase-1M.tar.gz
B = pt.read("webbase-1M.mtx", dcsr)

# Use numpy to create random matrices
x = pt.from_numpy_array(np.random.uniform( size=(B.shape[0], 1000) ) )
z = pt.from_numpy_array(np.random.uniform( size=(1000, B.shape[1]) ), out_format=cm )

# Declare output matrix as doubly compressed sparse row
A = pt.tensor(B.shape, dcsr)

# Create index vars
i, j, k = pt.get_index_vars(3)
A[i, j] = B[i, j] * C[i, k] * D[k, j]

# store tensor
pt.write("A.mtx", A)
```

Under the hood, when you run the above Python program, taco generates the imperative code shown below to compute the SDDMM. taco is able to do this efficiently by only computing entries of the intermediate matrix product that are actually needed to compute the output tensor `A`.

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
