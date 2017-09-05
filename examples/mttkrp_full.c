// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
// taco "A(i,j)=B(i,k,l)*C(k,j)*D(l,j)" -f=A:dd:0,1 -f=B:sss:0,1,2 -f=C:dd:0,1 -f=D:dd:0,1 -write-source=taco_kernel.c -write-compute=taco_compute.c -write-assembly=taco_assembly.c
#ifndef TACO_C_HEADERS
#define TACO_C_HEADERS
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>
#define TACO_MIN(_a,_b) ((_a) < (_b) ? (_a) : (_b))
#ifndef TACO_TENSOR_T_DEFINED
#define TACO_TENSOR_T_DEFINED
typedef enum { taco_dim_dense, taco_dim_sparse } taco_dim_t;
typedef struct {
  int32_t     order;      // tensor order (number of dimensions)
  int32_t*    dims;       // tensor dimensions
  taco_dim_t* dim_types;  // dimension storage types
  int32_t     csize;      // component size
  int32_t*    dim_order;  // dimension storage order
  uint8_t***  indices;    // tensor index data (per dimension)
  uint8_t*    vals;       // tensor values
} taco_tensor_t;
#endif
#endif

int assemble(taco_tensor_t *A, taco_tensor_t *B, taco_tensor_t *C, taco_tensor_t *D) {
  int A1_size = *(int*)(A->indices[0][0]);
  int A2_size = *(int*)(A->indices[1][0]);
  double* restrict A_vals = (double*)(A->vals);

  A_vals = (double*)malloc(sizeof(double) * (A1_size * A2_size));

  A->vals = (uint8_t*)A_vals;
  return 0;
}

int compute(taco_tensor_t *A, taco_tensor_t *B, taco_tensor_t *C, taco_tensor_t *D) {
  int A1_size = *(int*)(A->indices[0][0]);
  int A2_size = *(int*)(A->indices[1][0]);
  double* restrict A_vals = (double*)(A->vals);
  int* restrict B1_pos = (int*)(B->indices[0][0]);
  int* restrict B1_idx = (int*)(B->indices[0][1]);
  int* restrict B2_pos = (int*)(B->indices[1][0]);
  int* restrict B2_idx = (int*)(B->indices[1][1]);
  int* restrict B3_pos = (int*)(B->indices[2][0]);
  int* restrict B3_idx = (int*)(B->indices[2][1]);
  double* restrict B_vals = (double*)(B->vals);
  int C1_size = *(int*)(C->indices[0][0]);
  int C2_size = *(int*)(C->indices[1][0]);
  double* restrict C_vals = (double*)(C->vals);
  int D1_size = *(int*)(D->indices[0][0]);
  int D2_size = *(int*)(D->indices[1][0]);
  double* restrict D_vals = (double*)(D->vals);

  for (int32_t pA = 0; pA < (A1_size * A2_size); pA++) {
    A_vals[pA] = 0;
  }
  #pragma omp parallel for schedule(dynamic, 16)
  for (int32_t pB1 = B1_pos[0]; pB1 < B1_pos[1]; pB1++) {
    int32_t iB = B1_idx[pB1];
    for (int32_t pB2 = B2_pos[pB1]; pB2 < B2_pos[pB1 + 1]; pB2++) {
      int32_t kB = B2_idx[pB2];
      for (int32_t pB3 = B3_pos[pB2]; pB3 < B3_pos[pB2 + 1]; pB3++) {
        int32_t lB = B3_idx[pB3];
        double tl = B_vals[pB3];
        for (int32_t jC = 0; jC < C2_size; jC++) {
          int32_t pC2 = (kB * C2_size) + jC;
          int32_t pD2 = (lB * D2_size) + jC;
          int32_t pA2 = (iB * A2_size) + jC;
          A_vals[pA2] = A_vals[pA2] + ((tl * C_vals[pC2]) * D_vals[pD2]);
        }
      }
    }
  }

  return 0;
}
