describe('Node', function () {
    it('sets a left node', function () {
        var n = new Node(),
            m = new Node();
        n.setLeft(m);

        expect(n.left).toEqual(m);
    });

    it('sets a right node', function () {
        var n = new Node(),
            m = new Node();
        n.setRight(m);

        expect(n.right).toEqual(m);
    });

    it('converts to a string showing it\'s ancestors and itself', function () {
        var n = new Node(),
            m = new Node();
        n.setRight(m);

        expect(m.toString()).toEqual("null -> null -> null");
    });
});

describe('Operand', function () {
    it('stores a token', function () {
        var o = new Operand('12');

        expect(o.token).toEqual("12");
    });

    it('stores a value', function () {
        var o = new Operand('12');

        expect(o.value).toEqual(12);
    });
});

describe('Operator', function () {
    it('has an undefined operation when the constructor token is unmapped', function () {
        var o = new Operator('%');

        expect(o.operation).toEqual(undefined);
    });
});

describe('Addition', function () {
    it('adds two values', function () {
        var o = new Operator('+');

        expect(o.operation(3, 4)).toEqual(7);
        expect(o.operation(-3, 4)).toEqual(1);
        expect(o.operation(-3, -4)).toEqual(-7);
    });

    it('has precedence 1', function () {
        var o = new Operator('+');

        expect(o.precedence).toEqual(1);
    });
});

describe('Subtraction', function () {
    it('subtracts two values', function () {
        var o = new Operator('-');

        expect(o.operation(3, 4)).toEqual(-1);
        expect(o.operation(-3, 4)).toEqual(-7);
        expect(o.operation(-3, -4)).toEqual(1);
    });

    it('has precedence 1', function () {
        var o = new Operator('-');

        expect(o.precedence).toEqual(1);
    });
});

describe('Multiplication', function () {
    it('multiplies two values', function () {
        var o = new Operator('*');

        expect(o.operation(3, 4)).toEqual(12);
        expect(o.operation(-3, 4)).toEqual(-12);
        expect(o.operation(-3, -4)).toEqual(12);
    });

    it('has precedence 2', function () {
        var o = new Operator('*');

        expect(o.precedence).toEqual(2);
    });
});

describe('Division', function () {
    it('divides two values', function () {
        var o = new Operator('/');

        expect(o.operation(3, 4)).toEqual(0.75);
        expect(o.operation(-3, 4)).toEqual(-0.75);
        expect(o.operation(-3, -4)).toEqual(0.75);
    });

    it('has precedence 2', function () {
        var o = new Operator('/');

        expect(o.precedence).toEqual(2);
    });
});

describe('parseDigit', function () {
    it('takes an input character and adds it to global numtoken', function () {
        parseDigit("3");
        expect(numToken.getValue()).toEqual("3");
        parseDigit(".");
        parseDigit("4");
        expect(numToken.getValue()).toEqual("3.4");
    });
});

describe('parseString', function () {
    it('parseString("55+55*55-55.10");', function () {
        console.log("Parse TEST");
        var root = parseString("55+55*55-55.10");
        expect(printAST(root)).toEqual("55+55*55-");
    });
    it('parseString("34-55");', function () {
        console.log("Parse TEST");
        var root = parseString("34-55");
        expect(printAST(root)).toEqual("34-");
    });
    it('parseString("3+4*5");', function () {
        console.log("Parse TEST");
        var root = parseString("3+4*5");
        expect(printAST(root)).toEqual("3+4*");
    });
});

describe('parseString =', function () {
    it('parseString(""55+55*55-55.10="");', function () {
        console.log("Parse TEST");
        var root = parseString("55+55*55-55.10=");
        expect(numToken.getValue()).toEqual("3024.9");
    });
    it('parseString("34-55=");', function () {
        console.log("Parse TEST");
        var root = parseString("34-55=");
        expect(numToken.getValue()).toEqual("-21");
    });
    it('parseString("3+4*5=");', function () {
        console.log("Parse TEST");
        var root = parseString("3+4*5=");
        expect(numToken.getValue()).toEqual("23");
    });
    it('parseString("6-6=+");', function () {
        console.log("Parse TEST");
        var root = parseString("6-6=+");
        expect(numToken.getValue()).toEqual("");
        expect(entryField.getValue()).toEqual("+");
        expect(historyField.getValue()).toEqual("0+");
    });
});

describe('parseString CE', function () {
    it('parseString("<");', function () {
        console.log("Parse TEST");
        var root = parseString("<");
        expect(numToken.getValue()).toEqual("");
        expect(entryField.getValue()).toEqual("");
        expect(historyField.getValue()).toEqual("");
    });
    it('parseString("3<");', function () {
        console.log("Parse TEST");
        var root = parseString("3<");
        expect(numToken.getValue()).toEqual("");
        expect(entryField.getValue()).toEqual("");
        expect(historyField.getValue()).toEqual("");
    });
    it('parseString("3+<");', function () {
        console.log("Parse TEST");
        var root = parseString("3+<");
        expect(root).toEqual(null);
        expect(numToken.getValue()).toEqual("3");
        expect(entryField.getValue()).toEqual("3");
        expect(historyField.getValue()).toEqual("");
    });
    it('parseString("3+<<");', function () {
        console.log("Parse TEST");
        var root = parseString("3+<<");
        expect(root).toEqual(null);
        expect(numToken.getValue()).toEqual("");
        expect(entryField.getValue()).toEqual("");
        expect(historyField.getValue()).toEqual("");
    });
    it('parseString("34-55<");', function () {
        console.log("Parse TEST");
        var root = parseString("34-55<");
        expect(historyField.getValue()).toEqual("34-");
    });
    it('parseString("3+4*<");', function () {
        console.log("Parse TEST");
        var root = parseString("3+4*<");
        expect(numToken.getValue()).toEqual("4");
        expect(historyField.getValue()).toEqual("3+");
    });
    it('parseString("3*4+<");', function () {
        console.log("Parse TEST");
        var root = parseString("3*4+<");
        expect(numToken.getValue()).toEqual("4");
        expect(historyField.getValue()).toEqual("3*");
    });
    it('parseString("3+4*6*<");', function () {
        console.log("Parse TEST");
        var root = parseString("3+4*6*<");
        expect(numToken.getValue()).toEqual("6");
        expect(historyField.getValue()).toEqual("3+4*");
    });
    it('parseString("6-4-4-<");', function () {
        console.log("Parse TEST");
        var root = parseString("6-4-4-<");
        expect(numToken.getValue()).toEqual("4");
        expect(historyField.getValue()).toEqual("6-4-");
    });
});

describe('NumToken', function () {
    it('isEmpty()', function () {
        numToken.clear();
        expect(numToken.isEmpty()).toEqual(true);
    });
});