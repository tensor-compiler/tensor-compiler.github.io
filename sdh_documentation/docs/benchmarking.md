The performance of Python applications that use TACO can be measured using
Python's built-in `time.perf_counter` function with minimal changes to the
applications.  As an example, we can benchmark the performance of the
scientific computing application shown [here](scientific_computing.md) as
follows:

```python
import pytaco as pt
from pytaco import compressed, dense
import numpy as np
import time

csr = pt.format([dense, compressed])
dv  = pt.format([dense])

A = pt.read("pwtk.mtx", csr)
x = pt.from_array(np.random.uniform(size=A.shape[1]))
z = pt.from_array(np.random.uniform(size=A.shape[0]))
y = pt.tensor([A.shape[0]], dv)

i, j = pt.get_index_vars(2)
y[i] = A[i, j] * x[j] + z[i]

# Tell TACO to generate code to perform the SpMV computation
y.compile()

# Benchmark the actual SpMV computation
start = time.perf_counter()
y.compute()
end = time.perf_counter()

print("Execution time: {0} seconds".format(end - start))
```

In order to accurately measure TACO's computational performance, **only the
time it takes to actually perform a computation should be measured.  The time
it takes to generate code under the hood for performing that computation should
not be measured**, since this overhead can be quite variable but can often be
amortized in practice.  By default though, TACO will only generate and compile
code it needs for performing a computation immediately before it has to
actually perform the computation.  As the example above demonstrates, by
manually calling the result tensor's `compile` method, we can tell TACO to
generate code needed for performing the computation before benchmarking starts,
letting us measure only the performance of the computation itself.

!!! warning
    `pytaco.evaluate` and `pytaco.einsum` should not be used to benchmark
    TACO's computational performance, since timing those functions will
    include the time it takes to generate code for performing the computation.

**The time it takes to construct the initial operand tensors should also not be
measured**, since again this overhead can often be amortized in practice.  By
default, `pytaco.read` and functions for converting NumPy arrays and SciPy
matrices to TACO tensors return fully constructed tensors.  If you add nonzero
elements to an operand tensor by invoking its `insert` method though, then
`pack` must also be explicitly invoked before any benchmarking is done:

```python
import pytaco as pt
from pytaco import compressed, dense
import numpy as np
import random
import time

csr = pt.format([dense, compressed])
dv  = pt.format([dense])

A = pt.read("pwtk.mtx", csr)
x = pt.tensor([A.shape[1]], dv)
z = pt.tensor([A.shape[0]], dv)
y = pt.tensor([A.shape[0]], dv)

# Insert random values into x and z and pack them into dense arrays
for k in range(A.shape[1]):
  x.insert([k], random.random())
x.pack()
for k in range(A.shape[0]):
  z.insert([k], random.random())
z.pack()

i, j = pt.get_index_vars(2)
y[i] = A[i, j] * x[j] + z[i]

y.compile()

start = time.perf_counter()
y.compute()
end = time.perf_counter()

print("Execution time: {0} seconds".format(end - start))
```

TACO avoids regenerating code for performing the same computation though as
long as the computation is redefined with the same index variables and with the
same operand and result tensors.  Thus, if your application executes the same
computation many times in a loop and if the computation is executed on
sufficiently large data sets, TACO will naturally amortize the overhead
associated with generating code for performing the computation.  In such 
scenarios, it is acceptable to include the initial code generation overhead 
in the performance measurement:

```python
import pytaco as pt
from pytaco import compressed, dense
import numpy as np
import time

csr = pt.format([dense, compressed])
dv  = pt.format([dense])

A = pt.read("pwtk.mtx", csr)
x = pt.tensor([A.shape[1]], dv)
z = pt.tensor([A.shape[0]], dv)
y = pt.tensor([A.shape[0]], dv)

for k in range(A.shape[1]):
  x.insert([k], random.random())
x.pack()
for k in range(A.shape[0]):
  z.insert([k], random.random())
z.pack()

i, j = pt.get_index_vars(2)

# Benchmark the iterative SpMV computation, including overhead for 
# generating code in the first iteration to perform the computation
start = time.perf_counter()
for k in range(1000):
  y[i] = A[i, j] * x[j] + z[i]
  y.evaluate()
  x[i] = y[i]
  x.evaluate()
end = time.perf_counter()

print("Execution time: {0} seconds".format(end - start))
```

!!! warning
    In order to avoid regenerating code for performing a computation, the
    computation must be redefined with the exact same index variable *objects*
    and also with the exact same tensor objects for operands and result.  In
    the example above, every loop iteration redefines the computation of `y`
    and `x` using the same tensor and index variable objects costructed outside
    the loop, so TACO will only generate code to compute `y` and `x` in the
    first iteration.  If the index variables were constructed inside the loop
    though, TACO would regenerate code to compute `y` and `x` in every loop
    iteration, and the compilation overhead would not be amortized. 

!!! note
    As a rough rule of thumb, if a computation takes on the order of seconds or
    more in total to perform across all invocations with identical operands and
    result (and is always redefined with identical index variables), then it is
    acceptable to include the overhead associated with generating code for
    performing the computation in performance measurements.
