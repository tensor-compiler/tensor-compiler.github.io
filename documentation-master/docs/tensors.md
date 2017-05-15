# Declaring Tensors

`taco::Tensor` objects, which correspond to mathematical tensors, form the core of the taco C++ library. You can declare a new tensor by specifying its name, a vector containing the size of each dimension of the tensor, and the [storage format](tensors.md#defining-tensor-formats) that will be used to store the tensor:

```c++
// Declare a new tensor "A" of double-precision floats with dimensions 
// 512 x 64 x 2048, stored as a dense-sparse-sparse tensor
Tensor<double> A("A", {512,64,2048}, Format({Dense,Sparse,Sparse}));
```

The name of the tensor can be omitted, in which case taco will assign an arbitrary name to the tensor:

```c++
// Declare another tensor with the same dimensions and storage format as before
Tensor<double> A({512,64,2048}, Format({Dense,Sparse,Sparse}));
```

Scalars, which are treated as order-0 tensors, can be declared and initialized with some arbitrary value as demonstrated below:

```c++
Tensor<double> alpha(42.0);  // Declare a scalar tensor initialized to 42.0
```

# Defining Tensor Formats

Conceptually, you can think of a tensor as a tree with each level (excluding the root) corresponding to a dimension of the tensor. Each path from the root to a leaf node represents a tensor coordinate and its corresponding value. Which dimension each level of the tree corresponds to is determined by the order in which dimensions of the tensor are stored.

taco uses a novel scheme that can describe different storage formats for any tensor by specifying the order in which tensor dimensions are stored and whether each dimension is sparse or dense. A sparse dimension stores only the subset of the dimension that contains non-zero values and is conceptually similar to the index arrays used in the compressed sparse row (CSR) matrix format, while a dense dimension stores both zeros and non-zeros. As demonstrated below, this scheme is flexibile enough to express many commonly-used matrix storage formats.

You can define a new tensor storage format by creating a `taco::Format` object. The constructor for `taco::Format` takes as arguments a vector specifying the type of each dimension and (optionally) a vector specifying the order in which dimensions are to be stored, following the above scheme:
```c++
Format   dm({Dense,Dense});           // (Row-major) dense matrix
Format  csr({Dense,Sparse});          // Compressed sparse row matrix
Format  csc({Dense,Sparse}, {1,0});   // Compressed sparse column matrix
Format dcsr({Sparse,Sparse}, {1,0});  // Doubly compressed sparse column matrix
```

Alternatively, you can define a tensor format that contains only sparse or dense dimensions as follows:

```c++
Format csf(Sparse);  // Compressed sparse fiber tensor
```

# Initializing Tensors

You can initialize a `taco::Tensor` by calling the `insert` method to add a non-zero component to the tensor. The `insert` method takes two arguments, a vector specifying the coordinate of the non-zero component to be added and the value to be inserted at that coordinate:

```c++
A.insert({128,32,1024}, 42.0);  // A(128,32,1024) = 42.0
```

The `insert` method adds the inserted non-zeros to a temporary buffer. Before a tensor can actually be used in a computation though, you must invoke the `pack` method to compress the tensor into the storage format that was specified when the tensor was first declared:

```c++
A.pack();  // Construct dense-sparse-sparse tensor containing inserted non-zeros
```

# Loading Tensors from File

Rather than manually invoking `insert` and `pack` to initialize a tensor, you can load tensors directly from file by calling `taco::read` as demonstrated below:

```c++
// Load a dense-sparse-sparse tensor from file A.tns
A = read("A.tns", Format({Dense, Sparse, Sparse}));
```

By default, `taco::read` returns a packed tensor. You can optionally pass a Boolean flag as an argument to indicate whether the returned tensor should be packed or not:

```c++
// Load an unpacked tensor from file A.tns
A = read("A.tns", Format({Dense, Sparse, Sparse}), false);
```

Currently, taco supports loading from the following matrix and tensor file formats:

* [Matrix Market (Coordinate) Format (.mtx)](http://math.nist.gov/MatrixMarket/formats.html#MMformat)
* [Harwell-Boeing Format (.hb)](http://math.nist.gov/MatrixMarket/formats.html#hb)
* [FROSTT Format (.tns)](http://frostt.io/tensors/file-formats.html)

# Writing Tensors to File

You can also write a (packed) tensor directly to file by calling `taco::write`, as demonstrated below:

```c++
write("A.tns", A);  // Write tensor A to file A.tns
```

`taco::write` supports the same set of matrix and tensor file formats as `taco::read`.