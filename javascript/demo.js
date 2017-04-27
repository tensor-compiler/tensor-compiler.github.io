function demo() {
  var model = {
    input: {
      expression: "",
      tensorOrders: {},
      error: ""
    },
    computeKernel: "",

    inputViews: [],
    computeKernelViews: [],

    addInputView: function(newView) {
      model.inputViews.push(newView);
      newView();
    },
    updateInputViews: function() {
      for (v in model.inputViews) {
        model.inputViews[v]();
      }
    },
    addComputeKernelView: function(newView) {
      model.computeKernelViews.push(newView);
      newView();
    },
    updateComputeKernelViews: function() {
      for (v in model.computeKernelViews) {
        model.computeKernelViews[v]();
      }
    },

    setInput: function(expression) {
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
  };

  var txtExprView = {
    updateView: function() {
      if (model.input.error !== "") {
        $("#lblError").html(model.input.error);
        $("#txtExpr").parent().addClass('is-invalid');
      } else {
        $("#txtExpr").parent().removeClass('is-invalid');
      }
    }
  };

  var btnGetKernelView = {
    updateView: function() {
      $("#btnGetKernel").prop('disabled', model.input.error !== "");
    }
  };

  var tblFormatsView = {
    updateView: function() {
      if (model.input.error !== "") {
        $("#tblFormats").hide();
      } else {
        var listTensorsBody = "";
        for (t in model.input.tensorOrders) {
          if (model.input.tensorOrders[t] > 0) {
            listTensorsBody += "<tr>";
            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "width=\"100\"><div align=\"center\">";
            listTensorsBody += t;
            listTensorsBody += "</div></td>";
            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "style=\"padding: 0px\">";
            listTensorsBody += "<ul id=\"dims";
            listTensorsBody += t;
            listTensorsBody += "\" class=\"ui-state-default sortable\">";
            listTensorsBody += "<li class=\"ui-state-default\" ";
            listTensorsBody += "style=\"width: 0px; padding: 0px\"></li>";
            for (var i = 0; i < model.input.tensorOrders[t]; ++i) {
              var id = "dim" + t + "_" + i;
              var selectId = id + "_select";
              listTensorsBody += "<li id=\"";
              listTensorsBody += id;
              listTensorsBody += "\" class=\"ui-state-default\">";
              listTensorsBody += "<div class=\"mdl-textfield mdl-js-textfield ";
              listTensorsBody += "mdl-textfield--floating-label getmdl-select\">";
              listTensorsBody += "<input class=\"mdl-textfield__input\" id=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\" value=\"Dense\" type=\"text\" readonly ";
              listTensorsBody += "tabIndex=\"-1\" data-val=\"d\"/>";
              listTensorsBody += "<label class=\"mdl-textfield__label\" for=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\">Dimension ";
              listTensorsBody += (i + 1);
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
          $(".sortable").sortable();
          $("#tblFormats").show();
        } else {
          $("#tblFormats").hide();
        }
      }
    }
  };

  model.addInputView(txtExprView.updateView);
  model.addInputView(btnGetKernelView.updateView);
  model.addInputView(tblFormatsView.updateView);

  $("#txtExpr").keyup(function() {
    model.setInput($("#txtExpr").val());
  });

  $("#btnGetKernel").click(function() {
    $("#txtKernel").html("/* Your custom-generated kernel will appear here... */");
    $('pre code').each(
      function(i, block) {
        hljs.highlightBlock(block);
      }
    );

    $("#btnGetKernel").html("Waiting...");
    $("#btnGetKernel").prop("disabled", true);

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
        command += parseInt(dims[i].split("_")[1]);
      }
    }

    $.ajax({
        type: "POST",
        url: "http://localhost",
        data: escape(command),
        async: true,
        cache: false,
        success: function(response) {
          if (response['error'] != "") {
            $("#lblError").html(response['error']);
            $("#txtExpr").parent().addClass('is-invalid');
          } else {
            $("#txtExpr").parent().removeClass('is-invalid');
            $("#txtKernel").html(response['compute-kernel'].replace(/</g, "&lt;"));
            $('pre code').each(
              function(i, block) {
                hljs.highlightBlock(block);
              }
            );
          }
          
          $("#btnGetKernel").html("Generate kernel");
          $("#btnGetKernel").prop("disabled", false);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          $("#lblError").html("Unable to connect to taco on-the-go");
          $("#txtExpr").parent().addClass('is-invalid');
          
          $("#btnGetKernel").html("Generate kernel");
          $("#btnGetKernel").prop("disabled", false);
        }
    });
  });
  
  model.setInput("a(i) = B(i,j) * c(j)");
  hljs.initHighlightingOnLoad();
}

