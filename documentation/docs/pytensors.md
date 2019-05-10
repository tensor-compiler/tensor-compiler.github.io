# Declaring Tensors

`pytaco.Tensor` objects correspond to mathematical Tensors similar to the C++ library. You can can declare a new tensor by specifying its name, a vector with the size of each dimension and the [storage format](pytensors.md#defining-tensor-formats) that will be used to store the tensor and a datatype(pytensors.md#Datatypes):

```python
# Import the pytaco library
import pytaco as pt
# Import the storage formats to save some typing
from pytaco import dense, compressed

# Declare a new tensor "A" of double-precision floats with dimensions 
# 512 x 64 x 2048, stored as a dense-sparse-sparse tensor
A = pt.tensor("A", [512, 64, 2048], pt.format([dense, compressed, compressed]), pt.float64)
```

The name of the tensor can be omitted, in which case taco will assign an arbitrary name to the tensor:
```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a tensor with the same dimensions, storage format and type as before
A = pt.tensor([512, 64, 2048], pt.format([dense, compressed, compressed]), pt.float64)
```

The [datatype](pytensors.md#Tensor-Datatypes) can also be omitted in which case taco will default to using `pt.float32`:
```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a tensor with the same dimensions and storage format as before
A = pt.tensor([512, 64, 2048], pt.format([dense, compressed, compressed]))
```

A single format can be given to create a tensor where all dimensions have that format:
```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a dense tensor
A = pt.tensor([512, 64, 2048], dense)

# Declare a compressed tensor
B = pt.tensor([512, 64, 2048], compressed)
```

Scalars, which are treated as order-0 tensors, can be declared and initialized with some arbitrary value as demonstrated below:
```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a scalar
aplha = pt.tensor(42.0)
```

# Defining Tensor Formats

Storage formats are described conceptually [here](tensors.md#defining-tensor-formats).

Similar to the C++ API, you can define a new tensor storage format by creating a `pytaco.format` object. The constructor for `pytaco.format` takes as arguments a list specifying the type of each dimension and (optionally) a list specifying the order in which dimensions are to be stored, as seen below:
```python
import pytaco as pt
from pytaco import dense, compressed, format
dm   = format([dense, dense])                   # (Row-major) dense matrix
csr  = format([dense, compressed])              # Compressed sparse row matrix
csc  = format([dense, compressed], [1, 0])      # Compressed sparse column matrix
dcsr = format([compressed, compressed], [1, 0]) # Doubly compressed sparse column matrix
```

```pytaco``` provides common formats (csr, csc and csf) by default and can be used by simply typing ```pt.csr```, ```pt.csc``` or ```pt.csf```.

# Tensor Datatypes

Tensors can be of 10 different datatypes. The following are the possible tensor datatypes:

Signed Integers:

```pytaco.int8```

```pytaco.int16```

```pytaco.int32```

```pytaco.int64```

Unsigned Integers:

```pytaco.uint8```

```pytaco.uint16```

```pytaco.uint32```

```pytaco.uint64```

Floating point precision: 

```pytaco.float32``` 

```pytaco.float```

Double precision: 

```pytaco.float64``` 

```pytaco.double```

# Initializing Tensors

Tensors can be made by using python indexing syntax. For example, one may write the following:
```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a dense tensor
A = pt.tensor([512, 64, 2048], compressed)

# Set location (0, 1, 0) in A to 42.0
A[0, 1, 0] = 42.0
```

The insert operator adds the inserted non-zeros to a temporary buffer. Before a tensor can actually be used in a computation, it is automatcally packed. 

For most cases, this is not necessary but you may also invoke the `pack` method to compress the tensor into the storage format that was specified after all values have been inserted.

NOTE: Multidimensional indexing (as used with lists) are NOT supported. For example, the following is invalid code:

```python
import pytaco as pt
from pytaco import dense, compressed

# Declare a dense tensor
A = pt.tensor([512, 64, 2048], compressed)

# INVALID STATEMENT
A[0][1][0] = 42.0
```

# Loading Tensors from File

Rather than manually invoking building a tensor, you can load tensors directly from file by calling `pytaco.read` as demonstrated below:

```python
import pytaco as pt
from pytaco import dense, compressed, format

# Load a dense-sparse-sparse tensor from file A.tns
A = pt.read("A.tns", format([dense, compressed, compressed]))
```

By default, `pytaco.read` returns a packed tensor. You can optionally pass a Boolean flag as an argument to indicate whether the returned tensor should be packed or not: 

```python
import pytaco as pt
from pytaco import dense, compressed, format

# Load an unpacked tensor from file A.tns
A = pt.read("A.tns", format([dense, compressed, compressed]), false)
```
NOTE: the tensor will be packed anyway before any computation is actually performed.


Currently, taco supports loading from the following matrix and tensor file formats:

* [Matrix Market (Coordinate) Format (.mtx)](http://math.nist.gov/MatrixMarket/formats.html#MMformat)
* [Rutherford-Boeing Format (.rb)](https://www.cise.ufl.edu/research/sparse/matrices/DOC/rb.pdf)
* [FROSTT Format (.tns)](http://frostt.io/tensors/file-formats.html)

# Writing Tensors to Files

You can also write a (packed) tensor directly to file by calling `pytaco.write`, as demonstrated below:

```python
import pytaco as pt

A = pt.tensor([512, 64, 2048], compressed)
A[0, 1, 0] = 42.0
A[1, 1, 1] = 77
pt.write("A.tns", A);  # Write tensor A to file A.tns
```

`pytaco.write` supports the same set of matrix and tensor file formats as `pytaco.read`.

# I/O with Numpy or Scipy

Tensors can be initialized with either numpy arrays or scipy sparse CSC or CSR matrices. As such, we can use the I/O from numpy and scipy and feed the data into pytaco by initializing a tensor.

```python
import pytaco as pt
import numpy as np
import scipy.sparse

# Assuming matrix is CSR
sparse_matrix = scipy.sparse.load_npz('sparse_matrix.npz')

# Pass data into taco for use
taco_tensor = pt.from_scipy_csr(sparse_matrix)

# We can also load a numpy array
np_array = np.load('arr.npy')

# And initialize a tensor from this array
dense_tensor = pt.from_numpy_array(np_array)
```




