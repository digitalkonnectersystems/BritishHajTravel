import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url');
  if (!source) {
    return NextResponse.json({ error: 'TikTok video URL is required.' }, { status: 400 });
  }

  let videoUrl: URL;
  try {
    videoUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: 'TikTok video URL is invalid.' }, { status: 400 });
  }

  const isTikTokHost = videoUrl.hostname === 'tiktok.com' || videoUrl.hostname.endsWith('.tiktok.com');
  if (videoUrl.protocol !== 'https:' || !isTikTokHost || videoUrl.username || videoUrl.password) {
    return NextResponse.json({ error: 'Only HTTPS TikTok video URLs are supported.' }, { status: 400 });
  }

  try {
    const oembedUrl = new URL('https://www.tiktok.com/oembed');
    oembedUrl.searchParams.set('url', videoUrl.toString());
    const response = await fetch(oembedUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`TikTok oEmbed request failed with status ${response.status}.`);
      return NextResponse.json({ error: 'TikTok could not resolve this video URL.' }, { status: 502 });
    }

    const result: { embed_product_id?: unknown } = await response.json();
    const videoId = typeof result.embed_product_id === 'string'
      ? result.embed_product_id
      : typeof result.embed_product_id === 'number'
        ? String(result.embed_product_id)
        : '';
    if (!/^\d+$/.test(videoId)) {
      console.error('TikTok oEmbed returned an invalid video ID.');
      return NextResponse.json({ error: 'TikTok returned an invalid video embed.' }, { status: 502 });
    }

    return NextResponse.json({
      embedUrl: `https://www.tiktok.com/player/v1/${videoId}?music_info=1&description=1`,
    });
  } catch (error) {
    console.error('TikTok oEmbed lookup failed:', error);
    return NextResponse.json({ error: 'Unable to contact TikTok to resolve this video.' }, { status: 502 });
  }
}
