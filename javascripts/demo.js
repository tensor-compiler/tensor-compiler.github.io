function demo() {
  var model = {
    input: {
      expression: "",
      tensorOrders: {},
      error: ""
    },
    output: {
      computeLoops: "",
      assemblyLoops: "",
      fullCode: "",
      error: ""
    },
    req: null,

    inputViews: [],
    outputViews: [],
    reqViews: [],

    addInputView: function(newView) {
      model.inputViews.push(newView);
      newView(400);
    },
    updateInputViews: function() {
      for (v in model.inputViews) {
        model.inputViews[v](400);
      }
    },
    addOutputView: function(newView) {
      model.outputViews.push(newView);
      newView(0);
    },
    updateOutputViews: function() {
      for (v in model.outputViews) {
        model.outputViews[v](0);
      }
    },
    addReqView: function(newView) {
      model.reqViews.push(newView);
      newView(0);
    },
    updateReqViews: function() {
      for (v in model.reqViews) {
        model.reqViews[v](0);
      }
    },

    setInput: function(expression) {
      model.cancelReq();
      model.setOutput("", "", "", "");

      model.input.expression = expression;
      if (model.input.expression.length > 256) {
        model.input.tensorOrders = {};
        model.input.error = "Input expression is too long";
      } else {
        try {
          model.input.tensorOrders = parser.parse(expression);
          model.input.error = "";
          for (t in model.input.tensorOrders) {
            if (model.input.tensorOrders[t] < 0) {
              model.input.tensorOrders = {};
              model.input.error = "Tensor " + t + " has inconsistent order";
              break;
            }
          }
        } catch (e) {
          model.input.tensorOrders = {};
          model.input.error = "Input expression is invalid";
        }
      }
      model.updateInputViews();
    },
    setOutput: function(computeLoops, assemblyLoops, fullCode, error) {
      model.output = { computeLoops: computeLoops,
                       assemblyLoops: assemblyLoops,
                       fullCode: fullCode, error: error };
      model.updateOutputViews();
    },
    setReq: function(req) {
      model.req = req;
      model.updateReqViews();
    },

    cancelReq: function() {
      if (model.req) {
        if (model.req.readyState !== 4) {
          model.req.abort();
        }
        model.setReq(null);
      }
    },
    getError: function() {
      return (model.output.error !== "") ? model.output.error : model.input.error;
    }
  };

  var txtExprView = {
    timerEvent: null,

    updateView: function(timeout) {
      clearTimeout(txtExprView.timerEvent);
      if (model.getError() !== "") {
        var markError = function() {
          $("#lblError").html(model.getError());
          $("#txtExpr").parent().addClass('is-invalid');
        };
        txtExprView.timerEvent = setTimeout(markError, timeout);
      } else {
        $("#txtExpr").parent().removeClass('is-invalid');
      }
    }
  };

  var tblFormatsView = {
    cache: {},
    timerEvent: null,

    insertCacheEntry: function(tensor, format) {
      tblFormatsView.cache[tensor] = format;
    },
    createCacheEntry: function(listId) {
      var dims = $("#" + listId).sortable("toArray");
      var formats = [];
      var ordering = [];

      for (var i = 1; i < dims.length; ++i) {
        formats.push($("#" + dims[i] + "_select").attr("data-val"));
        ordering.push(parseInt(dims[i].split("_")[1]));
      }

      return { formats: formats, ordering: ordering };
    },
    getFormatString: function(desc) {
      switch (desc) {
        case 'd':
          return "Dense";
        case 's':
          return "Sparse";
        default:
          return "";
      }
    },
    updateView: function(timeout) {
      clearTimeout(tblFormatsView.timerEvent);
      if (model.getError() !== "") {
        var hideTable = function() { $("#tblFormats").hide(); };
        tblFormatsView.timerEvent = setTimeout(hideTable, timeout);
      } else {
        var listTensorsBody = "";
        for (t in model.input.tensorOrders) {
          var order = model.input.tensorOrders[t];
          var cached = (tblFormatsView.cache.hasOwnProperty(t) && 
                        tblFormatsView.cache[t].formats.length == order);

          if (order > 0) {
            var listId = "dims" + t;

            listTensorsBody += "<tr>";
            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "width=\"100\"><div align=\"center\" ";
            listTensorsBody += "style=\"font-size: 16px\">";
            listTensorsBody += t;
            listTensorsBody += "</div></td>";
            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "style=\"padding: 0px\">";
            listTensorsBody += "<ul id=\"";
            listTensorsBody += listId;
            listTensorsBody += "\" class=\"ui-state-default sortable\">";
            listTensorsBody += "<li class=\"ui-state-default\" ";
            listTensorsBody += "style=\"width: 0px; padding: 0px\"></li>";

            for (var i = 0; i < order; ++i) {
              var dim = cached ? tblFormatsView.cache[t].ordering[i] : i;
              var format = cached ? tblFormatsView.cache[t].formats[i] : "d";
              var id = "dim" + t + "_" + dim;
              var selectId = id + "_select";

              listTensorsBody += "<li id=\"";
              listTensorsBody += id;
              listTensorsBody += "\" class=\"ui-state-default\">";
              listTensorsBody += "<div class=\"mdl-textfield mdl-js-textfield ";
              listTensorsBody += "mdl-textfield--floating-label getmdl-select\" ";
              listTensorsBody += "style=\"cursor: move\">";
              listTensorsBody += "<input class=\"mdl-textfield__input ";
              listTensorsBody += "format-input\" id=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\" type=\"text\" readonly ";
              listTensorsBody += "value=\"";
              listTensorsBody += tblFormatsView.getFormatString(format);
              listTensorsBody += "\" data-val=\"";
              listTensorsBody += format;
              listTensorsBody += "\"/>";
              listTensorsBody += "<label for=\"";
              listTensorsBody += selectId
              listTensorsBody += "\">";
              listTensorsBody += "<i class=\"mdl-icon-toggle__label ";
              listTensorsBody += "material-icons\">keyboard_arrow_down</i>";
              listTensorsBody += "</label>";
              listTensorsBody += "<label class=\"mdl-textfield__label\" for=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\">Dimension ";
              listTensorsBody += (dim + 1);
              listTensorsBody += "</label>";
              listTensorsBody += "<ul class=\"mdl-menu mdl-menu--bottom-left ";
              listTensorsBody += "mdl-js-menu\" for=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\">";
              listTensorsBody += "<li class=\"mdl-menu__item\" data-val=\"";
              listTensorsBody += "d\">Dense</li>";
              listTensorsBody += "<li class=\"mdl-menu__item\" data-val=\"";
              listTensorsBody += "s\">Sparse</li>";
              listTensorsBody += "</ul></div></li>";
            }

            listTensorsBody += "</ul></td></tr>";
          }
        }

        if (listTensorsBody !== "") {
          $("#listTensors").html(listTensorsBody);
          getmdlSelect.init(".getmdl-select");

          $(".sortable").sortable({
              update: function(ev, ui) {
                var listId = ui.item.parent().attr('id');
                var tensor = listId.replace("dims", "");

                tblFormatsView.insertCacheEntry(tensor, 
                    tblFormatsView.createCacheEntry(listId));
                
                model.cancelReq();
                model.setOutput("", "", "", "");
              }
          });
          $(".format-input").change(function() {
            var listId = $(this).parent().parent().parent().attr('id');
            var tensor = listId.replace("dims", "");

            tblFormatsView.insertCacheEntry(tensor, 
                tblFormatsView.createCacheEntry(listId));
            
            model.cancelReq();
            model.setOutput("", "", "", "");
          });
          for (t in model.input.tensorOrders) {
            if (model.input.tensorOrders[t] > 0) {
              tblFormatsView.insertCacheEntry(t, 
                  tblFormatsView.createCacheEntry("dims" + t));
            }
          }

          $("#tblFormats").show();
        } else {
          $("#tblFormats").hide();
        }
      }
    }
  };

  var btnGetKernelView = {
    updateView: function(timeout) {
      $("#btnGetKernel").prop('disabled', model.input.error !== "" || model.req);
      $("#btnGetKernel").html(model.req ? "Processing..." : "Generate Kernel");
    }
  };

  model.addInputView(txtExprView.updateView);
  model.addInputView(tblFormatsView.updateView);
  model.addInputView(btnGetKernelView.updateView);

  $("#txtExpr").keyup(function() {
    model.setInput($("#txtExpr").val());
  });

  var panelKernelsView = {
    updateView: function(timeout) {
      var computeLoops = (model.output.computeLoops === "") ? 
                         "/* The generated compute loops will appear here */" :
                         model.output.computeLoops.replace(/</g, "&lt;");
      var assemblyLoops = (model.output.assemblyLoops === "") ? 
                          "/* The generated assembly loops will appear here */" :
                          model.output.assemblyLoops.replace(/</g, "&lt;");
      var fullCode = (model.output.fullCode === "") ? 
                     "/* The complete generated code will appear here */" :
                     model.output.fullCode.replace(/</g, "&lt;");
    
      $("#txtComputeLoops").html(computeLoops);
      $("#txtAssemblyLoops").html(assemblyLoops);
      $("#txtFullCode").html(fullCode);
      $('pre code').each(
        function(i, block) {
          hljs.highlightBlock(block);
        }
      );
    }
  };

  var btnDownloadView = {
    updateView: function(timeout) {
      if (model.output.fullCode === "") {
        $("#btnDownload").hide();
        $("#btnDownload").parent().css("width", "0px");
      } else {
        $("#btnDownload").show();
        $("#btnDownload").parent().css("width", "200px");
      }
    }
  };

  model.addOutputView(txtExprView.updateView);
  model.addOutputView(panelKernelsView.updateView);
  model.addOutputView(btnDownloadView.updateView);

  $("#btnDownload").click(function() {
    var blob = new Blob([model.output.fullCode], 
                        {type: "text/plain;charset=utf-8"});
    saveAs(blob, "taco_kernel.c");
  });

  model.addReqView(btnGetKernelView.updateView);

  $("#btnGetKernel").click(function() {
    model.setOutput("", "", "", "");

    var command = model.input.expression.replace(/ /g, "");
    for (t in model.input.tensorOrders) {
      var order = model.input.tensorOrders[t];
      if (order == 0) {
        continue;
      }

      command += (" -f=" + t + ":");
      
      var dims = $("#dims" + t).sortable("toArray");
      for (var i = 1; i <= order; ++i) {
        command += $("#" + dims[i] + "_select").attr("data-val");
      }
      
      command += ":";
      for (var i = 1; i <= order; ++i) {
        command += dims[i].split("_")[1];
        command += (i === order) ? "" : ",";
      }
    }

    var req = $.ajax({
        type: "POST",
        url: "http://tensor-compiler-online.csail.mit.edu",
        data: escape(command),
        async: true,
        cache: false,
        success: function(response) {
          model.setOutput(response['compute-kernel'], 
                          response['assembly-kernel'], 
                          response['full-kernel'], 
                          response['error']);
          model.setReq(null);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          var errorMsg = "Unable to connect to the taco online server";
          model.setOutput("", "", "", errorMsg); 
          model.setReq(null);
        }
    });
    model.setReq(req);
  });

  var examples = [
      { name: "SpMV", 
        code: "y(i) = A(i,j) * x(j)",
        formats: {
          y: { formats: ["d"], ordering: [0] },
          A: { formats: ["d", "s"], ordering: [0, 1] },
          x: { formats: ["d"], ordering: [0] }
        }
      },
      { name: "Sparse matrix addition", 
        code: "A(i,j) = B(i,j) + C(i,j)",
        formats: {
          A: { formats: ["d", "s"], ordering: [0, 1] },
          B: { formats: ["d", "s"], ordering: [0, 1] },
          C: { formats: ["d", "s"], ordering: [0, 1] },
        }
      },
      { name: "Tensor-times-vector", 
        code: "A(i,j) = B(i,j,k) * c(k)",
        formats: {
          A: { formats: ["s", "s"], ordering: [0, 1] },
          B: { formats: ["s", "s", "s"], ordering: [0, 1, 2] },
          c: { formats: ["d"], ordering: [0] },
        }
      },
      { name: "MTTKRP", 
        code: "A(i,j) = B(i,k,l) * C(k,j) * D(l,j)",
        formats: {
          A: { formats: ["d", "d"], ordering: [0, 1] },
          B: { formats: ["s", "s", "s"], ordering: [0, 1, 2] },
          C: { formats: ["d", "d"], ordering: [0, 1] },
          D: { formats: ["d", "d"], ordering: [0, 1] },
        }
      }
  ];

  var listExamplesBody = "";
  for (var i = 0; i < examples.length; ++i) {
    listExamplesBody += "<li id=\"example";
    listExamplesBody += i;
    listExamplesBody += "\" class=\"mdl-menu__item\">";
    listExamplesBody += examples[i].name;
    listExamplesBody += ":&nbsp; <code>";
    listExamplesBody += examples[i].code;
    listExamplesBody += "</code></li>";
  }

  $("#listExamples").html(listExamplesBody);
  for (var i = 0; i < examples.length; ++i) {
    (function(code, formats) {
      var setExample = function() {
        $("#txtExpr").val(code);
        for (var tensor in formats) {
          tblFormatsView.insertCacheEntry(tensor, formats[tensor]);
        }
        model.setInput(code);
      };
      $("#example" + i).click(setExample);

      // Initialize demo with first example
      if (i == 0) {
        setExample();
      }
    })(examples[i].code, examples[i].formats);
  }

  var demoCompute = `// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
for (int iA = 0; iA < A0_size; iA++) {
  double tj = 0;
  for (int A2_pos = A1_pos[iA]; A2_pos < A1_pos[iA + 1]; A2_pos++) {
    int jA = A1_idx[A2_pos];
    tj += A_vals[A2_pos] * x_vals[jA];
  }
  y_vals[iA] = tj;
}`;
  var demoAssembly = `// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
allocate y_vals[y0_size]`;
  var demoFull = `// Generated by the Tensor Algebra Compiler (tensor-compiler.org)
// taco "y(i)=A(i,j)*x(j)" -f=y:d:0 -f=A:ds:0,1 -f=x:d:0 -write-source=taco_kernel.c
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

int assemble(taco_tensor_t *y, taco_tensor_t *A, taco_tensor_t *x) {
  double* restrict y_vals = (double*)(y->vals);
  int y0_size = *(int*)(y->indices[0][0]);

  y_vals = (double*)malloc(sizeof(double) * y0_size);

  y->vals = (uint8_t*)y_vals;
  return 0;
}

int compute(taco_tensor_t *y, taco_tensor_t *A, taco_tensor_t *x) {
  double* restrict y_vals = (double*)(y->vals);
  int y0_size = *(int*)(y->indices[0][0]);
  int A0_size = *(int*)(A->indices[0][0]);
  double* restrict x_vals = (double*)(x->vals);
  double* restrict A_vals = (double*)(A->vals);
  int* restrict A1_idx = (int*)(A->indices[1][1]);
  int x0_size = *(int*)(x->indices[0][0]);
  int* restrict A1_pos0 = (int*)(A->indices[1][0]);

  #pragma omp parallel for
  for (int iA = 0; iA < A0_size; iA++) {
    double tj = 0;
    for (int A2_pos = A1_pos0[iA]; A2_pos < A1_pos0[iA + 1]; A2_pos++) {
      int jA = A1_idx[A2_pos];
      tj += A_vals[A2_pos] * x_vals[jA];
    }
    y_vals[iA] = tj;
  }

  return 0;
}`;
  model.setOutput(demoCompute, demoAssembly, demoFull, "");
  hljs.initHighlightingOnLoad();
}
