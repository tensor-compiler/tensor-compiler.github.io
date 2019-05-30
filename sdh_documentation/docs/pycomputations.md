# Specifying Tensor Algebra Computations

Tensor algebra computations can be expressed in TACO using tensor index
notation, which at a high level describes how each element in the result tensor
can be computed from elements in the operand tensors. As an example, matrix
addition can be expressed in index notation as 

$$A_{ij} = B_{ij} + C_{ij}$$

where \(A\), \(B\), and \(C\) denote two-dimensional tensors (i.e., matrices)
while \(i\) and \(j\) are index variables that represent abstract indices into
the corresponding dimensions of the tensors.  In plain English, the example
above essentially states that, for every \(i\) and \(j\), the element in the
\(i\)-th row and \(j\)-th column of \(A\) should be assigned the sum of the
corresponding elements in \(B\) and \(C\). Similarly, element-wise
multiplication of three tensors can be expressed in index notation as 

$$A_{ijk} = B_{ijk} \cdot C_{ijk} \cdot D_{ijk}.$$

To define the same computation using the TACO Python library, we can write very
similar code, with the main difference being that we also have to explicitly
declare the index variables beforehand:

```python
i, j, k = pytaco.index_var(), pytaco.index_var(), pytaco.index_var()
A[i,j,k] = B[i,j,k] * C[i,j,k] * D[i,j,k]
```

This can also be rewritten more compactly as

```python
i, j, k = pytaco.get_index_vars(3)
A[i,j,k] = B[i,j,k] * C[i,j,k] * D[i,j,k]
```

!!! note
    Accesses to scalars also require the square brackets notation.  Since
    scalars are equivalent to tensors with zero dimension, `None` must be
    explicitly specified as indices to indicate that no index variable is
    needed to access a scalar.  As an example, the following expresses the
    addition of two scalars `beta` and `gamma`:

    ```python
    alpha[None] = beta[None] + gamma[None]
    ```

!!! warning
    TACO currently does not support computations that have a tensor as both an 
    operand and the result, such as the following:

    ```python
    a[i] = a[i] * b[i]
    ```

    Such computations can be rewritten using explicit temporaries as follows:

    ```python
    t[i] = a[i] * b[i]
    a[i] = t[i]
    ```

!!! warning
    TACO currently does not support using the same index variable to index into 
    multiple dimensions of the same tensor operand (e.g., `A[i,i]`).

## Expressing Reductions

In all of the previous examples, all the index variables are used to index into
both the result and the operands of a computation.  It is also possible for
an index variable to be used to index into the operands only, in which case the
dimension indexed by that index variable is reduced (summed) over. For 
instance, the computation 

$$y_{i} = A_{ij} \cdot x_{j}$$

can be rewritten with the summation more explicit as 

$$y_{i} = \sum_{j} A_{ij} \cdot x_j$$ 

and demonstrates how matrix-vector multiplication can be expressed in index
notation.  Both forms are supported by TACO:

```python
i, j = pytaco.get_index_vars(2)
y[i] = A[i,j] * x[j]
y[i] = pytaco.sum(j, A[i,j] * x[j])
```

Reductions that are not explicitly expressed are assumed to be over the
smallest subexpression that captures all uses of the corresponding reduction
variable. For instance, the computation 

$$y_{i} = A_{ij} \cdot x_{j} + z_{i}$$

is equivalent to 

$$y_i = \big(\sum_{j} A_{ij} \cdot x_j\big) + z_i,$$

whereas the computation 

$$y_{i} = A_{ij} \cdot x_{j} + z_{j}$$

is equivalent to 

$$y_i = \sum_{j} \big(A_{ij} \cdot x_j + z_j\big).$$

# Expressing Broadcasts

TACO supports computations that broadcasts tensors along any number of
dimensions.  The following example, for instance, broadcasts the vector `c` 
along the row dimension of matrix `B`, adding `c` to each row of `B`:

```python
A[i, j] =  B[i, j] + c[j]
```

However, TACO does not support NumPy-style broadcasting of dimensions that have 
a size of one.  For example, the following is not allowed:

