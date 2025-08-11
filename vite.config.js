import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { generateViteConfig } from './src/lib/config/vite.js';

export default defineConfig(
	await generateViteConfig({
		enableImagetools: true
	})
);
