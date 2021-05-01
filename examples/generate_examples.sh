#!/bin/bash

taco "y(i)=A(i,j)*x(j)" -f=y:d:0 -f=A:ds:0,1 -f=x:d:0 -s="split(i,i0,i1,32)" -s="reorder(i0,i1,j)" -s="parallelize(i0,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c spmv_full.c
mv taco_compute.c spmv_compute.c
mv taco_assembly.c spmv_assembly.c

taco "A(i,j)=B(i,k)*C(k,j)" -f=A:ds:0,1 -f=B:ds:0,1 -f=C:ds:0,1 -s="reorder(i,k,j)" -s="precompute(B(i,k)*C(k,j),j,j)" -s="assemble(A,Insert)" -s="parallelize(i,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c spgemm_full.c
mv taco_compute.c spgemm_compute.c
mv taco_assembly.c spgemm_assembly.c

taco "A(i,j)=B(i,j)+C(i,j)" -f=A:ds:0,1 -f=B:ds:0,1 -f=C:ds:0,1 -s="assemble(A,Insert)" -s="parallelize(i,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c spadd_full.c
mv taco_compute.c spadd_compute.c
mv taco_assembly.c spadd_assembly.c

taco "A(i,j)=B(i,j,k)*c(k)" -f=A:ss:0,1 -f=B:sss:0,1,2 -f=c:d:0 -s="fuse(i,j,f)" -s="pos(f,fpos,B)" -s="split(fpos,chunk,fpos2,8)" -s="reorder(chunk,fpos2,k)" -s="parallelize(chunk,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c ttv_full.c
mv taco_compute.c ttv_compute.c
mv taco_assembly.c ttv_assembly.c

taco "A(i,j)=B(i,k,l)*D(l,j)*C(k,j)" -f=A:dd:0,1 -f=B:sss:0,1,2 -f=D:dd:0,1 -f=C:dd:0,1 -s="reorder(i,k,l,j)" -s="precompute(B(i,k,l)*D(l,j),j,j)" -s="split(i,i0,i1,32)" -s="parallelize(i0,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
mv taco_kernel.c mttkrp_full.c
mv taco_compute.c mttkrp_compute.c
mv taco_assembly.c mttkrp_assembly.c
