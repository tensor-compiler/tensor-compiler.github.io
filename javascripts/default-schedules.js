
var default_CPU_schedules = {
  spmv: [
          { 
            command: "split", 
            parameters: ["i", "i0", "i1", 32]
          }, 
          {
            command: "reorder",
            parameters: ["i0", "i1", "j"]
          },
          {
            command: "parallelize", 
            parameters: ["i0", "CPU Thread", "No Races"]
          }
        ],
  spgemm: [
            {
              command: "reorder",
              parameters: ["i", "k", "j"]
            },
            {
              command: "precompute",
              parameters: ["B(i,k) * C(k,j)", "j", "j"]
            },
            {
              command: "assemble",
              parameters: ["A", "Insert"]
            },
            {
              command: "parallelize",
              parameters: ["i", "CPU Thread", "No Races"]
            }
          ],
  spadd: [
           {
             command: "assemble",
             parameters: ["A", "Insert"]
           },
           {
             command: "parallelize",
             parameters: ["i", "CPU Thread", "No Races"]
           }
         ],
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
              parameters: ["i", "k", "l", "j"]
            },
            {
              command: "precompute",
              parameters: ["B(i,k,l) * D(l,j)", "j", "j"]
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
          parameters: ["fpos", "block", "fpos1", 3584]
        },
        {
          command: "split", 
          parameters: ["fpos1", "warp", "fpos2", 224]
        },
        {
          command: "split", 
          parameters: ["fpos2", "thread", "thr_nz", 7]
        },
        {
          command: "reorder", 
          parameters: ["block", "warp", "thread", "thr_nz"]
        },
        {
          command: "precompute",
          parameters: ["A(i, j) * x(j)", "thr_nz", "thr_nz_pre"]
        },
        {
          command: "unroll",
          parameters: ["thr_nz_pre", 7]
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
      ],
  spgemm: [],
  spadd: [],
  ttv:  [ 
        {
          command: "fuse",
          parameters: ["j", "k", "jk"]
        },
        {
          command: "fuse",
          parameters: ["i", "jk", "f"]
        },
        {
          command: "pos",
          parameters: ["f", "fpos", "B"]
        },
        {
          command: "split", 
          parameters: ["fpos", "block", "fpos1", 256]
        },
        {
          command: "split", 
          parameters: ["fpos1", "warp", "fpos2", 16]
        },
        {
          command: "split", 
          parameters: ["fpos2", "thread", "thr_nz", 1] 
        },
        {
          command: "reorder",
          parameters: ["block", "warp", "thread", "thr_nz"]
        },
        {
          command: "precompute",
          parameters: ["B(i, j, k) * c(k)", "thr_nz", "thr_nz_pre"]
        },
        {
          command: "unroll",
          parameters: ["thr_nz_pre", 1]
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
        ],
  mttkrp: [
          {
            command: "reorder",
            parameters: ["i", "k", "l", "j"]
          },
          {
            command: "fuse",
            parameters: ["k", "l", "kl"]
          },
          {
            command: "fuse",
            parameters: ["i", "kl", "f"]
          },
          {
            command: "pos",
            parameters: ["f", "fpos", "B"]
          },
          {
            command: "split", 
            parameters: ["fpos", "block", "fpos1", 64]
          },
          {
            command: "split", 
            parameters: ["fpos1", "warp", "nnz", 4]
          },
          {
            command: "split", 
            parameters: ["j", "dense_un", "thread", 32]
          },
          {
            command: "bound", 
            parameters: ["dense_un", "dense_val", 1, "Max Exact"]
          },
          {
            command: "reorder",
            parameters: ["block", "warp", "dense_val", "thread", "nnz"]
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
        ],
}
