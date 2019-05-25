Sparse matrix-vector multiplication (SpMV) is a bottleneck operation in many scientific and engineering computations. Mathematically, the operation demonstrated in this example can be expressed as \(y = \alpha Ax + \beta z\), where \(x\), \(y\), and \(z\) are dense vectors, \(A\) is a sparse matrix, and \(\alpha\) and \(\beta\) are scalar values. This operation can also be expressed in [index notation](computations.md#specifying-tensor-algebra-computations) as 

```c++
y(i) = alpha * A(i,j) * x(j) + beta * z(i)
```

You can use the taco Python library to easily and efficiently compute the SpMV as demonstrated here:

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

Under the hood, when you run the above Python program, taco generates the imperative code shown below to compute the SpMV. taco is able to evaluate this compound operation efficiently with a single kernel that avoids materializing the intermediate matrix-vector product.

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
