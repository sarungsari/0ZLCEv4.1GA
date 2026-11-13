import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {sessionSyncPlugin} from './vite-session-sync.ts';

/**
 * Vite build plugin:
 * Menyuntikkan daftar deterministik bundel CSS/JS/modulepreload awal (CORE_BUILD_ASSETS)
 * dan chunk tab lazy (OPTIONAL_BUILD_ASSETS) ke dalam dist/sw.js saat produksi dibangun.
 */
function swPrecacheManifestPlugin(): Plugin {
  return {
    name: 'zlce-sw-precache-manifest',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve('dist');
      const distIndexPath = path.join(distDir, 'index.html');
      const distSwPath = path.join(distDir, 'sw.js');
      const distAssetsDir = path.join(distDir, 'assets');

      if (!fs.existsSync(distIndexPath) || !fs.existsSync(distSwPath)) {
        return;
      }

      const indexHtml = fs.readFileSync(distIndexPath, 'utf8');
      const coreAssets = new Set<string>();

      const scriptRegex = /<script[^>]+src="([^"]+)"/gi;
      const linkRegex = /<link[^>]+rel="(?:stylesheet|modulepreload)"[^>]+href="([^"]+)"/gi;
      let match: RegExpExecArray | null;

      while ((match = scriptRegex.exec(indexHtml)) !== null) {
        if (match[1].startsWith('/')) coreAssets.add(match[1]);
      }
      while ((match = linkRegex.exec(indexHtml)) !== null) {
        if (match[1].startsWith('/')) coreAssets.add(match[1]);
      }

      const optionalAssets: string[] = [];
      if (fs.existsSync(distAssetsDir)) {
        const entries = fs.readdirSync(distAssetsDir, {withFileTypes: true});
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          if (!/\.(?:js|css)$/i.test(entry.name)) continue;
          const assetUrl = `/assets/${entry.name}`;
          if (!coreAssets.has(assetUrl)) {
            optionalAssets.push(assetUrl);
          }
        }
      }

      const coreListJson = JSON.stringify(Array.from(coreAssets).sort()).slice(1, -1);
      const optionalListJson = JSON.stringify(optionalAssets.sort()).slice(1, -1);

      let swCode = fs.readFileSync(distSwPath, 'utf8');
      swCode = swCode.replace('/*__ZLCE_CORE_BUILD_ASSETS__*/', coreListJson);
      swCode = swCode.replace('/*__ZLCE_OPTIONAL_BUILD_ASSETS__*/', optionalListJson);
      fs.writeFileSync(distSwPath, swCode, 'utf8');
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode ?? 'development', process.cwd(), '');
  const disableHmr =
    process.env.DISABLE_HMR === 'true' ||
    process.env.DISABLE_HMR === '1' ||
    env.DISABLE_HMR === 'true' ||
    env.DISABLE_HMR === '1';

  if (disableHmr) {
    process.env.DISABLE_HMR = 'true';
  }

  return {
    plugins: [react(), tailwindcss(), sessionSyncPlugin(), swPrecacheManifestPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('src'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 20,
              },
            ],
          },
        },
      },
    },
    server: {
      host: process.env.HOST || '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: !disableHmr,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: disableHmr ? null : {},
    },
  };
});
