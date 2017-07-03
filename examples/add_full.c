// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
// taco "A(i,j)=B(i,j)+C(i,j)" -f=A:ds:0,1 -f=B:ds:0,1 -f=C:ds:0,1 -write-source=add_full.c -write-compute=add_compute.c -write-assembly=add_assembly.c
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

int assemble(taco_tensor_t *A, taco_tensor_t *B, taco_tensor_t *C) {
  int A0_size = *(int*)(A->indices[0][0]);
  int* restrict A1_pos_arr = (int*)(A->indices[1][0]);
  int* restrict A1_idx_arr = (int*)(A->indices[1][1]);
  double* restrict A_val_arr = (double*)(A->vals);
  int B0_size = *(int*)(B->indices[0][0]);
  int* restrict B1_pos_arr = (int*)(B->indices[1][0]);
  int* restrict B1_idx_arr = (int*)(B->indices[1][1]);
  int C0_size = *(int*)(C->indices[0][0]);
  int* restrict C1_pos_arr = (int*)(C->indices[1][0]);
  int* restrict C1_idx_arr = (int*)(C->indices[1][1]);

  /* init_alloc_size should be initialized to a power of two */
  int32_t init_alloc_size = 1048576;
  A1_pos_arr = (int*)malloc(sizeof(int) * init_alloc_size);
  A1_idx_arr = (int*)malloc(sizeof(int) * init_alloc_size);
  A1_pos_arr[0] = 0;

  int32_t A0_pos = 0;
  int32_t A1_pos = A1_pos_arr[A0_pos];
  for (int iB = 0; iB < B0_size; iB++) {
    int32_t B1_pos = B1_pos_arr[iB];
    int32_t C1_pos = C1_pos_arr[iB];
    while ((B1_pos < B1_pos_arr[iB + 1]) && (C1_pos < C1_pos_arr[iB + 1])) {
      int32_t jB = B1_idx_arr[B1_pos];
      int32_t jC = C1_idx_arr[C1_pos];
      int32_t j = TACO_MIN(jB,jC);
      if ((jB == j) && (jC == j)) {
        A1_idx_arr[A1_pos] = j;
        A1_pos++;
        if ((0 == ((A1_pos + 1) & A1_pos)) && (init_alloc_size <= (A1_pos + 1)))
          A1_idx_arr = (int*)realloc(A1_idx_arr, sizeof(int) * (2 * (A1_pos + 1)));
      }
      else if (jB == j) {
        A1_idx_arr[A1_pos] = j;
        A1_pos++;
        if ((0 == ((A1_pos + 1) & A1_pos)) && (init_alloc_size <= (A1_pos + 1)))
          A1_idx_arr = (int*)realloc(A1_idx_arr, sizeof(int) * (2 * (A1_pos + 1)));
      }
      else {
        A1_idx_arr[A1_pos] = j;
        A1_pos++;
        if ((0 == ((A1_pos + 1) & A1_pos)) && (init_alloc_size <= (A1_pos + 1)))
          A1_idx_arr = (int*)realloc(A1_idx_arr, sizeof(int) * (2 * (A1_pos + 1)));
      }
      if (jB == j) B1_pos++;
      if (jC == j) C1_pos++;
    }
    while (B1_pos < B1_pos_arr[iB + 1]) {
      int32_t jB = B1_idx_arr[B1_pos];
      A1_idx_arr[A1_pos] = jB;
      A1_pos++;
      if ((0 == ((A1_pos + 1) & A1_pos)) && (init_alloc_size <= (A1_pos + 1)))
        A1_idx_arr = (int*)realloc(A1_idx_arr, sizeof(int) * (2 * (A1_pos + 1)));
      B1_pos++;
    }
    while (C1_pos < C1_pos_arr[iB + 1]) {
      int32_t jC = C1_idx_arr[C1_pos];
      A1_idx_arr[A1_pos] = jC;
      A1_pos++;
      if ((0 == ((A1_pos + 1) & A1_pos)) && (init_alloc_size <= (A1_pos + 1)))
        A1_idx_arr = (int*)realloc(A1_idx_arr, sizeof(int) * (2 * (A1_pos + 1)));
      C1_pos++;
    }
    A1_pos_arr[(iB + 1)] = A1_pos;
  }

  A_val_arr = (double*)malloc(sizeof(double) * A1_pos);

  A->indices[1][0] = (uint8_t*)(A1_pos_arr);
  A->indices[1][1] = (uint8_t*)(A1_idx_arr);
  A->vals = (uint8_t*)A_val_arr;
  return 0;
}

int compute(taco_tensor_t *A, taco_tensor_t *B, taco_tensor_t *C) {
  int A0_size = *(int*)(A->indices[0][0]);
  int* restrict A1_pos_arr = (int*)(A->indices[1][0]);
  double* restrict A_val_arr = (double*)(A->vals);
  int B0_size = *(int*)(B->indices[0][0]);
  int* restrict B1_pos_arr = (int*)(B->indices[1][0]);
  int* restrict B1_idx_arr = (int*)(B->indices[1][1]);
  double* restrict B_val_arr = (double*)(B->vals);
  int C0_size = *(int*)(C->indices[0][0]);
  int* restrict C1_pos_arr = (int*)(C->indices[1][0]);
  int* restrict C1_idx_arr = (int*)(C->indices[1][1]);
  double* restrict C_val_arr = (double*)(C->vals);

  int32_t A0_pos = 0;
  int32_t A1_pos = A1_pos_arr[A0_pos];
  for (int iB = 0; iB < B0_size; iB++) {
    int32_t B1_pos = B1_pos_arr[iB];
    int32_t C1_pos = C1_pos_arr[iB];
    while ((B1_pos < B1_pos_arr[iB + 1]) && (C1_pos < C1_pos_arr[iB + 1])) {
      int32_t jB = B1_idx_arr[B1_pos];
      int32_t jC = C1_idx_arr[C1_pos];
      int32_t j = TACO_MIN(jB,jC);
      if ((jB == j) && (jC == j)) {
        A_val_arr[A1_pos] = B_val_arr[B1_pos] + C_val_arr[C1_pos];
        A1_pos++;
      }
      else if (jB == j) {
        A_val_arr[A1_pos] = B_val_arr[B1_pos];
        A1_pos++;
      }
      else {
        A_val_arr[A1_pos] = C_val_arr[C1_pos];
        A1_pos++;
      }
      if (jB == j) B1_pos++;
      if (jC == j) C1_pos++;
    }
    while (B1_pos < B1_pos_arr[iB + 1]) {
      int32_t jB = B1_idx_arr[B1_pos];
      A_val_arr[A1_pos] = B_val_arr[B1_pos];
      A1_pos++;
      B1_pos++;
    }
    while (C1_pos < C1_pos_arr[iB + 1]) {
      int32_t jC = C1_idx_arr[C1_pos];
      A_val_arr[A1_pos] = C_val_arr[C1_pos];
      A1_pos++;
      C1_pos++;
    }
  }

  return 0;
}