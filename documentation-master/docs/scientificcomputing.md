**The Tensor Algebra Compiler: Scientific Computing**

In the realm of scientific computing, taco can be exceptional. TACO is easy to use, versatile, and efficient so it can handle numerous different kinds of tasks in regards to scientific computing. Because of its high performance, as will be discussed here through an example, it can effectively compute many operations in the best way possible to our knowledge.

### SpMV: Sparse Matrix Vector Multiplication

In the realm of scientific computing, sparse Matrix-Vector multiplication operations occur often. We dive into how taco helps solve this along with a brief performance assessment. A more in-depth discussion about this can be read in our paper.

For taco SpMV is simply multiplying a 2-tensor by a 1-tensor. Thus, the discussion here has not done anything special to optimize for SpMV and simply uses the same tensor algebra code generic tensor algebra code generation through taco.

For code generation it is as easy as putting the following statement into the compiler:

```
taco "a(i) = B(i,j) * c(j)" -f=B:ds
```

If the line above isn't clear, we refer you to read the "Quick Start" section in "Get Setup" of the documentation. Or by entering the command `./build/bin/taco` you can see the options for use when inside the taco directory. The -f flag specifies the matrix format as (dense, sparse). The lower case letters represent the vector and the uppercase represents the matrix. Running the above command on a compiler will automatically generate code that solves SpMV.

The output below should appear from running the command above:
```
void compute(Tensor a, Tensor B, Tensor c) {
  // a(i) = (B(i, +j)) + (c(+j))
  a1_ptr = 0;
  // --------------------------------- i ----------------------------------
  for (int i = 0; i < 3; i += 1) {
    B1_ptr = ((0 * 3) + i);
    a1_ptr = ((0 * 3) + i);
    // --------------------------------- +j ---------------------------------
    tj = 0;
    for (int B2_ptr = B.d2.ptr[B1_ptr]; B2_ptr < B.d2.ptr[(B1_ptr + 1)]; B2_ptr += 1) {
      j = B.d2.idx[B2_ptr];
      c1_ptr = ((0 * 3) + j);
      tj = (tj + (B.vals[B2_ptr] + c.vals[c1_ptr]));
      a.vals[a1_ptr] = (a.vals[a1_ptr] + (B.vals[B2_ptr] + c.vals[c1_ptr]));
    }
    // -------------------------------- /+j ---------------------------------
    // a.vals[a1_ptr] = (B.vals[B2_ptr] + c.vals[c1_ptr]);
  }
  // --------------------------------- /i ---------------------------------
}
```

We can also do this in C++. To see how this would be done we can follow the "Mechanics" guide to see how the command-line and C++ tools relate.

### Note on Performance

taco does very well compared to the current best alternatives. This is described in much greater detail in the prepare in Section 8, Evaluation. The graph below sums up the findings. Essentially, we see that taco generates code that is competitive with the current best hand-made libraries, despite taco not having yet implemented sophisticated optimizations for parallelism and vectorization.

![spmv](/img/spmv_image.png)
