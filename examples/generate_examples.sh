#!/bin/bash

taco "y(i)=A(i,j)*x(j)" -f=y:d:0 -f=A:ds:0,1 -f=x:d:0 -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c spmv_full.c
mv taco_compute.c spmv_compute.c
mv taco_assembly.c spmv_assembly.c

taco "A(i,j)=B(i,j)+C(i,j)" -f=A:ds:0,1 -f=B:ds:0,1 -f=C:ds:0,1 -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c add_full.c
mv taco_compute.c add_compute.c
mv taco_assembly.c add_assembly.c

taco "A(i,j)=B(i,j,k)*c(k)" -f=A:ss:0,1 -f=B:sss:0,1,2 -f=c:d:0 -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c ttv_full.c
mv taco_compute.c ttv_compute.c
mv taco_assembly.c ttv_assembly.c

taco "A(i,j)=B(i,k,l)*C(k,j)*D(l,j)" -f=A:dd:0,1 -f=B:sss:0,1,2 -f=C:dd:0,1 -f=D:dd:0,1 -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c mttkrp_full.c
mv taco_compute.c mttkrp_compute.c
mv taco_assembly.c mttkrp_assembly.c
