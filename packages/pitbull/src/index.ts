import fs from "fs";
import { decode, type SourceMapMappings } from "@jridgewell/sourcemap-codec";
// import { parseSourceMapInput } from './loadSourceMap.js';
import type { SourceMap } from './types.js';

function analyze( code: string, map: SourceMap ) {
  const totalSize = Buffer.byteLength(code);
  const mappings: SourceMapMappings = decode(map.mappings);
  const contributions = new Array(map.sources.length).fill('');
  const codeLines = code.split('\n').map( code => code + '\n' );

  for (let lineIndex = 0; lineIndex < mappings.length; lineIndex++ ) {
    const line = mappings[lineIndex];
    const lineCode = codeLines[lineIndex];

    for (let mappingIndex = 0; mappingIndex < line.length; mappingIndex++ ) {
      // 0: generatedColumn
      // 1: fileIndex
      // 2: originalLine
      // 3: originalColumn
      // 4: nameIndex

      const [ startColumn, fileIndex ] = line[mappingIndex];
      const endColumn = line[mappingIndex + 1]?.[0] ?? lineCode.length;

      // TODO: What if fileIndex is null / undefined?
      contributions[fileIndex!] += lineCode.slice(startColumn, endColumn);
    }
  }

  const data = contributions.reduce( (carry, code, index) => {
    const file = map.sources[index];
    const size = Buffer.byteLength(code);

    carry[file] = {
      size,
      percentage: ( size / totalSize ) * 100
    }

    return carry;
  }, {} )

  return data;
}

// ---------------------------------------------------------------
const code = fs.readFileSync("./mocks/Vite/index.js", "utf8");
const rawMap = fs.readFileSync("./mocks/Vite/index.js.map", "utf8");
// const map = parseSourceMapInput(rawMap);
const result = analyze( code, JSON.parse( rawMap ) );

fs.writeFileSync(
  "output.json",
  JSON.stringify(result, null, 2),
);
