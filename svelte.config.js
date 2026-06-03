import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Static-SPA mode: emit a fallback page so client-side routing handles
		// dynamic routes like /game/[matchId] without a server.
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
