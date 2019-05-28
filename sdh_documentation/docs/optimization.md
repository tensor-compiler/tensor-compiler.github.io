
# Selecting the Right Tensor Format

Selecting the right format to store the operands and result of a sparse 
computation can not only minimize the amount of memory required to perform the 
computation but also improve its performance.  <!-- TACO exploit sparsity -->

# Parallelizing Computations

By default, TACO performs all computations using a single thread.  The maximum
number of threads that TACO may use to perform computations can be adjusted by
calling the `pytaco.taco_set_num_threads` function.  The example below, for
instance, tells TACO that up to four threads may be used to perform any
computation that can be executed in parallel:

```python
pytaco.taco_set_num_threads(4)
```

In general, the maximum number of threads for performing computations should
not be set greater than the number of available processor cores.  And depending
on the specific computation and characteristics of the data, setting the
maximum number of threads to be less than the number of processor cores may
actually yield better performance.

!!! note "Note"
    Setting the maximum number of available threads to be greater than one does
    not guarantee that all computations will be executed in parallel.  In
    particular, TACO will not perform a computation in parallel if 

    - it has to simultaneously iterate over the same dimension of multiple
      sparse operands in parallel (e.g., adding two sparse vectors or two DCSR
      matrices), 
    - the first dimension it has to iterate over is one that is supposed to
      reduce over (e.g., multiplying a CSC matrix by a vector, which requires
      iterating over the column dimension of the matrix before the row
      dimension even though the column dimension is reduced over), or
    - it stores the result in a sparse tensor format.
    
    Trying out different formats to store the operands and result may allow
    TACO to parallelize a computation that might otherwise not be
    parallelizable.

By default, when performing computations in parallel, TACO will assign the same
number of coordinates along a particular dimension to be processed by each
thread.  For instance, when adding two 1000-by-1000 matrices using two threads,
TACO will have each thread compute exactly 500 rows of the result.  This would 
be inefficient though if, for instance, all the nonzeros are stored in the
first 500 rows of the operands, since one thread would end up doing all the
work while the other thread does nothing.  In cases like this, an alternative
parallelization strategy can be specified by calling the
`pytaco.taco_set_parallel_schedule` function:

```python
pt.taco_set_parallel_schedule("dynamic") 
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
pt.taco_set_parallel_schedule("dynamic", 10) 
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
computed.  This avoids the need for storing the sum of `b` and `c` in a
temporary vector, thereby increasing performance.

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
