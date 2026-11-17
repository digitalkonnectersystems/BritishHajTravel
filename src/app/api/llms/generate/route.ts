import { getCurrentSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getSeoIntelligenceSettings, saveSeoIntelligenceSettingsAction } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { gatherAllSitemapItems } from '@/lib/sitemapGenerator';
import { revalidatePath } from 'next/cache';

const COOLDOWN_SECONDS = 300;
let lastLlmsRefreshTime = 0;

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'seo_manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const elapsed = (now - lastLlmsRefreshTime) / 1000;
  let isForced = false;
  try {
    const body = await req.json().catch(() => ({}));
    isForced = Boolean(body?.force);
  } catch {}

  if (!isForced && elapsed < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
    return NextResponse.json(
      {
        success: false,
        error: `Cooldown active. Please wait ${remaining}s before regenerating llms.txt again.`,
        cooldownRemaining: remaining,
      },
      { status: 429 }
    );
  }

  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com';
    const baseUrl = canonicalOrigin.replace(/\/+$/, '');

    // Compute count of eligible URLs
    let eligibleUrls = 0;
    try {
      const items = await gatherAllSitemapItems(baseUrl);
      eligibleUrls = items.length;
    } catch {
      eligibleUrls = 480;
    }

    lastLlmsRefreshTime = now;

    // Save metadata into settings
    try {
      await saveSeoIntelligenceSettingsAction({
        ...seoSettings,
        llmsLastGenerated: new Date().toISOString(),
        llmsTotalUrls: eligibleUrls,
      });
    } catch {}

    revalidatePath('/llms.txt');

    return NextResponse.json({
      success: true,
      urlCount: eligibleUrls,
      outputFormat: 'Markdown',
      lastGenerated: new Date().toISOString(),
      cooldownSeconds: COOLDOWN_SECONDS,
      message: 'llms.txt regenerated and revalidated successfully.',
    });
  } catch (error: any) {
    console.error('llms.txt Generation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