```python
A = pt.tensor([3,3])
B = pt.tensor([3,3])
C = pt.tensor([3,1])

A[i, j] =  B[i, j] + C[i, j]  # ERROR!!
```

# Expressing Transposes

Computations that transpose tensors can be expressed by rearranging the order 
in which index variables are used to access tensor operands.  The following
example, for instance, adds matrix `B` to the transpose of matrix `C` and
stores the result in matrix `A`:

```python
A = pt.tensor([3,3], pt.format([dense, dense]))
B = pt.tensor([3,3], pt.format([dense, dense]))
C = pt.tensor([3,3], pt.format([dense, dense]))
i, j = pt.get_index_vars(2)

A[i,j] = B[i,j] + C[j,i]
```

Note, however, that sparse dimensions of tensor operands impose dependencies on
the order in which they can be accessed, based on the order in which they are
stored in the operand formats.  This means, for instance, that if `B` is a CSR
matrix, then `B[i,j]` requires that the dimension indexed by `i` be accessed
before the dimension indexed by `j`.  TACO does not support any computation
where these constraints form a cyclic dependency.  So the same computation from
before is not supported for CSR matrices, since the access of `B` requires that
`i` be accessed before `j` but the access of `C` requires that `j` be accessed
before `i`:

```python
A = pt.tensor([3,3], pt.format([dense, compressed]))
B = pt.tensor([3,3], pt.format([dense, compressed]))
C = pt.tensor([3,3], pt.format([dense, compressed]))
i, j = pt.get_index_vars(2)

A[i,j] = B[i,j] + C[j,i]
```

As an alternative, you can first explicitly transpose `C` by invoking its
`transpose` method, storing the result in a temporary, and then perform the
addition with the already-transposed temporary:

```python
A = pt.tensor([3,3], pt.format([dense, compressed]))
B = pt.tensor([3,3], pt.format([dense, compressed]))
C = pt.tensor([3,3], pt.format([dense, compressed]))
i, j = pt.get_index_vars(2)

Ct = C.transpose([1, 0])  # Ct is also stored in the CSR format
A[i,j] = B[i,j] + Ct[i,j]
```

Similarly, the following computation is not supported for the same reason that
the access of `B`, which is stored in row-major order, requires `i` to be
accessed before `j` but the access of `C`, which is stored in column-major
order, requires `j` to be accessed before `i`:

```python
A = pt.tensor([3,3], pt.format([dense, compressed]))
B = pt.tensor([3,3], pt.format([dense, compressed]))
C = pt.tensor([3,3], pt.format([dense, compressed], [1, 0]))
i, j = pt.get_index_vars(2)

A[i,j] = B[i,j] + C[i,j]
```

We can again perform the same computation by invoking `transpose`, this time to
repack `C` into the same CSR format as `A` and `B` before computing the 
addition:

```python
A = pt.tensor([3,3], pt.format([dense, compressed]))
B = pt.tensor([3,3], pt.format([dense, compressed]))
C = pt.tensor([3,3], pt.format([dense, compressed], [1, 0]))
i, j = pt.get_index_vars(2)

Cp = C.transpose([0, 1], pt.format([dense, compressed]))  # Store a copy of C in the CSR format
A[i,j] = B[i,j] + Cp[i,j]
```

# Performing the Computation

Once a tensor algebra computation has been defined, you can simply invoke the
result tensor's `evaluate` method to perform the actual computation:

```python
A.evaluate()
```

Under the hood, TACO will first invoke the result tensor's `compile`
method to generate code that performs the computation.  TACO will then perform 
the actual computation by first invoking `assemble` to compute the sparsity 
structure of the result and subsequently invoking `compute` to compute the 
values of the result's nonzero elements.  Of course, you can also manually 
invoke these methods in order to more precisely control when each step happens:

```python
A.compile()
A.assemble()
A.compute()
```

If you define a computation and then access the result without first manually
invoking `evaluate` or `compile`/`assemble`/`compute`, TACO will automatically
invoke the computation immediately before the result is accessed.  In the
following example, for instance, TACO will automatically generate code to
compute the vector addition and then also actually perform the computation
right before `a[0]` is printed:

```python
a[i] = b[i] + c[i]
print(a[0])
```
