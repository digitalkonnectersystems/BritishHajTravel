import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const apiKey = searchParams.get('apiKey');

  if (!placeId || !apiKey) {
    return NextResponse.json({ error: 'Missing placeId or apiKey' }, { status: 400 });
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,user_ratings_total,rating&key=${apiKey}`;
    
    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || 'Failed to fetch reviews from Google' }, { status: 400 });
    }

    return NextResponse.json({
      reviews: data.result.reviews || [],
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
    });
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
