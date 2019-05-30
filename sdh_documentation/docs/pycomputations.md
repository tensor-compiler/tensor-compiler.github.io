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

!!! warning
    It is important to note that due to the complications that arise from
    assembling sparse structures, we cannot have a tensor appear both on the left
    hand side and the right hand side of an expression.  For all forms of index
    expressions, we do not support indexing a tensor with the same index variable.
    For example expressions such as ```A[i,i]``` are disallowed.

NOTE: When using scalars to express computations we must still use the square brackets to index the tensor. Since scalars are order-0 tensors, ```None``` must be passed into the index to specify that no ```indexVar```s are used:
```python
import pytaco as pt
i, j = pt.get_index_vars(2)

# Make a scalar value
A = pt.tensor(0)
# Make a compressed tensor of size 3x3
B = pt.tensor([3,3])

# Make some assignments
B[0, 0] = 1
B[1, 0] = 10

# We can sum the elements in B as follows. Notice we need to use None to tell 
# taco that A is a scalar.
A[None] = B[i, j]
```

## Expressing Reductions

In both of the previous examples, all of the index variables are used to index into both the output and the inputs. However, it is possible for an index variable to be used to index into the inputs only, in which case the index variable is reduced (summed) over. For instance, the following example 

```c++
y(i) = A(i,j) * x(j)
```

can be rewritten with the summation more explicit as \(y(i) = \sum_{j} A(i,j) \cdot x(j)\) and demonstrates how matrix-vector multiplication can be expressed in index notation.

Note that, in taco, reductions are assumed to be over the smallest subexpression that captures all uses of the corresponding reduction variable. For instance, the following computation 

```c++
y(i) = A(i,j) * x(j) + z(i)
```

can be rewritten with the summation more explicit as 

$$y(i) = \big(\sum_{j} A(i,j) \cdot x(j)\big) + z(i),$$

whereas the following computation 

```c++
y(i) = A(i,j) * x(j) + z(j)
```

can be rewritten with the summation more explicit as 

$$y(i) = \sum_{j} \big(A(i,j) \cdot x(j) + z(i)\big).$$

# Expressing Broadcasts

When using ```indexVar```s, we must ensure that dimensions with the same ```indexVar``` are of the same size. Operations can be broadcast along outer dimensions assuming the inner dimensions are of the same size. For example:

```python
import pytaco as pt
i, j, k = pt.get_index_vars(3)

# Make a compressed tensor of size 3x3
A = pt.tensor([3,3])
B = pt.tensor([3,3])

# Make a dense vector
C = pt.tensor([3], pt.dense)

# Make some assignments
C[0] = 1
B[0, 0] = 1

# We can add C to each row of B as follows:
A[i, j] =  B[i, j] + C[j]
```

The following, however, is not valid since the dimension of index j is of a different size for the different tensors:
```python
import pytaco as pt
i, j, k = pt.get_index_vars(3)

# Make a compressed tensor of size 3x3
A = pt.tensor([3,3])
B = pt.tensor([3,3])

# Make a dense vector
C = pt.tensor([3,1], pt.dense)

# Make some assignments
C[1, 0] = 1
B[0, 0] = 1

# We can add C to each row of B as follows:
A[i, j] =  B[i, j] + C[i, j]
```

Taco currently does not support numpy-style broadcasting of singleton dimensions as evidenced by the snippet above. 

# Expressing Transposes

Transposes are not allowed during computations. The user will need to explicitly transpose a tensor themselves using ```pt.tensor.transpose(new_ordering)``` before doing the computation.

# Performing the Computation

Once a tensor algebra computation has been defined (and all of the inputs have been [initialized](tensors#initializing-tensors)), you can simply invoke the output tensor's `evaluate` method to perform the actual computation:

```c++
A.evaluate();  // Perform the computation defined previously for output tensor A
```

Under the hood, when you invoke the `evaluate` method, taco first invokes the output tensor's `compile` method to generate kernels that assembles the output indices (if the tensor contains any sparse dimensions) and that performs the actual computation. taco would then call the two generated kernels by invoking the output tensor's `assemble` and `compute` methods. You can manually invoke these methods instead of calling `evaluate` as demonstrated below:

```c++
A.compile();   // Generate output assembly and compute kernels 
A.assemble();  // Invoke the output assembly kernel to assemble the output indices
A.compute();   // Invoke the compute kernel to perform the actual computation
```

This can be useful if you want to perform the same computation multiple times, in which case it suffices to invoke `compile` once before the first time the computation is performed.

It is also possible to skip using the compiler functions entirely. Once you attempt to modify or view the output tensor, taco will automatically invoke the compiler in order to generate the data. 

