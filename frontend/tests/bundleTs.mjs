// Como cargarTs, pero para un modulo que importa valores de otros archivos: los resuelve con el
// esbuild que trae Vite. Las imagenes se cargan vacias.
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

export async function bundleTs(rutaDesdeSrc) {
  const { outputFiles } = await build({
    entryPoints: [fileURLToPath(new URL(`../src/${rutaDesdeSrc}`, import.meta.url))],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
    loader: { '.jpg': 'empty', '.png': 'empty' },
    logLevel: 'silent',
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
}
