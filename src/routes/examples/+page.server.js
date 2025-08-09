/**
 * Handles form actions for persistent scaling toggle
 */
export const actions = {
  toggleScaling: async ({ request, cookies }) => {
    const data = await request.formData();
    const scalingEnabled = data.get('scalingEnabled') === 'on';
    
    // Store in cookie for persistence across sessions
    cookies.set('scalingEnabled', scalingEnabled.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return {
      success: true,
      scalingEnabled
    };
  }
};

export async function load({ cookies }) {
  // Get scaling state from cookie, default to false
  const scalingEnabled = cookies.get('scalingEnabled') === 'true';
  
  return {
    scalingEnabled
  };
}