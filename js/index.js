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

/*Global Singletons:
    * NumToken: The number token waiting to be completed
                when the next operator is enetered.
    * Input: State of calculator input field.
    * History: State of calculator history field.
*/
var NumToken = (function () {
    function NumToken() {
        this.token = "";
        this.append = function (c) {
            this.token += c;
        };
        this.getValue = function () {
            return this.token;
        };
        this.setValue = function (newValue) {
            this.token = newValue;
        };
        this.clear = function () {
            this.token = "";
        }
        this.isEmpty = function () {
            return (this.token === "")
        }

    }
    var instance;
    return {
        getInstance: function () {
            if (instance === undefined) {
                instance = new NumToken();
                // Hide the constructor so the returned objected can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();

var EntryField = (function () {
    function EntryField() {
        this.value = "";
        this.display = function (token) {
            $("#input").html(this.value);
        }
        this.set = function (token) {
            this.value = token;
            $("#input").html(this.value);
            //this.display();
        }
        this.getValue = function () {
            return this.value;
        }
        this.append = function (token) {
            this.value += token;
            $("#input").html(this.value);
            //this.display();
        }
        this.clear = function () {
            var initial = "";
            this.value = initial;
            $("#input").html(this.value);
            //this.display();
        }
    }
    var instance;
    return {
        getInstance: function () {
            if (instance === undefined) {
                instance = new EntryField();
                // Hide the constructor so the returned objected can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();

var HistoryField = (function () {
    function HistoryField() {
        this.display = function () {
            $("#history").html(this.value);
        }
        this.value = "";
        this.set = function (str) {
            if (debug) console.log("SET: ", str, ":", this.value);
            this.value = str;
            $("#history").html(this.value);
            //this.display();
        }
        this.getValue = function () {
            return this.value;
        }
        this.append = function (token) {
            if (debug) console.log("APPEND HIST: ", token, ":", this.value);
            if (root === null) this.clear;
            this.value += token;
            $("#history").html(this.value);
            //this.display();
        }
        this.clear = function () {
            if (debug) console.log("CLEAR HIST: ", this.value);
            this.value = "";
            $("#history").html(this.value);
            //this.display();
        }
        this.isClear = function () {
            if (debug) console.log("HIST IS CLEAR: " + this.value + " === \"\"");
            return (this.value === "");
        }
    }
    var instance;
    return {
        getInstance: function () {
            if (instance === undefined) {
                instance = new HistoryField();
                // Hide the constructor so the returned objected can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();

/*CORE LOGIC*/
var root = null;
var curr = null;
var numToken = NumToken.getInstance();
var entryField = EntryField.getInstance();
var historyField = HistoryField.getInstance();

/*No validation of input within function itself*/
function parseDigit(digit) {
    if (debug) console.log("PARSE DIGIT: " + digit + ":" + numToken.getValue());
    numToken.append(digit);
    return numToken.getValue();
}

function parseOperator(opToken) {
    if (debug) console.log("PARSE OP: " + opToken);
    if (numToken.isEmpty()) return false;
    var num = new Operand(numToken.getValue());
    var op = new Operator(opToken);
    if (!op) return false;
    numToken.clear();
    if (debug) console.log("PARSE OP: " + num.token + ":" + op.token);

    /*Core node logic */
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
    if (numToken.isEmpty()) return false;
    var num = new Operand(numToken.getValue());
    curr.setRight(num);
    return root;
}

function parseString(input) {
    if (debug) console.log("PARSE STRING: " + input);
    resetAST();
    for (var i = 0; i < input.length; i++) {
        var c = input.charAt(i);
        parseToken(c);
    }
    return root;
}

function parseToken(c) {
    if (debug) console.log("PARSE TOKEN: " + c);
    if (c === "=") {
        if (!isValidOperator() || root === null) return false;
        historyField.append(numToken.getValue() + "=");
        parseExec();
        var result = execAST(root);
        historyField.append(result);
        entryField.set(result);
        //if (debug) console.log("Result: ", result, ":", printAST(root));
        resetAST(result);
        if (debug) console.log("RESET: ", c, ":", numToken.getValue(), ":", root);
    } else if (c === "ce" || c === "<") {
        clearEntry();
    } else if (c === "ac" || c === ">") {
        allClear();
    } else if (operatorMap[c]) {
        if (!isValidOperator()) return false;
        if (root === null) historyField.set(numToken.getValue() + c);
        else historyField.append(numToken.getValue() + c);
        entryField.set(c);
        parseOperator(c);
    } else {
        if (root === null && !historyField.isClear()) {
            historyField.clear();
            entryField.clear();
            numToken.clear();
        } else if (numToken.isEmpty()) {
            entryField.clear();
        }
        entryField.append(c);
        parseDigit(c);
    }
    trimRowById("input");
    trimRowById("history");
    return true;
}

function clearEntry() {
    //CE Button
    if (debug) console.log("CE");
    if (root === null) {
        allClear();
    } else if (!numToken.isEmpty()) {
        numToken.clear();
        entryField.set(curr.token);
    } else {
        if (curr.left instanceof Operand) {
            numToken.setValue(curr.left.token);
            if (debug) console.log("PARENT: ", curr);
            if (curr.parent === null) {
                resetAST(numToken.getValue());
            } else {
                curr = curr.parent;
                if (debug) console.log("CURR: ", curr);
                curr.setRight(null);
            }
        } else if (curr.left instanceof Operator) {
            numToken.setValue(curr.left.right.token);
            if (curr.parent) {
                curr.parent.setRight(curr.left);
                curr = curr.left;
                curr.right = null;
            } else {
                curr = curr.left;
                curr.parent = null;
                curr.right = null;
                root = curr;
            }
        }
        entryField.set(numToken.getValue());
        historyField.set(printAST(root));
    }
}

function allClear() {
    resetAST();
    entryField.clear();
    historyField.clear();
    numToken.clear();
}

function resetAST(chainValue) {
    root = null;
    curr = null;

    if (chainValue !== undefined) {
        numToken.setValue(chainValue.toString());
    } else {
        numToken.clear();
    }
}

function isValidOperator() {
    console.log("VALIDATE: " + numToken.getValue() + " !== \"\"");
    return !numToken.isEmpty();
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
    //historyField.append(printAST(root));
    //historyField.append(execAST(root));
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

function trimRowById(id) {
    var row = document.getElementById(id);
    if (row) {
        if (debug) console.log("trimRow(" + id + ":" + row.innerHTML + ")", row.scrollWidth, row.offsetWidth);
        if (row.scrollWidth > row.offsetWidth) {
            var textNode = row.firstChild;
            if (debug) console.log("Text Node: " + textNode);
            var value = '...' + textNode.nodeValue;
            do {
                value = '...' + value.substr(4);
                textNode.nodeValue = value;

            } while (row.scrollWidth > row.offsetWidth);
        }
    }
}