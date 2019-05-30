Matricized tensor times Khatri-Rao product (MTTKRP) is a bottleneck operation
in various algorithms - such as Alternating Least Squares - for computing
sparse tensor factorizations like the Canonical Polyadic Decomposition.
Mathematically, mode-1 MTTKRP (for three-dimensional tensors) can be expressed 
as 

$$A = B_{(1)} (D \odot C),$$

where \(A\), \(C\), and \(D\) are typically dense matrices, \(B\) is a
three-dimensional tensor (matricizied along the first mode), and \(\odot\)
denotes the Khatri-Rao product. This operation can also be expressed in [index
notation](computations.md#specifying-tensor-algebra-computations) as 

$$A_{ij} = B_{ikl} \cdot D_{lj} \cdot C_{kj}.$$

You can use the TACO Python library to easily and efficiently compute MTTKRP,
as shown here:

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
