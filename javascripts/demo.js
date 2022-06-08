function demo() {
  var model = {
    input: {
      expression: "",
      tensorOrders: {},
      error: "",
      indices: [],
      prefix: ""
    },
    schedule: [],
    exampleSchedule: "",
    output: {
      computeLoops: "",
      assemblyLoops: "",
      fullCode: "",
      error: ""
    },
    req: null,

    inputViews: [],
    scheduleView: null,
    exampleScheduleViews: [],
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
    updateScheduleView: function() {
      model.removeInvalidIndices();
      model.removeInvalidAccesses();
      model.scheduleView(0);
    },
    addExampleScheduleView: function(newView) {
      model.exampleScheduleViews.push(newView);
      newView(0);
    },
    updateExampleScheduleViews: function() {
      for (v in model.exampleScheduleViews) {
        model.exampleScheduleViews[v](0);
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
          model.input.indices = [...new Set(parser_indices.parse(expression))];
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
    setPrefix: function(prefix) {
      model.cancelReq();
      model.setOutput("", "", "", "");
      model.input.prefix = prefix;
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
    },

    setExampleSchedule: function(e) {
      model.exampleSchedule = e;
      model.updateExampleScheduleViews();
    },
    setSchedule: function(schedule) {
      model.schedule = JSON.parse(JSON.stringify(schedule)); // deep

      model.cancelReq();
      model.setOutput("", "", "", "");
      model.updateScheduleView();
    },
    resetSchedule: function() {
      model.schedule = [];

      model.cancelReq();
      model.setOutput("", "", "", "");
      model.updateScheduleView();
    },
    addScheduleRow: function() {
      model.schedule.push({command: "", parameters: []});

      model.updateScheduleView();
    },
    deleteScheduleRow: function(row) {
      var isNop = (model.schedule[row].command === "");
      model.schedule.splice(row, 1);

      if (!isNop) {
        model.cancelReq();
        model.setOutput("", "", "", "");
      }
      model.updateScheduleView();
    },
    swapScheduleRows: function(row1, row2) {
      [model.schedule[row1], model.schedule[row2]] = [model.schedule[row2], model.schedule[row1]];

      model.cancelReq();
      model.setOutput("", "", "", "");
      model.updateScheduleView();
    },
    addScheduleCommand: function(row, command) {
      model.schedule[row].command =  command;
      model.schedule[row].parameters = [];

      for (var i = 0; i < scheduleCommands[command].parameters.length; ++i) {
        var parameterInfo = scheduleCommands[command][i];
        var defaultValue = "";

        if (parameterInfo[0] === "default" || 
            parameterInfo[0] === "predefined dropdown") {
          defaultValue = parameterInfo[1];
        } else if (parameterInfo[0] === "result dropdown") {
          for (var access in model.input.tensorOrders) {
            if (model.input.tensorOrders[access] > 0
                && model.input.expression.indexOf(access) <= model.input.expression.indexOf("=")) {
              defaultValue += access;
              break;
            }
          }
        }
        model.schedule[row].parameters.push(defaultValue);
      }

      model.cancelReq();
      model.setOutput("", "", "", "");
      model.updateScheduleView();
    },
    addScheduleParameter: function(row, index, value) {
      model.schedule[row].parameters[index] = value;

      var command = model.schedule[row].command;
      model.updateInferred(row, command, index, value);

      model.cancelReq();
      model.setOutput("", "", "", "");
      model.updateScheduleView();
    },
    addReorderedVar: function(row) {
      model.schedule[row].parameters.push("");
      model.updateScheduleView();
    },
    getScheduleCommand: function(row) {
      return model.schedule[row].command;
    },
    getScheduleParameter: function(row, index) {
      return model.schedule[row].parameters[index];
    },
    getIndices: function(row) {
      var indices = model.input.indices.slice(0);
      for (var i = 0; i < row; ++i) {
        var command = model.schedule[i].command;
        var parameters = model.schedule[i].parameters;
        for (var j = 0; j < parameters.length; ++j) {
          var index = parameters[j];
          if (index && model.isParameterType(command, j, "default") && !indices.includes(index)) {
            indices.push(index);
          }
        }
      }
      return indices;
    },
    removeInvalidIndices: function() {
      for (var row = 0; row < model.schedule.length; ++row) {
        var indices = model.getIndices(row);
        for (var index = 0; index < model.schedule[row].parameters.length; ++index) {
          var command = model.schedule[row].command;
          var value = model.schedule[row].parameters[index];
          if (model.isParameterType(command, index, "index dropdown") && !indices.includes(value)) {
            model.schedule[row].parameters[index] = "";
            model.updateInferred(row, command, index, "");
          }
        }
      }
    },
    removeInvalidAccesses: function() {
      for (var row = 0; row < model.schedule.length; ++row) {
        for (var index = 0; index < model.schedule[row].parameters.length; ++index) {
          var command = model.schedule[row].command;
          var value = model.schedule[row].parameters[index];
          if (model.isParameterType(command, index, "access dropdown")
              && !model.input.tensorOrders.hasOwnProperty(value)) {
            model.schedule[row].parameters[index] = "";
            model.updateInferred(row, command, index, "");
          }
        }
      }
    },
    isParameterType: function(command, index, parameterType) {
      if (command === "reorder") {
        return parameterType === "index dropdown";
      }

      return scheduleCommands[command][index] && scheduleCommands[command][index][0] === parameterType;
    },
    updateInferred: function(row, command, index, value) {
      var parameterInfo = scheduleCommands[command][index];
      if (parameterInfo && parameterInfo[0] === "index dropdown") {
        for (var inferred of parameterInfo.slice(1)) {
          model.schedule[row].parameters[inferred[0]] = value ? value + inferred[1] : value;
        }
      }   
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
    levelsCache: {},
    namesCache: {},
    timerEvent: null,

    insertLevelsCacheEntry: function(tensor, level) {
      tblFormatsView.levelsCache[tensor] = level;
    },
    insertNamesCacheEntry: function(tensor, name) {
      tblFormatsView.namesCache[tensor] = name;
    },
    createEntryFromId: function(listId) {
      var dims = $("#" + listId).sortable("toArray");
      var formats = [];
      var ordering = [];

      for (var i = 1; i < dims.length; ++i) {
        formats.push($("#" + dims[i] + "_select").attr("data-val"));
        ordering.push(parseInt(dims[i].split("_")[1]));
      }

      return { formats: formats, ordering: ordering };
    },
    createEntryFromName: function(name, order) {
      var formats = [];
      var ordering = [];

      var rule = tblFormatsView.getFormatNameRule(name, order);
      for (var i = 0; i < order; ++i) {
        formats.push(rule(i));
        if (name === "CSC" || name === "DCSC") {
          ordering.push(order - i - 1);
        } else {
          ordering.push(i);
        }
      }

      return { formats: formats, ordering: ordering };
    },
    getFormatNameRule : function(name, order) {
      switch (name) {
        case "Sparse array":
        case "DCSR":
        case "DCSC":
        case "CSF": 
          return function(i) { return 's'; };
        case "CSR":
        case "CSC":
          return function(i) { return (i === 0) ? 'd' : 's'; }; 
        case "Sorted COO": 
          return function(i) { 
            if (i === 0) {
              return 'u';
            } else if (i < order - 1) {
              return 'c';
            } else {
              return 'q';
            }
          };
        case "Dense array":
        default: 
          return function(i) { return 'd'; };
      }
    },
    getFormatNamesList : function(order) {
      var names = ["Dense array"];

      if (order === 1) {
        names.push("Sparse array");
      } else if (order === 2) {
        names.push("Sorted COO");
        names.push("CSR");
        names.push("CSC");
        names.push("DCSR");
        names.push("DCSC");
      } else if (order >= 3) {
        names.push("Sorted COO");
        names.push("CSF");
      }
      return names; 
    },
    getFormatName : function(currentEntry, order) {
      var names = tblFormatsView.getFormatNamesList(order);
      for (var name of names) {
        var entry = tblFormatsView.createEntryFromName(name, order);
        if (JSON.stringify(entry) === JSON.stringify(currentEntry)) {
          return name;
        } 
      }
      return "Custom";
    },
    getLevelFormatString: function(desc) {
      switch (desc) {
        case 'd':
          return "Dense";
        case 's':
          return "Compressed (U)";
        case 'u': 
          return "Compressed (&not;U)"
        case 'q':
          return "Singleton (U)";
        case 'c':
          return "Singleton (&not;U)";
        default:
          return "";
      }
    },
    updateView: function(timeout) {
      clearTimeout(tblFormatsView.timerEvent);
      if (model.getError() !== "") {
        var hideTables = function() { 
          $("#tblFormats").hide(); 
          $("#tblSchedule").hide(); 
          model.resetSchedule();
        };
        tblFormatsView.timerEvent = setTimeout(hideTables, timeout);
      } else {
        var listTensorsBody = "";
        for (t in model.input.tensorOrders) {
          var order = model.input.tensorOrders[t];
          var cached = (tblFormatsView.levelsCache.hasOwnProperty(t) && 
                        tblFormatsView.levelsCache[t].formats.length === order);

          if (order > 0) {
            var listId = "dims" + t;
            var formatNameId = "format" + t;
            var namesList = tblFormatsView.getFormatNamesList(order);

            var nameCached = (cached && tblFormatsView.namesCache.hasOwnProperty(t) &&
                              namesList.concat(["Custom"]).includes(tblFormatsView.namesCache[t]));
            var formatName = nameCached ? tblFormatsView.namesCache[t] : "Dense array";

            listTensorsBody += "<tr>";
            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "width=\"100\" style=\"vertical-align: middle; ";
            listTensorsBody += "padding-left: 9px\"><div align=\"center\" ";
            listTensorsBody += "style=\"font-size: 16px\" class=\"space-font\">";
            listTensorsBody += t;
            listTensorsBody += "</div></td>";

            listTensorsBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
            listTensorsBody += "style=\"padding: 0px; vertical-align: middle\">";

            listTensorsBody += "<div class=\"format-selector\">";
            listTensorsBody += "<div class=\"dropdown format-dropdown\" style=\"margin-top: 6px; margin-bottom: 6px\">";
            listTensorsBody += "<div class=\"dropdown-trigger\">";
            listTensorsBody += "<button class=\"button has-text-spaced\" style=\"width: 190px\" ";
            listTensorsBody += "aria-haspopup=\"true\" aria-controls=\"dropdown-menu\">";
            listTensorsBody += "<span style=\"font-weight: normal\" id=\"";
            listTensorsBody += formatNameId;
            listTensorsBody += "\">";
            listTensorsBody += formatName;
            listTensorsBody += "</span><span class=\"icon is-small\" style=\"\">";
            listTensorsBody += "<i class=\"fas fa-angle-down\" aria-hidden=\"true\"></i>";
            listTensorsBody += "</span></button></div>";
            listTensorsBody += "<div class=\"dropdown-menu\" id=\"dropdown-menu\" role=\"menu\">";
            listTensorsBody += "<div class=\"dropdown-content formats\">";
            for (var name of namesList) {
              listTensorsBody += "<a class=\"dropdown-item\" id=\"";
              listTensorsBody += formatNameId + "_" + name + "\" >";
              listTensorsBody += name + "</a>";
            }
            listTensorsBody += "</div></div></div>";

            listTensorsBody += "<ul id=\"";
            listTensorsBody += listId;
            listTensorsBody += "\" class=\"ui-state-default sortable\" ";
            listTensorsBody += "style=\"margin-top: 0px; margin-left: 0px\">";
            listTensorsBody += "<li class=\"ui-state-default\" ";
            listTensorsBody += "style=\"width: 0px; padding: 0px\"></li>";

            for (var i = 0; i < order; ++i) {
              var dim = cached ? tblFormatsView.levelsCache[t].ordering[i] : i;
              var level = cached ? tblFormatsView.levelsCache[t].formats[i] : "d";
              var id = "dim" + t + "_" + dim;
              var selectId = id + "_select";

              listTensorsBody += "<li id=\"";
              listTensorsBody += id;
              listTensorsBody += "\" class=\"ui-state-default\" style=\"cursor: move\">";
              listTensorsBody += "<div class=\"field\" style=\"cursor: move;\">";
              listTensorsBody += "<label class=\"label\" style=\"cursor: move; margin-bottom: 0px\">";
              listTensorsBody += "<small>Dimension ";
              listTensorsBody += (dim + 1)
              listTensorsBody += "</small></label><div class=\"dropdown format-dropdown\" data-val=\"";
              listTensorsBody += level;
              listTensorsBody += "\" id=\"";
              listTensorsBody += selectId;
              listTensorsBody += "\"><div class=\"dropdown-trigger\">";
              listTensorsBody += "<button class=\"button has-text-spaced\" ";
              listTensorsBody += "style=\"width: 190px\" aria-haspopup=\"true\" ";
              listTensorsBody += "aria-controls=\"dropdown-menu\">";
              listTensorsBody += "<span class=\"level-format-label\">";
              listTensorsBody += tblFormatsView.getLevelFormatString(level);
              listTensorsBody += "</span><span class=\"icon is-small\">";
              listTensorsBody += "<i class=\"fas fa-angle-down\" aria-hidden=\"true\"></i>";
              listTensorsBody += "</span></button></div>";
              listTensorsBody += "<div class=\"dropdown-menu\" role=\"menu\" for=\""
              listTensorsBody += selectId;
              listTensorsBody += "\">";
              listTensorsBody += "<div class=\"dropdown-content level-formats\">";
              listTensorsBody += "<a data-val=\"d\" class=\"dropdown-item\">Dense</a>";
              listTensorsBody += "<hr class=\"dropdown-divider\">";
              listTensorsBody += "<a data-val=\"s\" class=\"dropdown-item\">";
              listTensorsBody += "<div>Compressed</div><div>(w/ Unique Elements)</div></a>";
              listTensorsBody += "<a data-val=\"u\" class=\"dropdown-item\">";
              listTensorsBody += "<div>Compressed</div><div>(w/ Duplicate Elements)</div></a>";
              listTensorsBody += "<hr class=\"dropdown-divider\">";
              listTensorsBody += "<a data-val=\"q\" class=\"dropdown-item\">";
              listTensorsBody += "<div>Singleton</div><div>(w/ Unique Elements)</div></a>";
              listTensorsBody += "<a data-val=\"c\" class=\"dropdown-item\">";
              listTensorsBody += "<div>Singleton</div><div>(w/ Duplicate Elements)</div></a>";
              listTensorsBody += "</div></div></div></div></li>";
            }

            listTensorsBody += "</ul></div></td></tr>";
          }
        }

        if (listTensorsBody !== "") {
          $("#listTensors").html(listTensorsBody);

          $(".sortable").sortable({
            // From https://stackoverflow.com/questions/2451528/jquery-ui-sortable-scroll-helper-element-offset-firefox-issue
            sort: function(ev, ui) {
              var $target = $(ev.target);
              if (!/html|body/i.test($target.offsetParent()[0].tagName)) {
                var top = ev.pageY - $target.offsetParent().offset().top - (ui.helper.outerHeight(true) / 2);
                ui.helper.css({'top' : top + 'px'});
              }
            },
            update: function(ev, ui) {
              var listId = ui.item.parent().attr('id');
              var id = ui.item.context.id;
              var tensor = id.substring(3, id.indexOf("_"));

              var entry = tblFormatsView.createEntryFromId(listId);
              var name = tblFormatsView.getFormatName(entry, model.input.tensorOrders[tensor]);

              $("#format" + tensor).html(name);
              tblFormatsView.insertNamesCacheEntry(tensor, name);

              model.cancelReq();
              model.setOutput("", "", "", "");
            }
          });

          function updateCache(selectParent, val) {
            var selectId = selectParent.attr('for');
            var listId = selectParent.parent().parent().parent().parent().attr('id');
            var tensor = listId.replace("dims", "");

            var level = tblFormatsView.getLevelFormatString(val);
            level = level.replace("&not;", $("<div>").html("&not;").text());

            $("#" + selectId + " > .dropdown-trigger > .button > .level-format-label").html(level);
            $("#" + selectId).attr('data-val', val);

            var tensor = listId.substring(4);
            var entry = tblFormatsView.createEntryFromId(listId);
            var name = tblFormatsView.getFormatName(entry, model.input.tensorOrders[tensor]);

            $("#format" + tensor).html(name);
            tblFormatsView.insertNamesCacheEntry(tensor, name);
            tblFormatsView.insertLevelsCacheEntry(tensor, entry);
            
            model.cancelReq();
            model.setOutput("", "", "", "");
          }

          for (t in model.input.tensorOrders) {
            if (model.input.tensorOrders[t] > 0) {
              tblFormatsView.insertNamesCacheEntry(t, $("#format" + t).html());
              tblFormatsView.insertLevelsCacheEntry(t, 
                  tblFormatsView.createEntryFromId("dims" + t));
            }
          }

          $(".formats > a").each(function() {
            $(this).mousedown(function() {
              var id = $(this).attr('id');
              var tensor = id.substring(6, id.indexOf("_"));
              var name = id.substring(id.indexOf("_") + 1);

              tblFormatsView.insertLevelsCacheEntry(tensor, 
                  tblFormatsView.createEntryFromName(name, model.input.tensorOrders[tensor]));
              tblFormatsView.insertNamesCacheEntry(tensor, name);
              
              model.updateInputViews();
              model.cancelReq();
              model.setOutput("", "", "", "");
            });
          });

          $(".level-formats > a").each(function() {
            $(this).mousedown(function() {
              var selectParent = $(this).parent().parent();
              var val = $(this).attr("data-val");
              updateCache(selectParent, val);
            });
          });

          $(".dropdown-item").mousedown(function() {
            var dropdown = $(this).parents('.dropdown');
            dropdown.removeClass('is-active');
          });

          $(".format-dropdown .button").click(function() {
            var dropdown = $(this).parents('.dropdown');
            dropdown.toggleClass('is-active');
          });

          $(".format-dropdown .button").each(function() {
            var dropdown = $(this).parents('.dropdown');
            document.addEventListener("click", function(ev) {
              if (!dropdown[0].contains(ev.target)) {
                dropdown.removeClass('is-active');
              }
            });
          });

          $("#tblFormats").show();
        } else {
          $("#tblFormats").hide();
        }
      }
    }
  };

  var scheduleCommands = {
    pos: {
      parameters: ["Original Index Variable", "Derived Index Variable", "Accessed Tensor"],
      0: ["index dropdown", [1, "pos"]],
      1: ["default", ""],
      2: ["access dropdown"]
    },
    fuse: {
      parameters: ["Outer Index Variable", "Inner Index Variable", "Fused Index Variable"],
      0: ["index dropdown"],
      1: ["index dropdown"],
      2: ["default", "f"]
    },
    split: {
      parameters: ["Split Index Variable", "Outer Index Variable", "Inner Index Variable", "Split Factor"],
      0: ["index dropdown", [1, "0"], [2, "1"]],
      1: ["default", ""],
      2: ["default", ""],
      3: ["text"]
    },
    divide: {
      parameters: ["Divided Index Variable", "Outer Index Variable", "Inner Index Variable", "Divide Factor"],
      0: ["index dropdown", [1, "0"], [2, "1"]],
      1: ["default", ""],
      2: ["default", ""],
      3: ["text"]
    },
    precompute: {
      parameters: ["Precomputed Expression", "Original Index Variable", "Workspace Index Variable"],
      0: ["long text"],
      1: ["index dropdown", [2, ""]],
      2: ["default", ""]
    },
    reorder: {
      parameters: ["Index Variable"],
      0: ["index dropdown"]
    },
    bound: {
      parameters: ["Original Index Variable", "Bounded Index Variable", "Bound", "Bound Type"],
      0: ["index dropdown", [1, "bound"]],
      1: ["default", ""],
      2: ["text"],
      3: ["predefined dropdown", "Max Exact", "Min Exact", "Min Constraint", "Max Exact", "Max Constraint"]
    },
    unroll: {
      parameters: ["Unrolled Index Variable", "Unroll Factor"],
      0: ["index dropdown"],
      1: ["text"]
    },
    parallelize: {
      parameters: ["Parallelized Index Variable", "Hardware", "Race Strategy"],
      0: ["index dropdown"],
      1: ["predefined dropdown", "CPU Thread",
          "Not Parallel", "CPU Thread", "CPU Vector",
          "GPU Thread", "GPU Block", "GPU Warp"],
      2: ["predefined dropdown", "No Races",
          "Ignore Races", "No Races", "Atomics", "Temporary", "Parallel Reduction"]
    },
    assemble: {
      parameters: ["Result Tensor", "Assembly Strategy"],
      0: ["result dropdown"],
      1: ["predefined dropdown", "Insert",
          "Insert", "Append"]
    }
  };

  var tblScheduleView = {
    makeParameters: function(row, command) {
      // a normal textfield
      function empty(parameterName, inputId, input, long = false) {
        var parameter = "<li style=\"margin-top: 3.5px; margin-bottom: 6px\">";
        parameter += "<label class=\"label\" style=\"margin-bottom: 0px\"><small>";
        parameter += parameterName;
        parameter += "</small></label>";
        parameter += "<div class=\"schedule-input has-placeholder\" ";
        //parameter += long ? "style=\"width: 200px\"" : "";
        parameter += "><input class=\"input space-font\"";
        parameter += "type=\"text\" autocomplete=\"off\" placeholder=\"\" value = \"";
        parameter += input;
        parameter += "\" id=\"";
        parameter += inputId;
        parameter += "\">";
        parameter += "</div></li>";
        return parameter;
      }

      function dropdown(paramterName, inputId, input, defaultValue = "", useMonospace = true, length = "120px") {
        var parameter = "<li style=\"margin-top: 3.5px; margin-bottom: 6px\">";
        parameter += "<label class=\"label\" style=\"margin-bottom: 0px\"><small>";
        parameter += parameterName;
        parameter += "</small></label>";
        parameter += "<div class=\"dropdown schedule-param-select schedule-dropdown\">";
        parameter += "<div class=\"dropdown-trigger\">";
        parameter += "<button class=\"button has-text-spaced\" style=\"width: 200px\" ";
        parameter += "aria-haspopup=\"true\" aria-controls=\"dropdown-menu\">";
        parameter += "<span ";
        if (useMonospace) {
          parameter += "class=\"space-font\" ";
        }
        parameter += "style=\"font-weight: normal\" id=\"";
        parameter += inputId;
        parameter += "\">";
        parameter += input ? input : defaultValue;
        parameter += "</span><span class=\"icon is-small\" style=\"\">";
        parameter += "<i class=\"fas fa-angle-down\" aria-hidden=\"true\"></i>";
        parameter += "</span></button></div>";
        parameter += "<div class=\"dropdown-menu\" id=\"dropdown-menu\" role=\"menu\" for =\"";
        parameter += inputId;
        parameter += "\"><div class=\"dropdown-content\">";
        return parameter;
      }

      // a dropdown where user can choose from input index variables
      function indexDropdown(parameterName, inputId, input) {
        var parameter = dropdown(parameterName, inputId, input);
        for (var index of model.getIndices(row)) {
          parameter += "<a class=\"dropdown-item space-font\">";
          parameter += index;
          parameter += "</a>";
        }
        parameter += "</div></div></div>";
        return parameter;
      }

      // a dropdown where user can choose from argument tensors
      function accessDropdown(parameterName, inputId, input) {
        var parameter = dropdown(parameterName, inputId, input);
        for (var access in model.input.tensorOrders) {
          if (model.input.tensorOrders[access] > 0
              && model.input.expression.indexOf(access) > model.input.expression.indexOf("=")) {
            parameter += "<a class=\"dropdown-item space-font\">";
            parameter += access;
            parameter += "</a>";
          }
        }
        parameter += "</div></div></div>";
        return parameter;
      }

      // a dropdown where user can choose from result tensors
      function resultDropdown(parameterName, inputId, input) {
        var parameter = ""; 
        var defaultParam = "";
        for (var access in model.input.tensorOrders) {
          if (model.input.tensorOrders[access] > 0
              && model.input.expression.indexOf(access) <= model.input.expression.indexOf("=")) {
            parameter += "<a class=\"dropdown-item space-font\">";
            parameter += access;
            parameter += "</a>";
            if (defaultParam === "") {
              defaultParam += access;
            }
          }
        }
        parameter = dropdown(parameterName, inputId, input, defaultParam) + parameter;
        parameter += "</div></div></div>";
        return parameter;
      }

      // a dropdown where user can choose from a set of predefined options
      function predefinedDropdown(parameterName, inputId, input, options) {
        var parameter = dropdown(parameterName, inputId, input, options[0], false, "160px");
        for (var option of options.slice(1)) {
          parameter += "<a class=\"dropdown-item\">";
          parameter += option;
          parameter += "</a>";
        }
        parameter += "</div></div></div>";
        return parameter;
      }

      var commandInfo = scheduleCommands[command];
      var parametersList = commandInfo.parameters;

      var parameters = "<ul class=\"ui-state-default schedule-list\" ";
      parameters += "style=\"margin-left: 0px; margin-top: 0px\">";
      for (var p = 0; p < parametersList.length; ++p) {
        var parameterName = parametersList[p];
        var inputId = "param" + row + "-" + p;
        var input = model.getScheduleParameter(row, p);

        if (command === "reorder") {
          parameterName += " 1";
        }

        var parameterInfo = commandInfo[p];
        switch (parameterInfo[0]) {
          case "index dropdown":
            parameters += indexDropdown(parameterName, inputId, input);
            break;
          case "access dropdown":
            parameters += accessDropdown(parameterName, inputId, input);
            break;
          case "result dropdown":
            parameters += resultDropdown(parameterName, inputId, input);
            break;
          case "predefined dropdown":
            parameters += predefinedDropdown(parameterName, inputId, input, parameterInfo.slice(1));
            break;
          case "default":
            parameters += empty(parameterName, inputId, input);
            break;
          case "text":
            parameters += empty(parameterName, inputId, input);
            break;
          case "long text":
            parameters += empty(parameterName, inputId, input, true);
            break;
        }
      }

      if (command === "reorder") {
        for (var p = 1; p < model.schedule[row].parameters.length; ++p) {
          var parameterName = parametersList[0] + " " + (p + 1);
          var inputId = "param" + row + "-" + p;
          var input = model.getScheduleParameter(row, p);

          parameters += indexDropdown(parameterName, inputId, input);
        }

        var reorderId = "reorder" + row;
        parameters += "<li class=\"add-reorder\" id=\"";
        parameters += reorderId;
        parameters += "\"><button class=\"button is-primary\" style=\"width: 200px; ";
        parameters += "margin-top: 13.5px\">Add IndexVar</button></li>";
      }

      parameters += "</ul>";
      return parameters;
    },

    updateView: function(timeout) {
      var scheduleBody = "";
      for (var r = 0; r < model.schedule.length; ++r) {
        var rowId = "schedule" + r;
        var command = model.getScheduleCommand(r);

        var row = "<tr style=\"cursor: auto\">";
        row += "<td class=\"removable-row mdl-data-table__cell--non-numeric\" id=\"";
        row += rowId + "-button\"; style=\"vertical-align: middle; ";
        row += "padding-left: 14px; padding-right: 14px; width: 60px\">";
        row += "<button class=\"mdl-button mdl-js-button mdl-button--icon\">";
        row += "<i class=\"material-icons\" style=\"font-size:16px\">clear</i>";
        row += "</button></td>";

        row += "<td class=\"mdl-data-table__cell--non-numeric\" ";
        row += "style=\"padding: 0px; vertical-align: middle\">";
        row += "<div class=\"format-selector\">";
        row += "<div class=\"dropdown schedule-dropdown schedule-command-select\" ";
        row += "style=\"margin-top: 6px; margin-bottom: 6px\">";
        row += "<div class=\"dropdown-trigger\">";
        row += "<button class=\"button has-text-spaced\" style=\"width: 200px\" ";
        row += "aria-haspopup=\"true\" aria-controls=\"dropdown-menu\">";
        row += "<span style=\"font-weight: normal\" id=\"";
        row += rowId;
        row += "\">";
        row += command;
        row += "</span><span class=\"icon is-small\" style=\"\">";
        row += "<i class=\"fas fa-angle-down\" aria-hidden=\"true\"></i>";
        row += "</span></button></div>";
        row += "<div class=\"dropdown-menu\" id=\"dropdown-menu\" role=\"menu\" for =\"";
        row += rowId;
        row += "\">";
        row += "<div class=\"dropdown-content\">";
        for (var c in scheduleCommands) {
          row += "<a class=\"dropdown-item\">";
          row += c;
          row += "</a>";
        }
        row += "</div></div></div>";
        if (command) {
          row += "<div style=\"padding-right: 0px\">";
          row += tblScheduleView.makeParameters(r, command);
          row += "</div>";
        }
        row += "</div></td></tr>";

        scheduleBody += row;
      }
      scheduleBody += "<tr style=\"cursor: auto\">";
      scheduleBody += "<td class=\"mdl-data-table__cell--non-numeric\" ";
      scheduleBody += "style=\"vertical-align: middle; padding-left: 14px; ";
      scheduleBody += "padding-right: 14px; width: 60px\">";
      scheduleBody += "<button id=\"btnSchedule\" class=\"mdl-button mdl-js-button mdl-button--icon\">";
      scheduleBody += "<i class=\"material-icons\" style=\"font-size:16px\">add</i>";
      scheduleBody += "</button></td><td></td></tr>";

      if (scheduleBody !== "") {
        $("#tblSchedule").html(scheduleBody);
        $("#tblSchedule").show();
      } else {
        $("#tblSchedule").hide();
      }

      $("#btnSchedule").click(function() {
        model.addScheduleRow();
      });

      $(".schedule-command-select a").each(function() {
        $(this).mousedown(function() {
          var command = $(this).text();
          var rowId = $(this).parent().parent().attr("for");
          var row = rowId.substring(("schedule").length);

          $("#" + rowId).val(command);
          model.addScheduleCommand(row, command);
        });
      });

      $(".dropdown-item").mousedown(function() {
        var dropdown = $(this).parents('.dropdown');
        dropdown.removeClass('is-active');
      });

      $(".schedule-dropdown .button").click(function() {
        var dropdown = $(this).parents('.schedule-dropdown');
        dropdown.toggleClass('is-active');
      });

      $(".schedule-dropdown .button").each(function() {
        var dropdown = $(this).parents('.schedule-dropdown');
        document.addEventListener("click", function(ev) {
          if (!dropdown[0].contains(ev.target)) {
            dropdown.removeClass('is-active');
          }
        });
      });

      $(".schedule-input input").on("change", function(e) {
        var inputId = $(this).attr("id");
        var row = inputId[inputId.indexOf("-") - 1];
        var index = inputId.slice(-1);

        model.addScheduleParameter(row, index, $(this).val());
      });

      $(".schedule-param-select a").on("mousedown", function(e) {
        var option = $(this).text();
        var inputId = $(this).parent().parent().attr("for");
        var row = inputId[inputId.indexOf("-") - 1];
        var index = inputId.slice(-1);

        model.addScheduleParameter(row, index, option);
      });

      //$("tbody").sortable({
      //  start: function(ev, ui) {
      //    ui.item.startPos = ui.item.index();
      //  },
      //  update: function(ev, ui) {
      //    model.swapScheduleRows(ui.item.startPos, ui.item.index());
      //  }
      //});

      $(".removable-row").each(function() {
        $(this).click(function() {
          var row = $(this).attr("id")[("schedule").length];
          model.deleteScheduleRow(row);
        });
      });

      $(".add-reorder").each(function() {
        $(this).click(function() {
          var row = $(this).attr("id")[("reorder").length];
          model.addReorderedVar(row);
        });
      });
    }
  };

  model.scheduleView = tblScheduleView.updateView;

  var btnExampleScheduleView = {
    updateView: function(timeout) {
      if (model.exampleSchedule.length === 0) {
        $("#btnCPU").hide();
        $("#btnGPU").hide();
      } else {
        $("#btnCPU").show();
        $("#btnCPU").attr('data-val', model.exampleSchedule);

        $("#btnGPU").show();
        $("#btnGPU").attr('data-val', model.exampleSchedule);
      }
    }
  };

  model.addExampleScheduleView(btnExampleScheduleView.updateView);

  var btnGetKernelView = {
    updateView: function(timeout) {
      $("#btnGetKernel").prop('disabled', model.input.error !== "" || model.req);
      if (model.req) {
        $("#btnGetKernel").addClass("is-loading");
      } else {
        $("#btnGetKernel").removeClass("is-loading");
      }
    }
  };

  model.addInputView(txtExprView.updateView);
  model.addInputView(tblFormatsView.updateView);
  model.addInputView(btnGetKernelView.updateView);

  $("#txtExpr").keyup(function() {
    model.setInput($("#txtExpr").val());
    model.resetSchedule();
    model.setExampleSchedule("");
  });

  var panelKernelsView = {
    updateView: function(timeout) {
      var computeLoops = (model.output.computeLoops === "") ? 
                         "/* The generated compute code will appear here */" :
                         model.output.computeLoops.replace(/</g, "&lt;");
      var assemblyLoops = (model.output.assemblyLoops === "") ? 
                          "/* The generated assemble code will appear here */" :
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
        $("#btnDownload").parent().css("width", "187px");
      }
    }
  };

  model.addOutputView(txtExprView.updateView);
  model.addOutputView(panelKernelsView.updateView);
  model.addOutputView(btnDownloadView.updateView);

  $("#btnDownload").click(function() {
    var blob = new Blob([model.output.fullCode], 
                        {type: "text/plain;charset=utf-8"});
    saveAs(blob, "taco_kernel.h");
  });

  model.addReqView(btnGetKernelView.updateView);

  var getKernel = function() {
    model.setOutput("", "", "", "");

    var command = "\"" + model.input.expression.replace(/ /g, "") + "\"";

    var formats = "";
    for (t in model.input.tensorOrders) {
      var order = model.input.tensorOrders[t];
      if (order === 0) {
        continue;
      }

      command += (" -f=" + t + ":");
      formats += ((formats === "") ? "" : ";") + t + ":";
      
      var dims = $("#dims" + t).sortable("toArray");
      for (var i = 1; i <= order; ++i) {
        var levelFormat = $("#" + dims[i] + "_select").attr("data-val");
        command += levelFormat;
        formats += levelFormat;
      }
      
      command += ":";
      formats += ":";
      for (var i = 1; i <= order; ++i) {
        var position = dims[i].split("_")[1] + ((i === order) ? "" : ",");
        command += position;
        formats += position;
      }
    }

    var schedule = "";
    for (var i = 0; i < model.schedule.length; ++i) {
      var scheduleCommand = model.schedule[i]["command"];
      if (!scheduleCommand) { continue; }

      command += " -s=\"" + scheduleCommand + "(";
      schedule += ((schedule === "") ? "" : ";") + scheduleCommand + ":";

      for (var param of model.schedule[i]["parameters"]) {
        var paramShortened = param.toString().replace(/ /g, "");
        if (!paramShortened) {
          errorMsg = "Schedule is missing arguments";
          model.cancelReq();
          model.setOutput("", "", "", errorMsg); 
          return; 
        }
        command += paramShortened + ",";
        schedule += param + ":";
      }

      command = command.substring(0, command.length - 1);
      command += ")\"";
      schedule = schedule.substring(0, schedule.length - 1);
    }

    var prefix = model.input.prefix.replaceAll(" ", "");
    if (prefix) {
      command += " -prefix=" + prefix;
    }

    var url = window.location.pathname + "?expr=" 
                  + model.input.expression + "&format=" + formats;
    if (schedule !== "") {
      url += "&sched=" + schedule;
    }
    history.replaceState(null, "", url);

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
  };
  $("#btnGetKernel").click(getKernel);

  var examples = {
      spmv: { name: "SpMV", 
        code: "y(i) = A(i,j) * x(j)",
        formats: {
          y: { name: "Dense array", levels: { formats: ["d"], ordering: [0] } },
          A: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          x: { name: "Dense array", levels: { formats: ["d"], ordering: [0] } }
        }
      },
      spgemm: { name: "SpGEMM", 
        code: "A(i,j) = B(i,k) * C(k,j)",
        formats: {
          A: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          B: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          C: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
        }
      },
      spadd: { name: "Sparse matrix addition", 
        code: "A(i,j) = B(i,j) + C(i,j)",
        formats: {
          A: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          B: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          C: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
        }
      },
      ttv: { name: "Sparse tensor-times-vector", 
        code: "A(i,j) = B(i,j,k) * c(k)",
        formats: {
          A: { name: "CSR", levels: { formats: ["d", "s"], ordering: [0, 1] } },
          B: { name: "CSF", levels: { formats: ["s", "s", "s"], ordering: [0, 1, 2] } },
          c: { name: "Dense array", levels: { formats: ["d"], ordering: [0] } },
        }
      },
      mttkrp: { name: "SpMTTKRP", 
        code: "A(i,j) = B(i,k,l) * D(l,j) * C(k,j)",
        formats: {
          A: { name: "Dense array", levels: { formats: ["d", "d"], ordering: [0, 1] } },
          B: { name: "CSF", levels: { formats: ["s", "s", "s"], ordering: [0, 1, 2] } },
          C: { name: "Dense array", levels: { formats: ["d", "d"], ordering: [0, 1] } },
          D: { name: "Dense array", levels: { formats: ["d", "d"], ordering: [0, 1] } },
        }
      }
  };

  var listExamplesBody = "";
  for (var e in examples) {
    listExamplesBody += "<li id=\"example_";
    listExamplesBody += e;
    listExamplesBody += "\" class=\"mdl-menu__item\"><div class=\"short-name\">";
    listExamplesBody += examples[e].name;
    listExamplesBody += "</div><div class=\"long-name\">";
    listExamplesBody += examples[e].name;
    listExamplesBody += ":&nbsp; <code style=\"background-color: transparent\">";
    listExamplesBody += examples[e].code;
    listExamplesBody += "</code></div></li>";
  }
  $("#listExamples").html(listExamplesBody);

  $("#btnExamples").click(function() {
    if ($(window).width() > 480) {
      $("#listExamples .long-name").css("display", "block");
      $("#listExamples .short-name").css("display", "none");
    } else {
      $("#listExamples .long-name").css("display", "none");
      $("#listExamples .short-name").css("display", "block");
    }
  });

  var getURLParam = function(k) {
    var url = window.location.search.substring(1);
    var params = url.split('&');
    for (var i = 0; i < params.length; ++i) {
      var param = params[i].split('=');
      var key = param[0];
      var val = param.slice(1).join('=');
      if (key === k) {
        return val;
      }
    }
    return "";
  };

  var inited = false;
  var expr = getURLParam("expr");
  if (expr !== "") {
    var formats = getURLParam("format").split(";");
    for (var f in formats) {
      var [tensor, levelFormats, ordering] = formats[f].split(":");
      levelFormats = levelFormats.split("");
      ordering = ordering.split(",").map(Number);
      format = { formats: levelFormats, ordering: ordering };
      tblFormatsView.insertLevelsCacheEntry(tensor, format);
      var name = tblFormatsView.getFormatName(format, levelFormats.length);
      tblFormatsView.insertNamesCacheEntry(tensor, name);
    }

    expr = expr.replaceAll("%20", " ");
    model.setInput(expr);
    $("#txtExpr").val(expr);
    inited = (model.error == null);

    var schedule = [];
    var scheduleString = getURLParam("sched");
    if (scheduleString !== "") {
      var commands = scheduleString.split(";");
      for (var c in commands) {
        var [transform, ...args] = commands[c].split(":").map(function(x) {
          return x.replaceAll("%20", " ");
        });
        command = { command: transform, parameters: args };
        schedule.push(command);
      }
    }
    model.setSchedule(schedule);
  }

  var demo = getURLParam("demo");
  if (!(demo in examples)) {
    demo = "spmv";
  }

  for (var e in examples) {
    (function(e, code, formats) {
      var setExample = function() {
        $("#txtExpr").val(code);
        for (var tensor in formats) {
          tblFormatsView.insertLevelsCacheEntry(tensor, formats[tensor].levels);
          tblFormatsView.insertNamesCacheEntry(tensor, formats[tensor].name);
        }
        model.setInput(code);

        var cpuSchedule = default_CPU_schedules[e];
        var gpuSchedule = default_GPU_schedules[e];
        model.setExampleSchedule((gpuSchedule.length > 0) ? e : "");
        model.setSchedule(cpuSchedule);      
      };
      $("#example_" + e).click(setExample);

      // Initialize demo
      if (!inited && e === demo) {
        setExample();
      }
    })(e, examples[e].code, examples[e].formats);
  }

  if (inited) {
    getKernel();
  } else {
    var urlPrefix = "http://tensor-compiler.org/examples/" + demo;
    var computeGet = $.get(urlPrefix + "_compute.c");
    var assemblyGet = $.get(urlPrefix + "_assembly.c");
    var fullGet = $.get(urlPrefix + "_full.c");
    $.when(computeGet, assemblyGet, fullGet).done(function() {
      model.setOutput(computeGet.responseText, 
              assemblyGet.responseText, 
              fullGet.responseText, "");
    });
  }

  $("#btnCPU").click(function() {
    model.setSchedule(default_CPU_schedules[$(this).attr('data-val')]);
  });

  $("#btnGPU").click(function() {
    model.setSchedule(default_GPU_schedules[$(this).attr('data-val')]);
  });

  $("#prefix").keyup(function() {
    model.setPrefix($("#prefix").val());
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Functions to open and close a modal
    function openModal($el) {
      $el.classList.add('is-active');
    }
  
    function closeModal($el) {
      $el.classList.remove('is-active');
    }
  
    function closeAllModals() {
      (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
      });
    }
  
    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
      const modal = $trigger.dataset.target;
      const $target = document.getElementById(modal);
      $trigger.addEventListener('click', () => {
        openModal($target);
      });
    });
  
    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll(
        '.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).
        forEach(($close) => {
      const $target = $close.closest('.modal');
      $close.addEventListener('click', () => {
        closeModal($target);
      });
    });
  
    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
      const e = event || window.event;
      if (e.keyCode === 27) { // Escape key
        closeAllModals();
      }
    });
  });
}
