// Como cargarTs, pero para un modulo que importa valores de otros archivos: los resuelve con el
// esbuild que trae Vite. Las imagenes se cargan vacias.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);

export async function bundleTs(rutaDesdeSrc) {
  const { outputFiles } = await build({
    entryPoints: [fileURLToPath(new URL(`../src/${rutaDesdeSrc}`, import.meta.url))],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    mainFields: ['module', 'main'],
    // Compartir React con react-dom/server: dos copias rompen los hooks de los iconos.
    plugins: [{
      name: 'shared-react',
      setup(builder) {
        builder.onResolve({ filter: /^react(?:\/|$)/ }, ({ path }) => ({
          path: pathToFileURL(require.resolve(path)).href,
          external: true,
        }));
      },
    }],
    write: false,
    loader: { '.jpg': 'empty', '.png': 'empty', '.css': 'empty' },
    logLevel: 'silent',
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
}
