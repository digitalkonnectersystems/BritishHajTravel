import { getCurrentSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getSeoIntelligenceSettings, saveSeoIntelligenceSettingsAction } from '@/actions/pageActions';
import { revalidatePath } from 'next/cache';

const COOLDOWN_SECONDS = 300;
let lastRobotsRefreshTime = 0;

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'seo_manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const elapsed = (now - lastRobotsRefreshTime) / 1000;
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
        error: `Cooldown active. Please wait ${remaining}s before refreshing robots.txt again.`,
        cooldownRemaining: remaining,
      },
      { status: 429 }
    );
  }

  try {
    const seoSettings = await getSeoIntelligenceSettings();
    lastRobotsRefreshTime = now;

    // Save refresh timestamp
    try {
      await saveSeoIntelligenceSettingsAction({
        ...seoSettings,
        robotsLastGenerated: new Date().toISOString(),
      });
    } catch {}

    revalidatePath('/robots.txt');

    return NextResponse.json({
      success: true,
      lastGenerated: new Date().toISOString(),
      cooldownSeconds: COOLDOWN_SECONDS,
      message: 'Robots.txt refreshed and cache revalidated successfully.',
    });
  } catch (error: any) {
    console.error('Robots.txt Refresh Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
