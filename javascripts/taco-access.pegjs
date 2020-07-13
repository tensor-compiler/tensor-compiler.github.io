Assign = _ lhs:Access _ "=" _ rhs:Expr _ {
    return rhs;
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
    return [tensor];
}

UnderscoreVar = "_" _ Var {
    return;
}

UnderscoreVarList = "_" _ "{" _ indices:VarList _ "}" {
    return;
}

ParenVarList = "(" _ indices:VarList _ ")" {
    return;
}

VarList = head:Var tail:(_ "," _ Var)* {
    return; 
}

Var = [a-z]i [a-z/0-9]i* {
    return text();
}

Literal = [0-9]+ ("." [0-9]*)? {
    return; 
}

_ = [ \t\n\r]* {
    return; 
}