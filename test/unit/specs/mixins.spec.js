import mixin from '../../../src/mixins';

describe('Mixins', () => {
    it('stringReplaceAt should replace string', () => {
        var string = 'Test string',
            replacement = '!',
            replaceAt = string.indexOf(' ');

        var result = mixin.methods.stringReplaceAt(string, replacement, replaceAt);

        expect(result).to.equal('Test!string');
    });

    it('getFigureCss should return proper css class', () => {
        var figure = 'k'; // figure is a black king

        var resultCss = mixin.methods.getFigureCss(figure);

        expect(resultCss.fk).to.not.be.undefined;
        expect(resultCss.fk).to.equal(true);
    });
});