// Lee la Access Key dinámicamente: primero .env (Vite), si no, localStorage
function getAccessKey() {
  const fromEnv = (import.meta.env.VITE_UNSPLASH_KEY ?? '').trim();
  const fromLS =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('unsplash_key') ?? '').trim()
      : '';
  return fromEnv || fromLS;
}

// ✅ export que espera tu VoiceReader
export function hasUnsplashKey() {
  return !!getAccessKey();
}

function authHeaders() {
  return {
    Authorization: `Client-ID ${getAccessKey()}`,
    'Accept-Version': 'v1',
  };
}

function normalize(items) {
  return items
    .map((item) => ({
      url: item?.urls?.regular || item?.urls?.full || item?.urls?.small,
      authorName: item?.user?.name ?? 'Unknown',
      authorLink:
        item?.user?.links?.html ??
        item?.user?.portfolio_url ??
        'https://unsplash.com',
      unsplashLink: item?.links?.html ?? 'https://unsplash.com',
    }))
    .filter((x) => !!x.url);
}

/** Fotos ALEATORIAS por query. Devuelve hasta 30. */
export async function randomImages(query, count = 12) {
  const key = getAccessKey();
  if (!key || !query) {
    if (import.meta.env.DEV) {
      console.log('[Unsplash.random] falta clave o query', {
        hasKey: !!key,
        query,
      });
    }
    return [];
  }

  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  url.searchParams.set('count', String(Math.min(count, 30)));

  if (import.meta.env.DEV) {
    console.log('[Unsplash.random] fetch →', url.toString(), { query, count });
  }

  const res = await fetch(url, { headers: authHeaders() });

  if (import.meta.env.DEV) {
    console.log('[Unsplash.random] status:', res.status);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[Unsplash.random] error:', res.status, text);
    // Fallback: búsqueda clásica
    return await searchImages(query, count);
  }

  const data = await res.json();
  const arr = Array.isArray(data) ? data : [data];
  const list = normalize(arr);

  if (import.meta.env.DEV) {
    console.log('[Unsplash.random] imágenes recibidas:', list.length);
  }

  return list;
}

/** Búsqueda clásica (fallback) */
export async function searchImages(query, count = 12) {
  const key = getAccessKey();
  if (!key || !query) {
    if (import.meta.env.DEV) {
      console.log('[Unsplash.search] falta clave o query', {
        hasKey: !!key,
        query,
      });
    }
    return [];
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', String(Math.min(count, 30)));
  url.searchParams.set('content_filter', 'high');

  if (import.meta.env.DEV) {
    console.log('[Unsplash.search] fetch →', url.toString(), { query, count });
  }

  const res = await fetch(url, { headers: authHeaders() });

  if (import.meta.env.DEV) {
    console.log('[Unsplash.search] status:', res.status);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[Unsplash.search] error:', res.status, text);
    return [];
  }

  const data = await res.json();
  const list = normalize(data.results || []);

  if (import.meta.env.DEV) {
    console.log('[Unsplash.search] imágenes recibidas:', list.length);
  }

  return list;
}