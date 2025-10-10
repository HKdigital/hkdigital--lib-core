import { error } from '@sveltejs/kit';

export const trailingSlash = 'always';

export async function load({ cookies }) {
  try {
    // Get scaling state from cookie first, then URL params as override
    let scalingEnabled = cookies.get('scalingEnabled') === 'true';

    // console.log('+layout.server.js',{scalingEnabled});

    return { 
      scalingEnabled
    };
  } catch (err) {
    console.error('Error in examples load function:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}
