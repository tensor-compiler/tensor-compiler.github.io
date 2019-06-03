This section describes various strategies for improving the performace of
applications that use TACO to perform linear and tensor algebra computations.

# Selecting the Right Tensor Format

TACO supports storing tensors in a wide range of formats, including many
commonly used ones like dense arrays, compressed sparse row (CSR), and
compressed sparse fiber (CSF).  Using the right formats to store a sparse
computation's operands and result can not only reduce the amount of memory
needed to perform the computation but also improve its performance.  In
particular, by selecting formats that accurately describe the sparsity and
structure of the operands, TACO can generate code under the hood that exploits
these properties of the data to avoid redundantly computing with zero elements
and thus speed up a computation.

As previously [explained](pytensors.md#defining-tensor-formats), TACO uses a
novel scheme that describes different tensor storage formats by specifying
whether each dimension is sparse or dense.  A dense dimension indicates to TACO
that most if not all slices of the tensor along that dimension contain at least
one nonzero element.  So if every element in a matrix is nonzero, we can make
that explicit by storing the matrix in a format where both dimensions are
dense, which indicates that every row is nonempty and that every column in each
row stores a nonzero element:

```python
pytaco.format([pytaco.dense, pytaco.dense])  # a.k.a. a dense array
```

A sparse dimension, on the other hand, indicates to TACO that most slices of
the tensor along that dimension contain only zeros.  So if relatively few rows
of a matrix is nonempty and if relatively few columns in each nonempty row
store nonzero elements, we can also make that explicit by storing the matrix in
a format where both dimensions are sparse:

```python
pytaco.format([pytaco.compressed, pytaco.compressed])  # a.k.a. a DCSR matrix
```

!!! tip
    Storing a tensor dimension as a sparse dimension incurs overhead that is 
    proportional to the number of nonempty slices along that dimension, so only 
    do so if most slices are actually empty.  Otherwise, it is more appropriate 
    to store the dimension as a dense dimension.

It is easy to define custom formats for storing tensors with complex
sparsity structures.  For example, let's say we have a three-dimensional
tensor \(A_{ijk}\) that has no empty slice along the \(K\) dimension, and let's
say that each row in a slice is either entirely empty (i.e., \(A_{ijk} = 0\)
for all \(j\) and some fixed \(k\), \(i\)) or entirely full (i.e., \(A_{ijk}
\neq 0\) for all \(j\) and some fixed \(k\), \(i\)).  Following the same scheme
as before, we can define a tensor format that stores dimension 2 (i.e., the
\(K\) dimension) as a dense dimension, stores dimension 0 (i.e., the \(I\)
dimension) of each slice along dimension 2 as a sparse dimension, and stores
dimension 1 (i.e., the \(J\) dimension) of each nonempty row as a dense
dimension also:

```python
pytaco.format([pytaco.dense, pytaco.compressed, pytaco.dense], [2, 0, 1])
```

Using the format above, we can then efficiently store \(A\) without explicitly 
storing any zero element.

As a rough rule of thumb, using formats that accurately describe the sparsity
and structure of the operands lets TACO minimize memory traffic incurred to
load tensors from memory as well as minimize redundant work done to perform a
computation, which boosts performance.  This is particularly the case when only
one operand is sparse and the computation does not involve adding elements of
multiple operands.  **This is not a hard and fast rule though.**  In
particular, computing with multiple sparse operands might prevent TACO from 
applying some optimizations like [parallelization](#parallelizing-computations) 
that might otherwise be possible if some of those operands were stored in dense 
formats.  Depending on how sparse your data actually is, this may or may not 
negatively impact performance.

The most reliable way to determine what are the best formats for storing
tensors in your application is to just try out many different formats and see
what works. Fortunately, as the examples above demonstrate, this is simple to
do with TACO.

# Parallelizing Computations

By default, TACO performs all computations using a single thread.  The maximum
number of threads that TACO may use to perform computations can be adjusted by
calling the `pytaco.set_num_threads` function.  The example below, for
instance, tells TACO that up to four threads may be used to execute any
subsequent computation in parallel if possible:

```python
pytaco.set_num_threads(4)
```

In general, the maximum number of threads for performing computations should
not be set greater than the number of available processor cores.  And depending
on the specific computation and characteristics of the data, setting the
maximum number of threads to be less than the number of processor cores may
actually yield better performance.  As the example above demonstrates, TACO 
makes it easy to try out different numbers of threads and see what works best 
for your application.

!!! note 
    Setting the maximum number of available threads to be greater than one does
    not guarantee that all computations will be executed in parallel.  In
    particular, TACO will not execute a computation in parallel if 

    - it multiplies two or more sparse operands (e.g. sparse vector
      multiplication) or adds a sparse operand to any other operand (e.g.,
      adding two DCSR matrices), unless the outermost dimensions of the sparse
      operands are stored as dense dimensions (e.g., adding two CSR matrices,
      which can be parallelized if the result is stored in a dense matrix); 
    - the first dimension it has to iterate over is one that is supposed to
      reduce over (e.g., multiplying a CSC matrix by a vector, which requires
      iterating over the column dimension of the matrix before the row
      dimension even though the column dimension is reduced over); or
    - it stores the result in a sparse tensor format.
    
    If TACO does not seem to be executing a computation in parallel, using 
    different formats to store the operands and result may help.

By default, when performing computations in parallel, TACO will assign the same
number of coordinates along a particular dimension to be processed by each
thread.  For instance, when adding two 1000-by-1000 matrices using two threads,
TACO will have each thread compute exactly 500 rows of the result.  This would 
be inefficient though if, for instance, all the nonzeros are stored in the
first 500 rows of the operands, since one thread would end up doing all the
work while the other thread does nothing.  In cases like this, an alternative
parallelization strategy can be specified by calling the
`pytaco.set_parallel_schedule` function:

```python
pt.set_parallel_schedule("dynamic") 
```

In contrast to the default parallelization strategy, the dynamic strategy will
have each thread first compute just one row of the result.  Whenever a thread
finishes computing a row, TACO will assign another row for that thread to
compute, and this process is repeated until all 1000 rows have been computed.
In this way, work is guaranteed to be evenly distributed between the two
threads regardless of the sparsity structures of the operands.

Using a dynamic strategy for parallel execution will incur some overhead
though, since work is assigned to threads at runtime.  This overhead can be
reduced by increasing the chunk size, which is the amount of additional work
that is assigned to a thread whenever it completes its previously assigned
work.  The example below, for instance, tells TACO to assign ten additional
rows of the result (instead of just one) for a thread to compute whenever it
has completed the previous ten rows:

```python
pt.set_parallel_schedule("dynamic", 10) 
```

Since dynamic parallelization strategies incur additional overhead, whether or
not using them improves the performance of a computation will depend on how
evenly spread out the nonzero elements in the tensor operands are.  If each
matrix contains roughly the same number of nonzeros in every row, for instance,
then using a dynamic strategy will likely not more evenly distribute work
between threads.  In that case, the default static schedule would likely yield
better performance.

# Fusing Computations

TACO supports efficiently computing complicated tensor algebra expressions
involving many discrete operations in a single shot.  Let's say, for instance,
that we would like to (element-wise) add two vectors `b` and `c` and compute
the cosine of each element in the sum.  We can, of course, simply compute the
addition and the cosine of the sum in separate statements:

```python
t[i] = b[i] + c[i]
a[i] = pt.cos(t[i])
```

The program above will first invoke TACO to add `b` and `c`, store the result
into a temporary vector `t`, and then invoke TACO again to compute the cosine
of every element in `t`.  Performing the computation this way though not only
requires additional memory for storing `t` but also requires accessing the
memory subsystem to first write `t` to memory and then load `t` back from
memory, which is inefficient if the vectors are large and cannot be stored in
cache.  Instead, we can compute the addition and the cosine of the sum in a 
single statement:

```python
a[i] = pt.cos(b[i] + c[i])
```

For the program above, TACO will automatically generate code that, for every
`i`, immediately computes the cosine of `b[i] + c[i]` as soon as the sum is
computed.  TACO thus avoids storing the sum of `b` and `c` in a temporary
vector, thereby increasing the performance of the computation.

Fusing computations can improve performance if it does not require intermediate
results to be recomputed multiple times, as is the case with the previous
example.  Let's say, however, that we would like to multiply a matrix `B` by a
vector `c` and then multiply another matrix `A` by the result of the first
multiplication.  As before, we can express both operations in a single
statement:

```python
y[i] = A[i,j] * B[j,k] * x[k]
```

In this case though, computing both operations in one shot would require that
the multiplication of `B` and `x` be redundantly recomputed for every
(non-empty) row of `A`, thus reducing performance.  By contrast, computing the
two matrix-vector multiplications in separate statement ensures that the result
of the first matrix-vector multiplication does not have to be redundantly
computed, thereby minimizing the amount of work needed to perform the
computation:

```python
t[j] = B[j,k] * c[k]
y[i] = A[i,j] * t[j]
```
