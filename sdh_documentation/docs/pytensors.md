# Declaring Tensors

`pytaco.tensor` objects, which represent mathematical tensors, form the core of
the TACO Python library. You can can declare a new tensor by specifying the
sizes of each dimension, the [format](pytensors.md#defining-tensor-formats)
that will be used to store the tensor, and the
[datatype](reference/rst_files/dtype_object.html) of the tensor's nonzero elements:

```python
# Import the TACO Python library
import pytaco as pt
from pytaco import dense, compressed

# Declare a new tensor of double-precision floats with dimensions 
# 512 x 64 x 2048, stored as a dense-sparse-sparse tensor
A = pt.tensor([512, 64, 2048], pt.format([dense, compressed, compressed]), pt.float64)
```

The datatype can be omitted, in which case TACO will default to using
`pt.float32` to store the tensor's nonzero elements:

```python
# Declare the same tensor as before
A = pt.tensor([512, 64, 2048], pt.format([dense, compressed, compressed]))
```

Instead of specifying a format that is tied to the number of dimensions that a
tensor has, we can simply specify whether all dimensions are dense or sparse:

```python
# Declare a tensor where all dimensions are dense
A = pt.tensor([512, 64, 2048], dense)

# Declare a tensor where all dimensions are sparse
B = pt.tensor([512, 64, 2048], compressed)
```

Scalars, which correspond to tensors that have zero dimension, can be declared
and initialized with an arbitrary value as demonstrated below:

```python
# Declare a scalar
aplha = pt.tensor(42.0)
```

# Defining Tensor Formats

Conceptually, you can think of a tensor as a tree where each level (excluding
the root) corresponding to a dimension of the tensor.  Each path from the root
to a leaf node represents the coordinates of a tensor element and its
corresponding value.  Which dimension of the tensor each level of the tree
corresponds to is determined by the order in which tensor dimensions are
stored.

TACO uses a novel scheme that can describe different storage formats for a
tensor by specifying the order in which tensor dimensions are stored and
whether each dimension is sparse or dense.  A sparse (compressed) dimension
stores only the subset of the dimension that contains non-zero values, using
index arrays that are found in the compressed sparse row (CSR) matrix format.
A dense dimension, on the other hand, conceptually stores both zeros and
non-zeros.  This scheme is flexibile enough to express many commonly-used
tensor storage formats:

```python
import pytaco as pt
from pytaco import dense, compressed

dm   = pt.format([dense, dense])                        # (Row-major) dense matrix format
csr  = pt.format([dense, compressed])                   # Compressed sparse row matrix format
csc  = pt.format([dense, compressed], [1, 0])           # Compressed sparse column matrix format
dcsr = pt.format([compressed, compressed], [1, 0])      # Doubly compressed sparse column matrix format
csf  = pt.format([compressed, compressed, compressed])  # Compressed sparse fiber tensor format
```

As demonstrated above, you can define a new tensor storage format by creating a
`pytaco.format` object.  This requires specifying whether each tensor dimension
is dense or sparse as well as (optionally) the order in which dimensions should
be stored.  TACO also predefines some common tensor formats (including 
```pt.csr``` and ```pt.csc```) that you can use out of the box.

# Initializing Tensors

Tensors can be made by using python indexing syntax. For example, one may write
the following: You can initialize a tensor by calling its `insert` method to
add a nonzero element to the tensor. The `insert` method takes two arguments:
a list specifying the coordinates of the nonzero element to be added and the
value to be inserted at that coordinate:

```python
# Declare a sparse tensor
A = pt.tensor([512, 64, 2048], compressed)

# Set A(0, 1, 0) = 42.0
A.insert([0, 1, 0], 42.0)
```

If multiple elements are inserted at the same coordinates, they are summed 
together:

```python
# Declare a sparse tensor
A = pt.tensor([512, 64, 2048], compressed)

# Set A(0, 1, 0) = 42.0 + 24.0 = 66.0
A.insert([0, 1, 0], 42.0)
A.insert([0, 1, 0], 24.0)
```

The `insert` method adds the inserted nonzero element to a temporary buffer.
Before a tensor can actually be used in a computation though, the `pack` method
must be invoked to pack the tensor into the storage format that was specified
when the tensor was first declared.  TACO will automatically do this
immediately before the tensor is used in a computation.  You can also manually
invoke `pack` though if you need full control over when exactly that is done:

```python
A.pack()
```

You can then iterate over the nonzero elements of the tensor as follows:

```python
for coordinate, elem in A:
  print(elem)
```

# File I/O

Rather than manually constructing a tensor, you can load tensors directly from
file by invoking the `pytaco.read` function:

```python
# Load a dense-sparse-sparse tensor from file "A.tns"
A = pt.read("A.tns", pt.format([dense, compressed, compressed]))
```

By default, `pytaco.read` returns a tensor that has already been packed into
the specified storage format. You can optionally pass a Boolean flag as an
argument to indicate whether the returned tensor should be packed or not: 

```python
# Load an unpacked tensor from file "A.tns"
A = pt.read("A.tns", format([dense, compressed, compressed]), false)
```

The loaded tensor will then remain unpacked until the `pack` method is manually 
invoked or a computation that uses the tensor is performed.

You can also write a tensor directly to file by invoking the `pytaco.write`
function:

```python
# Write tensor A to file "A.tns"
pt.write("A.tns", A)
```

TACO supports loading tensors from and storing tensors to the following file
formats:

* [Matrix Market (Coordinate) Format (.mtx)](http://math.nist.gov/MatrixMarket/formats.html#MMformat)
* [Rutherford-Boeing Format (.rb)](https://www.cise.ufl.edu/research/sparse/matrices/DOC/rb.pdf)
* [FROSTT Format (.tns)](http://frostt.io/tensors/file-formats.html)

# NumPy and SciPy I/O

Tensors can also be initialized with either NumPy arrays or SciPy sparse (CSR 
or CSC) matrices:

```python
import pytaco as pt
import numpy as np
import scipy.sparse

# Assuming SciPy matrix is stored in CSR
sparse_matrix = scipy.sparse.load_npz('sparse_matrix.npz')

# Cast the matrix as a TACO tensor (also stored in CSR)
taco_tensor = pt.from_sp_csr(sparse_matrix)

# We can also load a NumPy array
np_array = np.load('arr.npy')

# And initialize a TACO tensor from this array
dense_tensor = pt.from_array(np_array)
```

We can also export TACO tensors to either NumPy arrays or SciPy sparse
matrices:

```python
# Convert the tensor to a SciPy CSR matrix
sparse_matrix = taco_tensor.to_sp_csr()

# Convert the tensor to a NumPy array
np_array = dense_tensor.to_array()
```
