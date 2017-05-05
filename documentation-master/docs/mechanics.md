**Mechanics**

In this section we will go through basic functionality that taco provides. We recommend you to both "taco Usage" and "Read the Paper" for more complex usage. We go through this by using the basic example from the previous section: Tensor Times Vector. Recall that we receive a Matrix A from multiplying a sparse or dense matrix B with a vector c.

### Command-Line Use

We can generate code by simply entering the following into the command line after going into the taco directory from the taco repository in GitHub:

```
cd <taco-directory>
./build/bin/taco
taco "A(i,j) = B(i,j,k) * c(k)" -f=A:ds -f=B:sss -f=c:s         
```

The option -f is used to specify the format. Here we have that B is (dense, sparse). Note that neither a nor c are defined. This is because the -f option will automatically assume that anything that is not specified is dense. There are several more options that can be seen and all of them will be listed after entering `./build/bin/taco`. Or you can see them in the "Quick Start" page of the documentation.  


After pressing enter, the following code will be generated:

```
void compute(Tensor A, Tensor B, Tensor c) {
  // A(i, j) = (B(i, j, +k)) * (c(+k))
  A1_ptr = 0;
  A2_ptr = A.d2.ptr[A1_ptr];
  // --------------------------------- i ----------------------------------
  for (int B1_ptr = B.d1.ptr[0]; B1_ptr < B.d1.ptr[(0 + 1)]; B1_ptr += 1) {
    i = B.d1.idx[B1_ptr];
    A1_ptr = ((0 * 3) + i);
    // --------------------------------- j ----------------------------------
    for (int B2_ptr = B.d2.ptr[B1_ptr]; B2_ptr < B.d2.ptr[(B1_ptr + 1)]; B2_ptr += 1) {
      j = B.d2.idx[B2_ptr];
      // --------------------------------- +k ---------------------------------
      B3_ptr = B.d3.ptr[B2_ptr];
      c1_ptr = c.d1.ptr[0];
      tk = 0;
      while ((B3_ptr < B.d3.ptr[(B2_ptr + 1)]) && (c1_ptr < c.d1.ptr[(0 + 1)])) {
        kB = B.d3.idx[B3_ptr];
        kc = c.d1.idx[c1_ptr];
        k = min(kB, kc);
        if ((kB == k) && (kc == k)) {
          tk = (tk + (B.vals[B3_ptr] * c.vals[c1_ptr]));
          A.vals[A2_ptr] = (A.vals[A2_ptr] + (B.vals[B3_ptr] * c.vals[c1_ptr]));
        }
        if (kB == k)
          B3_ptr = (B3_ptr + 1);
        if (kc == k)
          c1_ptr = (c1_ptr + 1);
      }
      // -------------------------------- /+k ---------------------------------
      // A.vals[A2_ptr] = (B.vals[B3_ptr] * c.vals[c1_ptr]);
      A2_ptr = (A2_ptr + 1);
    }
    // --------------------------------- /j ---------------------------------
  }
  // --------------------------------- /i ---------------------------------
}
```

### C++ Usage

taco is very easy to use in C++ as well. we will go through some code along with explanations in this section. We will = be doing: `A(i,j) = B(i,j,k) * c(k)`, as shown above, but in C++.

```
#include <iostream>
#include "taco.h"

using namespace taco;
```

The above is sufficient for the header, keeping in mind to include the taco.h file.

*Creating Formats*

Similar to how the -f option specifies the tensor type, we will want to do the same in the C++ program. Note that taco can support many different formatting options such as csr, csf, sv etc. We can start by specifying types as shown below:

```
// Create formats
Format csr({Dense,Sparse}); #A
Format csf({Sparse,Sparse,Sparse}); #B
Format  sv({Sparse}); #c
```

*Creating Tensors*

Now that we have specified the types of each tensor, we will go ahead and create them. The numbers in the bracket indicate the dimensions. This initialization is done by the following:

```
// Create formats
Tensor<double> A({2,3},   csr);
Tensor<double> B({2,3,4}, csf);
Tensor<double> c({4},     sv);
```

 *Insertion*

 We can start adding to the tensors now as shown below:

 ```
 // Insert data into B and c
 B.insert({0,0,0}, 1.0);
 B.insert({1,2,0}, 2.0);
 B.insert({1,3,1}, 3.0);
 c.insert(0, 4.0);
 c.insert(1, 5.0);
 ```

*Packing*

Note that at this point we have created formats and we have separately created tensors with elements inserted inside of it. We have not, however, combined the two. This is where packing comes in. With just a simple call to the pack() function we can put in data with the desired formats.

```
// Pack data as described by the formats
B.pack();
c.pack();
```

*Forming an Expression*

First we declare variables. After that, it is very similar to the compiler approach:

```
// Form a tensor-vector multiplication expression
Var i, j, k(Var::Sum);
A(i,j) = B(i,j,k) * c(k);
```

*Compiling, Assembling and Computing*

We can compile the expression by simply calling compile(). Calling compile prompts taco to generate kernels that assemble index structures and compute. Afterwards we want to assemble A's indices and numerically compute the results in A. Both assembly and computing take one call and this process can be done in the following three lines:

```
// Assemble A's indices and numerically compute the result
A.assemble();
A.compute();
```

And we have finished the computation of the tensor-vector multiplication.

Note:The entire code of this example is given in the taco repository under the apps folder.
