Assign = _ lhs:Access _ "=" _ rhs:Expr _ {
    var ret = lhs;
    for (var t in rhs) {
        ret[t] = (ret.hasOwnProperty(t) && ret[t] !== rhs[t]) ? -1 : rhs[t];
    }
    return lhs;
}

Expr = head:Term tail:(_ ("+" / "-") _ Term)* {
    var ret = head;
    for (var i = 0; i < tail.length; ++i) {
        var tensors = tail[i][3];
        for (var t in tensors) {
            ret[t] = (ret.hasOwnProperty(t) && ret[t] !== tensors[t]) ? -1 : tensors[t];
        }
    }
    return ret;
}

Term = head:Factor tail:(_ ("*" / "/") _ Factor)* {
    var ret = head;
    for (var i = 0; i < tail.length; ++i) {
        var tensors = tail[i][3];
        for (var t in tensors) {
            ret[t] = (ret.hasOwnProperty(t) && ret[t] !== tensors[t]) ? -1 : tensors[t];
        }
    }
    return ret;
}

Factor = tensors:(ParenFactor / NegFactor / Access / Literal) {
    return tensors;
}

ParenFactor = "(" _ tensors:Expr _ ")" {
    return tensors;
}

NegFactor = "-" _ tensors:Factor {
    return tensors;
}

Access = tensor:Var _ order:(UnderscoreVar / UnderscoreVarList / ParenVarList / _) {
    var ret = {};
    ret[tensor] = order;
    return ret;
}

UnderscoreVar = "_" _ Var {
    return 1;
}

UnderscoreVarList = "_" _ "{" _ order:VarList _ "}" {
    return order;
}

ParenVarList = "(" _ order:VarList _ ")" {
    return order;
}

VarList = head:Var tail:(_ "," _ Var)* {
    return 1 + tail.length;
}

Var = [a-z]i [a-z/0-9]i* {
    return text();
}

Literal = [0-9]+ ("." [0-9]*)? {
    return {};
}

_ = [ \t\n\r]* {
    return 0;
}