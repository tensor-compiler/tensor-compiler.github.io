// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
// taco "y(i)=A(i,j)*x(j)" -f=y:d:0 -f=A:ds:0,1 -f=x:d:0 -s="split(i,i0,i1,32)" -s="reorder(i0,i1,j)" -s="parallelize(i0,CPUThread,NoRaces)" -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c

int compute(taco_tensor_t *y, taco_tensor_t *A, taco_tensor_t *x) {
  int y1_dimension = (int)(y->dimensions[0]);
  double* restrict y_vals = (double*)(y->vals);
  int A1_dimension = (int)(A->dimensions[0]);
  int* restrict A2_pos = (int*)(A->indices[1][0]);
  int* restrict A2_crd = (int*)(A->indices[1][1]);
  double* restrict A_vals = (double*)(A->vals);
  int x1_dimension = (int)(x->dimensions[0]);
  double* restrict x_vals = (double*)(x->vals);

  #pragma omp parallel for schedule(runtime)
  for (int32_t i0 = 0; i0 < ((A1_dimension + 31) / 32); i0++) {
    for (int32_t i1 = 0; i1 < 32; i1++) {
      int32_t i = i0 * 32 + i1;
      if (i >= A1_dimension)
        continue;

      double tjy_val = 0.0;
      for (int32_t jA = A2_pos[i]; jA < A2_pos[(i + 1)]; jA++) {
        int32_t j = A2_crd[jA];
        tjy_val += A_vals[jA] * x_vals[j];
      }
      y_vals[i] = tjy_val;
    }
  }
  return 0;
}
