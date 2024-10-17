'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(_query: 'sm' | 'md' | 'lg' | 'xl' | 'xxl') {
	const [matches, setMatches] = useState(
		typeof window !== 'undefined' ? window.matchMedia(query[_query]).matches : true,
	);

	const checkMatch = () => {
		if (!window) return;

		const media = window.matchMedia(query[_query]);
		media.onchange = (e: any) => setMatches(e.matches);

		return () => {
			media.onchange = null;
		};
	};

	useEffect(checkMatch, [_query]);
	useEffect(checkMatch, []);

	return matches;
}

export const query = {
	sm: `(min-width: 640px)`,
	md: `(min-width: 768px)`,
	lg: `(min-width: 1024px)`,
	xl: `(min-width: 1280px)`,
	xxl: `(min-width: 1536px)`,
};
