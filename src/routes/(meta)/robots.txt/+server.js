
import { text } from '@sveltejs/kit';

const robots = 
  'User-agent: *\n' + 
  'Allow: /';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async () => {
  return text( robots );
};
