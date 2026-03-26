/**
 * MiniMax API Relay Worker
 * Forwards requests from European edge nodes to China servers
 *
 * Usage:
 * 1. Deploy to Cloudflare Workers
 * 2. Set environment variable MINIMAX_API_KEY
 * 3. Configure client BaseURL to Worker URL
 */

const MINIMAX_API_HOST = 'api.minimaxi.com/anthropic';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: { message: 'Method not allowed, use POST' } }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.MINIMAX_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: 'MINIMAX_API_KEY not configured' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.json();

      // Get original path, strip prefix if any
      const url = new URL(request.url);
      const path = url.pathname;

      // Build forwarded target URL
      const forwardedUrl = `https://${MINIMAX_API_HOST}${path}`;

      // Build forwarded request
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${env.MINIMAX_API_KEY}`);

      // Preserve other headers from original request (except host)
      for (const [key, value] of request.headers.entries()) {
        if (key.toLowerCase() !== 'host') {
          headers.set(key, value);
        }
      }

      const forwardedRequest = new Request(forwardedUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const response = await fetch(forwardedRequest);

      // Check if this is a streaming response
      const contentType = response.headers.get('Content-Type') || '';
      const isStreaming = contentType.includes('stream') ||
                          response.headers.get('Transfer-Encoding') === 'chunked';

      if (isStreaming) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const responseBody = await response.text();

      // Return response with CORS headers
      return new Response(responseBody, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Relay error:', error);
      return new Response(
        JSON.stringify({
          error: { message: error.message || 'Internal server error' }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
};
