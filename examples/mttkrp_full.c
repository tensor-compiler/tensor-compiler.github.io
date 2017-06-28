// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
// taco "A(i,j)=B(i,k,l)*C(k,j)*D(l,j)" -f=A:dd:0,1 -f=B:sss:0,1,2 -f=C:dd:0,1 -f=D:dd:0,1 -write-source=mttkrp_full.c -write-compute=mttkrp_compute.c -write-assembly=mttkrp_assembly.c
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
  int A0_size = *(int*)(A->indices[0][0]);
  int A1_size = *(int*)(A->indices[1][0]);
  double* restrict A_val_arr = (double*)(A->vals);

  A_val_arr = (double*)malloc(sizeof(double) * (A0_size * A1_size));

  A->vals = (uint8_t*)A_val_arr;
  return 0;
}

int compute(taco_tensor_t *A, taco_tensor_t *B, taco_tensor_t *C, taco_tensor_t *D) {
  int A0_size = *(int*)(A->indices[0][0]);
  int A1_size = *(int*)(A->indices[1][0]);
  double* restrict A_val_arr = (double*)(A->vals);
  int* restrict B0_pos_arr = (int*)(B->indices[0][0]);
  int* restrict B0_idx_arr = (int*)(B->indices[0][1]);
  int* restrict B1_pos_arr = (int*)(B->indices[1][0]);
  int* restrict B1_idx_arr = (int*)(B->indices[1][1]);
  int* restrict B2_pos_arr = (int*)(B->indices[2][0]);
  int* restrict B2_idx_arr = (int*)(B->indices[2][1]);
  double* restrict B_val_arr = (double*)(B->vals);
  int C0_size = *(int*)(C->indices[0][0]);
  int C1_size = *(int*)(C->indices[1][0]);
  double* restrict C_val_arr = (double*)(C->vals);
  int D0_size = *(int*)(D->indices[0][0]);
  int D1_size = *(int*)(D->indices[1][0]);
  double* restrict D_val_arr = (double*)(D->vals);

  #pragma omp parallel for
  for (int B0_pos = B0_pos_arr[0]; B0_pos < B0_pos_arr[1]; B0_pos++) {
    int32_t iB = B0_idx_arr[B0_pos];
    for (int B1_pos = B1_pos_arr[B0_pos]; B1_pos < B1_pos_arr[B0_pos + 1]; B1_pos++) {
      int32_t kB = B1_idx_arr[B1_pos];
      for (int B2_pos = B2_pos_arr[B1_pos]; B2_pos < B2_pos_arr[B1_pos + 1]; B2_pos++) {
        int32_t lB = B2_idx_arr[B2_pos];
        double tl = B_val_arr[B2_pos];
        for (int jC = 0; jC < C1_size; jC++) {
          int32_t C1_pos = (kB * C1_size) + jC;
          int32_t D1_pos = (lB * D1_size) + jC;
          int32_t A1_pos = (iB * A1_size) + jC;
          A_val_arr[A1_pos] = A_val_arr[A1_pos] + ((tl * C_val_arr[C1_pos]) * D_val_arr[D1_pos]);
        }
      }
    }
  }

  return 0;
}
