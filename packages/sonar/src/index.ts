import { readFileSync, writeFileSync } from "fs";
import { parse } from "path";
import { decode, type SourceMapMappings } from "@jridgewell/sourcemap-codec";

export interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
}

function analyze( code: string, map: SourceMap ) {
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
    const bytes = Buffer.byteLength(code);
    const { dir, base } = parse( file );

    carry[file] = {
      dir,
      filename: base,
      bytes,
    }

    return carry;
  }, {} )

  return data;
}

// ---------------------------------------------------------------
const code = readFileSync("../../playground/vite/dist/assets/index-2UIh27I2.js", "utf8");
const rawMap = readFileSync("../../playground/vite/dist/assets/index-2UIh27I2.js.map", "utf8");
const result = analyze( code, JSON.parse( rawMap ) );

writeFileSync(
  "output.json",
  JSON.stringify(result, null, 2),
);
