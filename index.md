---
layout: post
title: taco - the Tensor Algebra Compiler
---
taco - the Tensor Algebra Compiler
=============================================

The Tensor Algebra Compiler (taco for short) is a framework that can take 
arbitrary linear or tensor algebra expressions - ranging from simpler kernels 
like SpMV to more complex kernels like MTTKRP - and automatically generate 
efficient loops that evaluate those expressions with arbitrary combinations of 
dense or sparse vectors, matrices, and tensors as inputs and output. taco is 
able to match the performance of many widely used high-performance sparse linear 
algebra libraries and sparse tensor frameworks, while simultaneously supporting 
a much larger range of kernels and tensor/matrix formats.

To learn more about taco and how it works, check out our [tech 
report](http://people.csail.mit.edu/fred/tensor-compiler-techreport.html).

If you would like to receive updates about the project and be notified as soon 
as taco is open sourced, make sure to subscribe to the `tensor-compiler` mailing 
list:
<form action="https://lists.csail.mit.edu/mailman/subscribe/tensor-compiler" method="POST">
E-mail: <input name="email" /><input type="submit" value="Sign me up" />
</form>

