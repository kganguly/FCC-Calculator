var debug = true;

/*CALCULATOR LOGIC*/
//Classes
function Node() {
    this.parent = null;
    this.token = null;
    this.left = null;
    this.right = null;
}

Node.prototype.setLeft = function (node) {
    this.left = node;
    if (node) node.parent = this;
};

Node.prototype.setRight = function (node) {
    this.right = node;
    if (node) node.parent = this;
};

Node.prototype.toString = function () {
    if (this === null) return "null";
    return this.parent + " -> " + this.token;
};

function Operand(token) {
    Node.call(this);

    this.token = token;
    this.value = Number(token);
}

Operand.prototype = Object.create(Node.prototype);
Operand.prototype.constructor = Operand;

var operatorMap = {
    "=": 0,
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
};

function Operator(opToken) {
    //debugger;
    Node.call(this);

    if (operatorMap[opToken]) {
        this.operation = new Function("a", "b", "return a " + opToken + " b;");
        this.token = opToken;
        this.precedence = operatorMap[opToken];
    }
}

Operator.prototype = Object.create(Node.prototype);
Operator.prototype.constructor = Operator;

/*CORE LOGIC*/
var root = null;
var curr = null;
var numToken = "";

/*No validation of input within function itself*/
function parseDigit(digit) {
    numToken += digit;
    return numToken;
}

function parseOperator(opToken) {
    if (numToken === "") return false;
    var num = new Operand(numToken);
    var op = new Operator(opToken);
    if (!op) return false;
    clearNumToken();
    if (debug) console.log(num.token, op.token);

    if (root === null) {
        curr = op;
        op.setLeft(num);
        root = op;
    } else {
        //debugger;
        if (curr.precedence < op.precedence) {
            curr.setRight(op);
            op.setLeft(num);
            curr = op;
        } else {
            //debugger;
            curr.setRight(num);
            if (curr.parent) {
                curr.parent.setRight(op);
            } else {
                root = op;
            }
            op.setLeft(curr);
            curr = op;
        }
    }
    return op;
}

function parseExec() {
    if (numToken === "") return false;
    var num = new Operand(numToken);
    curr.setRight(num);
    return root;
}

function parseString(input) {
    if (debug) console.log("PARSE: " + input);
    resetAST();
    for (var i = 0; i < input.length; i++) {
        var c = input.charAt(i);
        parseToken(c);
    }
    return root;
}

function parseToken(c) {
    if (c === "=") {
        if (!isValidOperator() || root === null) return false;
        updateHistory(numToken + "=");
        parseExec();
        var result = execAST(root);
        updateHistory(result);
        displayInput(result);
        //if (debug) console.log("Result: ", result, ":", printAST(root));
        resetAST(result);
        if (debug) console.log("RESET: ", c, ":", numToken, ":", root);
    } else if (c === "ce") {
        clearEntry();
    } else if (c === "ac") {
        allClear();
    } else if (operatorMap[c]) {
        if (!isValidOperator()) return false;
        updateHistory(numToken + c);
        displayInput(c);
        parseOperator(c);
    } else {
        if (root === null && !isHistoryClear()) {
            clearHistory();
            clearInput();
            clearNumToken();
        } else if (numToken === "") {
            clearInput();
        }
        updateInput(c);
        parseDigit(c);
    }
    return true;
}

function clearEntry() {
    //CE Button
    if (debug) console.log("CE");
    if (root === null) {
        resetAST();
        clearInput();
        clearHistory();
        clearNumToken();
    } else if (numToken !== "") {
        clearNumToken();
        displayInput(curr.token);
    } else {
        if (curr.left instanceof Operand) {
            numToken = curr.left.token;
            if (debug) console.log("PARENT: ", curr);
            if (curr.parent === null) {
                resetAST(numToken);
            } else {
                curr = curr.parent;
                if (debug) console.log("CURR: ", curr);
                curr.setRight(null);
            }
        } else if (curr.left instanceof Operator) {
            numToken = curr.left.left.token;
            if (curr.parent) {
                curr.parent.setRight(curr.left);
                curr = curr.left;
            } else {
                resetAST(curr.left.token);
            }
        }
        displayInput(numToken);
        displayHistory(printAST(root));
    }
}

