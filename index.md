---
layout: post
title: The Tensor Algebra Compiler (taco)
---
The Tensor Algebra Compiler (taco)
==================================

The Tensor Algebra Compiler (taco) is a library for compiling dense and sparse linear and tensor algebra expressions. The expressions can range from simple kernels 
like SpMV to more complex kernels like MTTKRP, where the operands can be dense, sparse or a mix of dense and sparse. taco automatically generates efficient compute kernels (loops) to evaluate these expressions and several of these kernels have been shown to match the performance of widely used hand-optimized library implementations, while simultaneously supporting a much larger set of expressions and tensor/matrix formats.

To learn more about taco and how it works, check out our [MIT CSAIL Technical 
Report](http://people.csail.mit.edu/fred/tensor-compiler-techreport.html).

We are working towards an open-source release of taco in March/April of 2017 under an MIT license. If you want to be kept up to date and notified when taco is released then make sure to subscribe to the 'tensor-compiler@lists.csail.mit.edu' email list (make sure to accept when you get an acknowledgement email):
<form action="https://lists.csail.mit.edu/mailman/subscribe/tensor-compiler" method="POST">
E-mail: <input name="email" /><input type="submit" value="Sign me up" />
</form>

