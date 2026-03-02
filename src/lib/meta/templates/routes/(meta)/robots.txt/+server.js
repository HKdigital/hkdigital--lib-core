import { text } from '@sveltejs/kit';
import { generateRobotsTxt } from '@hkdigital/lib-core/meta/utils.js';
import { robotsConfig } from '$lib/config/meta.js';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async ({ url }) => {
  const robotsTxt = generateRobotsTxt(url, robotsConfig);
  return text(robotsTxt);
};
