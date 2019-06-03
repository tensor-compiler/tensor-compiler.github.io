# Specifying Tensor Algebra Computations

Tensor algebra computations can be expressed in taco with tensor index notation, which at a high level describes how each element in the output tensor can be computed from elements in the input tensors. As an example, matrix addition can be expressed in index notation as 

```c++
A(i,j) = B(i,j) + C(i,j)
```

where `A`, `B`, and `C` denote order-2 tensors (i.e. matrices) while `i` and `j` are index variables that represent abstract indices into the corresponding dimensions of the tensors. In words, the example above essentially states that, for every `i` and `j`, the element in the `i`-th row and `j`-th column of the `A` should be assigned the sum of the corresponding elements in `B` and `C`. Similarly, element-wise multiplication of three order-3 tensors can be expressed in index notation as follows

```c++
A(i,j,k) = B(i,j,k) * C(i,j,k) * D(i,j,k)
```

The syntax shown above corresponds to exactly what you would have to write in C++ with the taco library to define tensor algebra computations. Note, however, that prior to defining a tensor algebra computation, all index variables have to be declared. This can be done as shown below:

```c++
IndexVar i, j, k;  // Declare index variables for previous example
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

# Delayed Execuation

It is also possible to skip using the compiler functions entirely. Once you attempt to modify or view the output tensor, taco will automatically invoke the compiler in order to generate the data. 

It should be noted that in order to accurately time a computation, it is necessary to invoke the compiler functions directly since relying on the delayed execution mechanism can cause a lot of prior computations to be included in the timing.
