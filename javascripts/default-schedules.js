
var NNZ_PER_THREAD = 8; 
var WARP_SIZE = 32; 
var BLOCK_SIZE = 256; 

var default_CPU_schedules = {
  spmv: [
          { 
            command: "split", 
            parameters: ["i", "i0", "i1", 32]
          }, 
          {
            command: "reorder",
            numReordered: 3,
            parameters: ["i0", "i1", "j"]
          },
          {
            command: "parallelize", 
            parameters: ["i0", "CPU Thread", "No Races"]
          }
        ],
  add: [],
  ttv:  [
          { 
            command: "fuse",
            parameters: ["i", "j", "f"]
          },
          {
            command: "pos",
            parameters: ["f", "fpos", "B"]
          },
          {
            command: "split",
            parameters: ["fpos", "chunk", "fpos2", 8]
          },
          {
            command: "reorder", 
            numReordered: 3,
            parameters: ["chunk", "fpos2", "k"]
          },
          {
            command: "parallelize", 
            parameters: ["chunk", "CPU Thread", "No Races"]
        }
       ],
  mttkrp: [
            {
              command: "reorder",
              numReordered: 4,
              parameters: ["i", "k", "l", "j"]
            },
            {
              command: "precompute",
              parameters: ["j", "j", "B(i,k,l) * D(l,j)"]
            },
            {
              command: "split",
              parameters: ["i", "i0", "i1", 32]
            },
            {
              command: "parallelize",
              parameters: ["i0", "CPU Thread", "No Races"]
            }
          ]
}

var default_GPU_schedules = {
  spmv: [
        { 
          command: "fuse", 
          parameters: ["i", "j", "f"]
        }, 
        {
          command: "pos",
          parameters: ["f", "fpos", "A"]
        },
        {
          command: "split", 
          parameters: ["fpos", "block", "fpos1", NNZ_PER_THREAD * BLOCK_SIZE]
        },
        {
          command: "split", 
          parameters: ["fpos1", "warp", "fpos2", NNZ_PER_THREAD * WARP_SIZE]
        },
        {
          command: "split", 
          parameters: ["fpos2", "thread", "thr_nz", NNZ_PER_THREAD]
        },
        {
          command: "reorder", 
          numReordered: 4,
          parameters: ["block", "warp", "thread", "thr_nz"]
        },
        {
          command: "precompute",
          parameters: ["thr_nz", "thr_nz_pre", "A(i, j) * x(j)"]
        },
        {
          command: "unroll",
          parameters: ["thr_nz_pre", NNZ_PER_THREAD]
        },
        {
          command: "parallelize",
          parameters: ["block", "GPU Block", "Ignore Races"]
        },
        {
          command: "parallelize",
          parameters: ["warp", "GPU Warp", "Ignore Races"]
        },
        {
          command: "parallelize",
          parameters: ["thread", "GPU Thread", "Atomics"]
        }
      ]
}