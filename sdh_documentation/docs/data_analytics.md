Matricized tensor times Khatri-Rao product (MTTKRP) is a bottleneck operation in various algorithms - such as Alternating Least Squares - for computing sparse tensor factorizations like the Canonical Polyadic Decomposition. Mathematically, mode-1 MTTKRP (for order-3 tensors) can be expressed as \(A = B_{(1)} (D \odot C)\), where \(A\), \(C\), and \(D\) are (typically) dense matrices, \(B\) is an order-3 tensor (matricizied along the first mode), and \(\odot\) denotes the Khatri-Rao product. This operation can also be expressed in [index notation](computations.md#specifying-tensor-algebra-computations) as 

```c++
A(i,j) = B(i,k,l) * D(l,j) * C(k,j)
```

You can use the taco Python library to easily and efficiently compute the MTTKRP as demonstrated here:

```python
import pytaco as pt
import numpy as np
from pytaco import compressed, dense, format

# Declare tensor formats
csf = format([compressed, compressed, compressed])
rm  = format([dense, dense])

# Load a sparse order-3 tensor from file (stored in the FROSTT format) and 
# store it as a compressed sparse fiber tensor. The tensor in this example 
# can be download from: http://frostt.io/tensors/nell-2/
B = pt.read("nell-2.tns", csf);

# Use numpy to create random matrices
C = pt.from_numpy_array(np.random.uniform( size=(B.shape[1], 25) ) )
D = pt.from_numpy_array(np.random.uniform( size=(B.shape[2], 25) ) )

# Create output tensor
A = pt.tensor([B.shape[0], 25], rm)

# Create index vars and define the MTTKRP op
i, j, k, l = get_index_vars(4)
A[i, j] = B[i, k, l] * D[l, j] * C[k, j]

pt.write("A.tns", A)
```

Under the hood, when you run the above Python program, taco generates the imperative code shown below to compute the MTTKRP. taco is able to evaluate this compound operation efficiently with a single kernel that avoids materializing the intermediate Khatri-Rao product.

```c++
for (int B1_pos = B.d1.pos[0]; B1_pos < B.d1.pos[(0 + 1)]; B1_pos++) {
  int iB = B.d1.idx[B1_pos];
  for (int B2_pos = B.d2.pos[B1_pos]; B2_pos < B.d2.pos[(B1_pos + 1)]; B2_pos++) {
    int kB = B.d2.idx[B2_pos];
    for (int B3_pos = B.d3.pos[B2_pos]; B3_pos < B.d3.pos[(B2_pos + 1)]; B3_pos++) {
      int lB = B.d3.idx[B3_pos];
      double t37 = B.vals[B3_pos];
      for (int jD = 0; jD < 25; jD++) {
        int D2_pos = (lB * 25) + jD;
        int C2_pos = (kB * 25) + jD;
        int A2_pos = (iB * 25) + jD;
        A.vals[A2_pos] = A.vals[A2_pos] + ((t37 * D.vals[D2_pos]) * C.vals[C2_pos]);
      }
    }
  }
}
```
