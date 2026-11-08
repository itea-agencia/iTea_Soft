// Carga un modulo .ts de src/ sin bundler: lo transpila con el typescript del proyecto y lo
// importa desde un data: URL. Sirve para funciones puras; un modulo que importa valores de
// otros archivos (no solo tipos) no resuelve esos imports.
import { readFileSync } from 'node:fs';
import ts from 'typescript';

export async function cargarTs(rutaDesdeSrc) {
  const source = readFileSync(new URL(`../src/${rutaDesdeSrc}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