function allClear() {
    resetAST();
    clearInput();
    clearHistory();
    clearNumToken();
}

function clearNumToken() {
    numToken = "";
}

function resetAST(chainValue) {
    root = null;
    curr = null;
    parent = null;
    gParent = null;

    if (chainValue !== undefined) {
        numToken = chainValue;
    } else {
        numToken = "";
    }
}

function isValidOperator() {
    console.log("VALIDATE: " + numToken + " !== \"\"");
    return numToken !== "";
}

function printAST(node) {
    if (node === null) {
        if (debug) console.log("null");
        return "";
    }
    var output = printAST(node.left, output);
    //output += " " + node.token;
    output += node.token;
    output += printAST(node.right, output);
    if (debug) console.log("return:", output, "token:", node.token);
    return output;
}

function execAST(node) {
    //debugger;
    if (node instanceof Operand) {
        if (debug) console.log("EXEC return: ", node.token);
        return node.value;
    }
    if (debug) console.log(node.token, " -> LEFT");
    var a = execAST(node.left);
    if (debug) console.log(node.token, " -> RIGHT");
    var b = execAST(node.right);
    var c = node.operation(a, b);
    if (debug) console.log("EXEC return:", a, node.token, b, "=", c);
    return c;
}

function printTest(output) {
    $("#history").append("<div>" + output + "</div>");
}

$(document).ready(function () {
    setListeners();
    /*parseString("34+55=");
    printTest(printAST(root));
    printTest(execAST(root));
    parseString("3+4*5=");
    printTest(printAST(root));
    printTest(execAST(root));*/
    //parseString("55+55*55-55.10=");
    //updateHistory(printAST(root));
    //updateHistory(execAST(root));
    //$("#searchText").focus();
});

/* UI FUNCTIONS */
function setListeners() {
    $("button").click(function () {
        var val = $(this).val();
        parseToken(val);
    });

    $(document).keyup(function (event) {
        keyNum = event.which;
        if (event.shiftKey) {
            //*Handle shift key first
            switch (keyNum) {
                case 56:
                    parseToken("*");
                    break;
                case 187:
                    parseToken("+");
            }
        } else if (48 <= keyNum && keyNum <= 57) {
            parseToken(keyNum - 48);
        } else if (96 <= keyNum && keyNum <= 106) {
            parseToken(keyNum - 96);
        } else {
            switch (keyNum) {
                case 106:
                    parseToken("*");
                    break;
                case 107:
                    parseToken("+");
                    break;
                case 109:
                case 189:
                    parseToken("-");
                    break;
                case 110:
                case 190:
                    parseToken(".");
                    break;
                case 111:
                case 191:
                    parseToken("/");
                    break;
                case 13:
                case 187:
                    parseToken("=");
                    break;
                case 8:
                    parseToken("ce");
                    break;
                case 27:
                    parseToken("ac");
                    break;
            }
        }
    });
}

function displayInput(token) {
    $("#input").html(token);
}

function updateInput(token) {
    var inputDiv = $("#input");
    inputDiv.html(inputDiv.text() + token);
}

function clearInput() {
    var initial = "";
    $("#input").html(initial);
}

function displayHistory(str) {
    $("#history").html(str);
}

function updateHistory(token) {
    var historyDiv = $("#history");
    if (debug) console.log("UPDATE: ", token, ":", historyDiv.text());
    if (root === null) clearHistory();
    historyDiv.html(historyDiv.text() + token);
}

function clearHistory() {
    $("#history").html("");
}

function isHistoryClear() {
    var history = $("#history").html();
    if (debug) console.log("isHistoryClear: " + history);
    return  (history === "" || history === undefined);
}