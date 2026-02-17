import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/app/actions/user-actions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid-link', request.url));
  }

  const result = await verifyMagicLink(token);

  if (result.success) {
    if (result.needsOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=' + encodeURIComponent(result.error || 'expired'), request.url)
  );
}
