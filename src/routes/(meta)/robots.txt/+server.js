import { text } from '@sveltejs/kit';
import { generateRobotsTxt } from '$lib/meta/robots.js';
import { robotsConfig } from '../config.js';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async ({ url }) => {
  const robotsTxt = generateRobotsTxt(url, robotsConfig);
  return text(robotsTxt);
};
