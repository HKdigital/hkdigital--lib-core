import { redirect } from '@sveltejs/kit';
import { FOLDER_NAME } from './config.js';

export async function load() {
  // Redirect to root of explorer with folder name so catch-all can detect root
  throw redirect(302, `/explorer/${FOLDER_NAME}/`);
}
