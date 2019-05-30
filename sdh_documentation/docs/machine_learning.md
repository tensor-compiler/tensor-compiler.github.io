Sampled dense-dense matrix product (SDDMM) is a bottleneck operation in many
factor analysis algorithms used in machine learning, including Alternating
Least Squares and Latent Dirichlet Allocation [1]. Mathematically, the
operation can be expressed as 

$$A = B \circ CD,$$

where \(A\) and \(B\) are sparse matrices, \(C\) and \(D\) are dense matrices,
and \(\circ\) denotes component-wise multiplication. This operation can also be
expressed in [index
notation](computations.md#specifying-tensor-algebra-computations) as 

$$A_{ij} = B_{ij} \cdot C_{ik} \cdot C_{kj}.$$

You can use the TACO Python library to easily and efficiently compute SDDMM, as
shown here:

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
