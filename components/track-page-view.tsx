'use client';

import { useEffect } from 'react';

interface TrackPageViewProps {
  type: 'blog' | 'project';
  id: string;
}

/**
 * Client Component: Track Page View
 * 
 * Tracks page visits by calling the track-view API when the component mounts.
 * Only tracks once per page load to avoid duplicate counts.
 */
export function TrackPageView({ type, id }: TrackPageViewProps) {
  useEffect(() => {
    // Only track if we have valid type and id
    if (!type || !id) {
      return;
    }

    // Track the view
    const trackView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, id }),
        });
      } catch (error) {
        // Silently fail - we don't want to break the page if tracking fails
        console.error('Failed to track page view:', error);
      }
    };

    trackView();
  }, [type, id]);

  // This component doesn't render anything
  return null;
}

