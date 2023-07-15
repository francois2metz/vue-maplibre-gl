import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import banner from 'vite-plugin-banner';
import { resolve } from 'path';
// @ts-ignore - Webstorm is complaining somehow
import pkg from './package.json' assert { type: 'json' };
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: [
			{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
			{ find: /^~(.+)/, replacement: '$1' }
		]
	},
	plugins: [
		vue(),
		dts({ insertTypesEntry: true }),
		banner(`/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author.name}
* @license ${pkg.license}
*/`)
	],
	ssr    : {
		external: [ 'vue', 'maplibre-gl', 'geojson', 'mitt' ]
	},
	build  : {
		cssCodeSplit : true,
		sourcemap    : true,
		lib          : {
			entry   : resolve(__dirname, 'src/lib/main.ts'),
			name    : 'VueMaplibreGl',
			fileName: format => `vue-maplibre-gl.${format}.js`
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: [
				'vue',
				'maplibre-gl',
				'geojson',
				'mitt'
			],
			output  : {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === 'main.css') {
						return 'vue-maplibre-gl.css';
					}
					return assetInfo.name;
				},
				exports       : 'named',
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue          : 'Vue',
					'maplibre-gl': 'maplibregl',
					mitt         : 'mitt',
					geojson      : 'geojson'
				},
			},
		}
	},
	server : {
		port : 6731,
		watch: {
			// to avoid full page reloads on file changes
			ignored: [ /\.idea/, /ts\.timestamp-\d+\.mjs/, /\.git/, /node_modules/ ]
		}
	}
});
