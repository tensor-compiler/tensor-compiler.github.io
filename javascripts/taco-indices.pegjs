Assign = _ lhs:Access _ "=" _ rhs:Expr _ {
    var ret = lhs;
    return ret.concat(rhs);
}

Expr = head:Term tail:(_ ("+" / "-") _ Term)* {
    var ret = head;
    for (var i = 0; i < tail.length; ++i) {
        var tensors = tail[i][3];
        ret = ret.concat(tensors); 
    }
    return ret;
}

Term = head:Factor tail:(_ ("*" / "/") _ Factor)* {
    var ret = head;
    for (var i = 0; i < tail.length; ++i) {
        var tensors = tail[i][3];
        ret = ret.concat(tensors); 
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

Access = tensor:Var _ indices:(UnderscoreVar / UnderscoreVarList / ParenVarList / _) {
    return indices;
}

UnderscoreVar = "_" _ Var {
    return 1;
}

UnderscoreVarList = "_" _ "{" _ indices:VarList _ "}" {
    return indices;
}

ParenVarList = "(" _ indices:VarList _ ")" {
    return indices;
}

VarList = head:Var tail:(_ "," _ Var)* {
    var ret = [head];
    for (var i = 0; i < tail.length; ++i) {
        for (var t of tail[i]) {
            if (t && t !== ",") {
                ret.push(t); 
            }
        }
    }
    return ret; 
}

Var = [a-z]i [a-z/0-9]i* {
    return text();
}

Literal = [0-9]+ ("." [0-9]*)? {
    return ""; 
}

_ = [ \t\n\r]* {
    return ""; 
}