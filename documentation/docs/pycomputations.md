# Specifying Tensor Algebra Computations

[Tensor notation](tensors#Computing-on-Tensors) is described in detail in the description of the C++ library. Here, we focus on the syntax for python.

The syntax is very similar to C++ except that we use square brackets ```[]``` to access tensors instead of parenthesis. For instance, to express [matrix addition](tensors#Computing-on-Tensors) in Python, we simply need to write:

```python
A[i, j] = B[i, j] + C[i, j]
```

where `A`, `B`, and `C` denote order-2 tensors (i.e. matrices) while `i` and `j` are index variables that represent abstract indices into the corresponding dimensions of the tensors as in the C++ API.

It is important to note that due to the complications that arise from assembling sparse structures, we cannot have a tensor appear both on the left hand side and the right hand side of an expression.

# IndexVars

As in the C++ API, index vars are needed to form index expressions. Tensors can be accessed with either a ```pytaco.indexVar``` to express computations or integers to read or write to a location in a tensor. So for instance, before specifying the above we could write:

```python
import pytaco as pt

# First method to make index vars
i, j = pt.indexVar(), pt.indexVar()
```

We can also give names to indexVars as shown below:
```python
import pytaco as pt

# Named indexVars
i, j = pt.indexVar("i"), pt.indexVar("j")
```

To make this less cumbersome, we also provide a function ```pytaco.get_index_vars``` to generate a list of n different index vars that can be used in tensor expressions.
```python
import pytaco as pt
i, j = pt.get_index_vars(2)
```

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

# Broadcasting

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

# Functional-style Interface

Taco supports einsum notation through the interface ```pytaco.einsum``` along with its own default parser available through ```pytaco.parser```.

The [einsum](https://rockt.github.io/2018/04/30/einsum) function takes an einsum string as input along with a variable number of tensors. The einsum interface follows the following format:

```pytaco.einsum(subscripts, *operands, out_format, dtype=float)```

The ```pytaco.parser``` string follows syntax exactly like the [C++ API index notation](tensors#Computing-on-Tensors). Notice that this differs from the python notation in that parenthesis are used instead of square brackets and we do not need to index scalars. The parser has the following spec:

```pytaco.parser(string, *operands, out_format, dtype=float)```

In addition, we also allow the following convenience functions:

General element-wise functions:

```pt.add(a, b, out_format=pt.compressed, dtype=pt.float32)```

```pt.sub(a, b, out_format=pt.compressed, dtype=pt.float32)```

```pt.mul(a, b, out_format=pt.compressed, dtype=pt.float32)```

```pt.div(a, b, out_format=pt.compressed, dtype=pt.float32)```

```pt.floordiv(a, b, out_format=pt.compressed, dtype=pt.float32)```

Matrix multiply for order-2 tensors:

```pt.matmul(a, b, out_format=pt.compressed, dtype=pt.float32)```

Reduction functions for tensors along given axes. One can specify the axis they would like to reduce across or a list of axes to reduce:

```pt.reduce_sum(a, axis=None, out_format=pt.dense, dtype=pt.float32)```

```pt.reduce_mul(a, axis=None, out_format=pt.dense, dtype=pt.float32)```

Examples:
```python
import pytaco as pt
i, j, k = pt.get_index_vars(3)

# Make a compressed tensor of size 3x3
A = pt.tensor([3,3])
B = pt.tensor([3,3])

# Make some assignments
A[0, 0] = 9
A[1, 0] = 1
A[2, 0] = 2
B[0, 0] = 1

# Element-wise addition
C = pt.add(A, B)

# Element-wise multiplication
D = pt.mul(A, B)

# Matrix-multiplication
E = pt.matmul(A, B)

# Sum over all elements in A
F = pt.reduce_sum(A)

# Sum the columns of A
G = pt.reduce_sum(A, axis=1)
```

Numpy arrays can also be passed where tensors are expected in the functional interface.

# Limitations

For all forms of index expressions, we do not support indexing a tensor with the same index variable. For example expressions such as ```A[i,i]``` are disallowed.

Transposes are not allowed during computations. The user will need to explicitly transpose a tensor themselves using ```pt.tensor.transpose(new_ordering)``` before doing the computation.






