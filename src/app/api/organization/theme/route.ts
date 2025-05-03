import { defaultTheme } from '@/config/theme';
import { NextResponse } from 'next/server';

export async function GET() {
  // In the future, you can modify this to fetch from a database
  // For now, we'll just return the default theme
  
  try {
    // Just returning the default theme for now
    // In production, you would:
    // 1. Get the user's organization ID from the session
    // 2. Look up the organization's theme in the database
    // 3. Fall back to the default theme if none exists
    
    return NextResponse.json(defaultTheme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
  }
} 