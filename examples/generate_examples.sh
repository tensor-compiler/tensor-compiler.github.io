#!/bin/bash

taco "y(i)=A(i,j)*x(j)" -f=y:d:0 -f=A:ds:0,1 -f=x:d:0 -write-source=spmv_full.c -write-compute=spmv_compute.c -write-assembly=spmv_assembly.c
taco "A(i,j)=B(i,j)+C(i,j)" -f=A:ds:0,1 -f=B:ds:0,1 -f=C:ds:0,1 -write-source=add_full.c -write-compute=add_compute.c -write-assembly=add_assembly.c
taco "A(i,j)=B(i,j,k)*c(k)" -f=A:ss:0,1 -f=B:sss:0,1,2 -f=c:d:0 -write-source=ttv_full.c -write-compute=ttv_compute.c -write-assembly=ttv_assembly.c
taco "A(i,j)=B(i,k,l)*C(k,j)*D(l,j)" -f=A:dd:0,1 -f=B:sss:0,1,2 -f=C:dd:0,1 -f=D:dd:0,1 -write-source=mttkrp_full.c -write-compute=mttkrp_compute.c -write-assembly=mttkrp_assembly.c
