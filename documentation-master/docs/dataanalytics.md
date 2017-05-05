**The Tensor Algebra Compiler: Data Analytics**

Data analytics has grown immensely. Now, more than ever, is it necessary to be able to manipulate data at the fastest pace possible. taco makes great efforts to ensuring this as well as being both easy to use and versatile at the same time. We go through a potential real world application in data science through an example of using taco for MTTKRP, a sparse 3-order tensor algebra kernel.

### MTTKRP: Sparse 3-Order Tensor Algebra Kernel

![mttkrp](/img/mttkrp_image.png)

The above image explains the basic mathematical operation for MTTKRP. However, it does not take sparsity into account.

Let's say each dimension in matrix B were sparse. In that case, to generate code all we would need to do is the following:

```
taco "A(i,l) = B(i,j,k) * C(j,l) * D(k,l)" -f=B:sss  
```

If the line above isn't clear, we refer you to read the "Quick Start" section in "Get Setup" of the documentation. Or by entering the command `./build/bin/taco` you can see the options for use when inside the taco directory. The -f flag specifies the matrix format as (dense, sparse). The lower case letters represent the vector and the uppercase represents the matrix. Running the above command on a compiler will automatically generate code that solves MTTKRP.

The output below should appear from running the command above:
```
void compute(Tensor A, Tensor B, Tensor C, Tensor D) {
  // A(i, l) = ((B(i, +j, +k)) * (C(+j, l))) * (D(+k, l))
  A1_ptr = 0;
  A2_ptr = 0;
  // --------------------------------- i ----------------------------------
  for (int B1_ptr = B.d1.ptr[0]; B1_ptr < B.d1.ptr[(0 + 1)]; B1_ptr += 1) {
    i = B.d1.idx[B1_ptr];
    A1_ptr = ((0 * 3) + i);
    // --------------------------------- +j ---------------------------------
    for (int B2_ptr = B.d2.ptr[B1_ptr]; B2_ptr < B.d2.ptr[(B1_ptr + 1)]; B2_ptr += 1) {
      j = B.d2.idx[B2_ptr];
      C1_ptr = ((0 * 3) + j);
      // --------------------------------- +k ---------------------------------
      for (int B3_ptr = B.d3.ptr[B2_ptr]; B3_ptr < B.d3.ptr[(B2_ptr + 1)]; B3_ptr += 1) {
        k = B.d3.idx[B3_ptr];
        D1_ptr = ((0 * 3) + k);
        t23 = B.vals[B3_ptr];
        // --------------------------------- l ----------------------------------
        for (int l = 0; l < 3; l += 1) {
          C2_ptr = ((C1_ptr * 3) + l);
          D2_ptr = ((D1_ptr * 3) + l);
          A2_ptr = ((A1_ptr * 3) + l);
          // A.vals[A2_ptr] = (A.vals[A2_ptr] + ((t23 * C.vals[C2_ptr]) * D.vals[D2_ptr]));
          A.vals[A2_ptr] = (A.vals[A2_ptr] + ((t23 * C.vals[C2_ptr]) * D.vals[D2_ptr]));
        }
        // --------------------------------- /l ---------------------------------
      }
      // -------------------------------- /+k ---------------------------------
    }
    // -------------------------------- /+j ---------------------------------
  }
  // --------------------------------- /i ---------------------------------
}
```

We can also do this in C++. To see how this would be done we can follow the "Mechanics" guide to see how the command-line and C++ tools relate.

### Note on Performance

taco does very well with MTTKRP performance. Out of the 7 other tested sparse tensor algebra kernels, taco had the best execution time. More on this can be found in our paper.
