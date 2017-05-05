**The Tensor Algebra Compiler: Machine Learning**

Machine learning has erupted over the past couple of decades. Because of the necessity for a efficiency, versatility, and simplistic way to deal with large amounts of data, taco is crucial for anyone who deals with tensor operations in the machine learning world. Here, we will look at taco and how it is used in a real-world application: SDDMM.  

### SDDMM: Sparse Dense Dense Matrix Multiplication

This specific type of operation is often used for data in machine learning. It is also not heavily supported; only Eigen and taco can compute SDDMM. taco has shown to have better performance. This is elaborated below in the performance section.

SDDMM is formatted as follows: A = B o CD, where B is sparse and C and D are both dense.

For code generation it is as easy as putting the following statement into the compiler:

```
taco "A(i,j) = B(i,j) + C(i,j)*D(i,j)" -f=B:ss
```

If the line above isn't clear, we refer you to read the "Quick Start" section in "Get Setup" of the documentation. Or by entering the command `./build/bin/taco` you can see the options for use when inside the taco directory. The -f flag specifies the matrix format as (dense, sparse). The lower case letters represent the vector and the uppercase represents the matrix. Running the above command on a compiler will automatically generate code that solves SDDMM.

The output below should appear from running the command above:
```
void compute(Tensor A, Tensor B, Tensor C, Tensor D) {
  // A(i, j) = (B(i, j)) + ((C(i, j)) * (D(i, j)))
  A1_ptr = 0;
  A2_ptr = 0;
  // --------------------------------- i ----------------------------------
  for (int B1_ptr = B.d1.ptr[0]; B1_ptr < B.d1.ptr[(0 + 1)]; B1_ptr += 1) {
    i = B.d1.idx[B1_ptr];
    C1_ptr = ((0 * 3) + i);
    D1_ptr = ((0 * 3) + i);
    A1_ptr = ((0 * 3) + i);
    // --------------------------------- j ----------------------------------
    for (int B2_ptr = B.d2.ptr[B1_ptr]; B2_ptr < B.d2.ptr[(B1_ptr + 1)]; B2_ptr += 1) {
      j = B.d2.idx[B2_ptr];
      C2_ptr = ((C1_ptr * 3) + j);
      D2_ptr = ((D1_ptr * 3) + j);
      A2_ptr = ((A1_ptr * 3) + j);
      // A.vals[A2_ptr] = (B.vals[B2_ptr] + (C.vals[C2_ptr] * D.vals[D2_ptr]));
      A.vals[A2_ptr] = (A.vals[A2_ptr] + (B.vals[B2_ptr] + (C.vals[C2_ptr] * D.vals[D2_ptr])));
    }
    // --------------------------------- /j ---------------------------------
  }
  // --------------------------------- /i ---------------------------------
}
```

We can also do this in C++. To see how this would be done we can follow the "Mechanics" guide to see how the command-line and C++ tools relate.

### Note on Performance

taco does very well with SDDMM performance. Currently, to our knowledge, only Eigen has support for such an operation. taco greatly exceeds it and the graph of the performance comparison can be seen below.

![sddmm](/img/sddmm_image.png)
