**The Tensor Algebra Compiler**

We provide the solution to the numerous problems presented via a compiler approach. To our knowledge, we present the first compiler technique that can generate kernels for all sparse and dense tensor index notation expressions. The technique generates code entirely from tensor index notation and simple format descriptors can accurately describe the compressed data structures. We do not perform pointer alias or dependency analysis at compile time, nor at runtime.

This technique can be used with libraries such as TensorFlow, Eigen or with languages such as MATLAB, Julia and Simit. This project is also quickly supporting other languages as well.

To see a more thorough discussion of the performance benefits and specific applications read the paper: [PDF](tacopaper.pdf). 

