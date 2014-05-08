/// <reference path="TestSettings.ts" />
/// <reference path="../src/ChonmageTemplate.ts" />
/// <reference path="ts/ITemplateNodeToProgramContext.ts" />

describe('Chonmage.Compiled', function () {
    it('#render', function () {
        var preCompiled = new Chonmage.Compiled<ITemplateNodeToProgramContext>(function (context) {
            var _ = this, __b = "";
            __b += "string";
            __b += "\n";
            context.section.forEach(function (__item_0) {
                __b += _.esc(__item_0.itemStr);
                __b += _.esc(context.escapedVariable);
                if (!context.invertedSection) {
                    __b += context.unescapedVariable
                }
            });
            __b += "\n";
            return __b;
        });

        var context:ITemplateNodeToProgramContext = {
            numberArr: [1, 2, 3, 4, 5],
            section: [
                {itemStr: 'itemStr1'},
                {itemStr: 'itemStr2'}
            ],
            invertedSection: false,
            escapedVariable: '[<&>\'"]',
            unescapedVariable: 3
        };
        var rendered = preCompiled.render(context)
        var expected = 'string\nitemStr1[&lt;&amp;&gt;&#39;&quot;]3itemStr2[&lt;&amp;&gt;&#39;&quot;]3\n'
        expect(rendered).to.eql(expected);
    });
});
