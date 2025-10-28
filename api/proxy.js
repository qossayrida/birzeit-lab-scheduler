/**
 * Cloudflare Worker / Netlify / Vercel Serverless Function
 * Proxies requests to Ritaj to bypass CORS
 */

// Whitelist of allowed hosts
const ALLOWED_HOSTS = ['ritaj.birzeit.edu'];

// For Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};

// For Netlify/Vercel (export as handler)
export async function handler(event, context) {
  const request = new Request(event.rawUrl || `https://${event.headers.host}${event.path}`, {
    method: event.httpMethod,
    headers: event.headers,
  });
  
  const response = await handleRequest(request);
  
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  };
}

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Parse URL
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url parameter', { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Validate target URL
  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch (error) {
    return new Response('Invalid URL', { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Check if host is whitelisted
  if (!ALLOWED_HOSTS.includes(parsedTarget.hostname)) {
    return new Response('Host not allowed', { 
      status: 403,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Check if path is allowed
  if (!parsedTarget.pathname.startsWith('/hemis/bu-courses-list')) {
    return new Response('Path not allowed', { 
      status: 403,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Fetch the target URL
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    // Get the response body
    const body = await response.text();

    // Return with CORS headers
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    return new Response(`Fetch error: ${error.message}`, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
