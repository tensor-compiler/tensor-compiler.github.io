function demo() {
  var State = Object.freeze({Valid: 1, Invalid: 2, Processing: 3});

  var model = {
    input: {
      expression: "",
      tensorOrders: {}
    },
    output: {
      computeLoops: "",
      assemblyLoops: "",
      fullCode: ""
    },
    error: "",
    state: State.Valid,

    inputViews: [],
    outputViews: [],
    stateViews: [],

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
    addStateView: function(newView) {
      model.stateViews.push(newView);
      newView(0);
    },
    updateStateViews: function() {
      for (v in model.stateViews) {
        model.stateViews[v](0);
      }
    },

    setInput: function(expression) {
      model.input.expression = expression;
      if (model.input.expression.length > 256) {
        model.input.tensorOrders = {};
        model.error = "Input expression is too long";
      } else {
        try {
          model.input.tensorOrders = parser.parse(expression);
          model.error = "";
          for (t in model.input.tensorOrders) {
            if (model.input.tensorOrders[t] < 0) {
              model.input.tensorOrders = {};
              model.error = "Tensor " + t + " has inconsistent order";
              break;
            }
          }
        } catch (e) {
          model.input.tensorOrders = {};
          model.error = "Input expression is invalid";
        }
      }
      model.setState(model.error === "" ? State.Valid : State.Invalid);
      model.updateInputViews();
    },
    setOutput: function(computeLoops, assemblyLoops, fullCode, error, state) {
      model.output = { computeLoops: computeLoops,
                       assemblyLoops: assemblyLoops,
                       fullCode: fullCode };
      model.error = error;
      model.setState(state);
      model.updateOutputViews();
    },
    setState: function(state) {
      model.state = state;
      model.updateStateViews();
    }
  };

  var txtExprView = {
    timerEvent: null,

    updateView: function(timeout) {
      clearTimeout(txtExprView.timerEvent);
      if (model.error !== "") {
        var markError = function() {
          $("#lblError").html(model.error);
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
      if (model.error !== "") {
        var hideTable = function() { $("#tblFormats").hide(); };
        tblFormatsView.timerEvent = setTimeout(hideTable, 400);
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
            listTensorsBody += "width=\"100\"><div align=\"center\" style=\"font-size: 16px\">";
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
              listTensorsBody += "mdl-textfield--floating-label getmdl-select\">";
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

                tblFormatsView.cache[tensor] = 
                    tblFormatsView.createCacheEntry(listId);
              }
          });
          $(".format-input").change(function() {
            var listId = $(this).parent().parent().parent().attr('id');
            var tensor = listId.replace("dims", "");

            tblFormatsView.cache[tensor] = 
                tblFormatsView.createCacheEntry(listId);
          });
          for (t in model.input.tensorOrders) {
            if (model.input.tensorOrders[t] > 0) {
              tblFormatsView.cache[t] = 
                  tblFormatsView.createCacheEntry("dims" + t);
            }
          }

          $("#tblFormats").show();
        } else {
          $("#tblFormats").hide();
        }
      }
    }
  };

  model.addInputView(txtExprView.updateView);
  model.addInputView(tblFormatsView.updateView);

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
        $("#btnDownload").parent().css("width", "180px");
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

  var btnGetKernelView = {
    updateView: function(timeout) {
      $("#btnGetKernel").prop('disabled', model.state !== State.Valid);
      $("#btnGetKernel").html(model.state === State.Processing ? 
                              "Processing..." : "Generate Kernel");
    }
  };

  model.addStateView(btnGetKernelView.updateView);

  $("#btnGetKernel").click(function() {
    model.setOutput("", "", "", "", State.Processing); 

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

    $.ajax({
        type: "POST",
        url: "http://tensor-compiler-online.csail.mit.edu",
        data: escape(command),
        async: true,
        cache: false,
        success: function(response) {
          model.setOutput(response['compute-kernel'], 
                          response['assembly-kernel'], 
                          response['full-kernel'], 
                          response['error'], State.Valid);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          var errorMsg = "Unable to connect to the taco online server";
          model.setOutput("", "", "", errorMsg, State.Valid); 
        }
    });
  });

  var examples = [
      { name: "Matrix-vector multiplication", code: "y(i) = A(i,j) * x(j)" },
      { name: "Matrix addition", code: "A(i,j) = B(i,j) + C(i,j)" },
      { name: "Tensor-times-vector", code: "A(i,j) = B(i,j,k) * c(k)" },
      { name: "MTTKRP", code: "A(i,j) = B(i,k,l) * C(k,j) * D(l,j)" }
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
    (function(code) {
      $("#example" + i).click(function() {
        $("#txtExpr").val(code);
        model.setInput(code);
      });
    })(examples[i].code);
  }

  model.setInput("y(i) = A(i,j) * x(j)");
  hljs.initHighlightingOnLoad();
}

