tsc ./src/ChonmageCompiler.ts --out ./tmp/ChonmageCompiler.js
tsc -d ./src/ChonmageCompiler.ts --out ./dest/ChonmageCompiler.d.ts
cat ./tmp/ChonmageCompiler.js ./lib/typescriptService.js > ./dest/ChonmageCompiler.js

tsc ./src/ChonmageTemplate.ts --out ./dest/ChonmageTemplate.js
tsc -d ./src/ChonmageTemplate.ts --out ./dest/ChonmageTemplate.d.ts

node ./scripts/compile_meta_template.js
