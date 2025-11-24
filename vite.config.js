import { defineConfig } from 'vitest/config';
import { generateViteConfig } from './src/lib/config/vite.js';

export default defineConfig(
	await generateViteConfig({
		enableImagetools: true,
		enableVitestWorkspace: true
	})
);
