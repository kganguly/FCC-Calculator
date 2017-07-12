describe('operand', function () {
    it('stores a token', function () {
        var o = new Operand(12);

        expect(o.token).toEqual("12");
    });
});