#!/usr/bin/env node

/**
 * Script to ensure favicon.png has an alpha channel
 *
 * This processes the source favicon to add a transparent alpha channel,
 * which ensures all generated icon variants (apple-touch-icons, favicons)
 * will also have alpha channels.
 *
 * Requires sharp to be installed (comes with vite-imagetools)
 *
 * Usage:
 *   node make-favicon-transparent.js
 *   node make-favicon-transparent.js path/to/input.png path/to/output.png
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default paths
const DEFAULT_INPUT = './src/routes/(meta)/favicon.png';
const DEFAULT_OUTPUT = './src/routes/(meta)/favicon-transparent.png';

/**
 * Find sharp module in node_modules (pnpm structure)
 *
 * @returns {string|null} Path to sharp module
 */
function findSharpModule() {
  const pnpmDir = join(__dirname, 'node_modules', '.pnpm');

  try {
    const entries = readdirSync(pnpmDir);
    const sharpEntry = entries.find(entry => entry.startsWith('sharp@'));

    if (sharpEntry) {
      return join(pnpmDir, sharpEntry, 'node_modules', 'sharp', 'lib', 'index.js');
    }
  } catch {
    // pnpm structure not found
  }

  return null;
}

/**
 * Process an image to ensure it has an alpha channel
 *
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 */
async function makeTransparent(inputPath, outputPath) {
  console.log(`Processing: ${inputPath}`);

  try {
    // Find and import sharp
    let sharp;

    const sharpPath = findSharpModule();
    if (sharpPath) {
      console.log(`Found sharp at: ${sharpPath}`);
      const sharpModule = await import(sharpPath);
      sharp = sharpModule.default;
    } else {
      throw new Error('Could not find sharp in node_modules');
    }

    const imageBuffer = readFileSync(resolve(inputPath));

    // Get metadata from input
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`Input PNG info:`, {
      format: metadata.format,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      space: metadata.space
    });

    // Process with Sharp: match the working favicon-hkdigital.png format
    // Just ensure alpha without any other transformations
    const processed = await sharp(imageBuffer)
      .ensureAlpha()
      .toBuffer();

    // Write the processed image
    writeFileSync(resolve(outputPath), processed);

    console.log(`✓ Successfully processed and saved to: ${outputPath}`);
    console.log(`  Image now has alpha channel`);
  } catch (error) {
    console.error(`✗ Error processing image:`, error.message);
    console.error(`\nMake sure vite-imagetools is installed:`);
    console.error(`  pnpm add -D vite-imagetools`);
    process.exit(1);
  }
}

// Get paths from command line arguments or use defaults
const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

// Run the processing
makeTransparent(inputPath, outputPath);
