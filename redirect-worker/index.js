// Permanently redirect the retired domains (dinkdata.xyz, dinkdash.xyz and
// their www hosts) to caymandink.com, keeping the path and query string so
// search engines carry rankings over page by page.
const TARGET = 'https://caymandink.com';

export default {
  fetch(request) {
    const url = new URL(request.url);
    return new Response(null, {
      status: 301,
      headers: {
        Location: TARGET + url.pathname + url.search,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  },
};
