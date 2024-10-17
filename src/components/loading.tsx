import React from 'react';
import LoadSpinner from '@/components/load-spinner';

function Load() {
	return (
		<div className="w-full h-full flex justify-center items-center text-9xl">
			<LoadSpinner />
		</div>
	);
}

export default function Loading({ children }: { children: React.ReactNode }) {
	return <React.Suspense fallback={<Load />}>{children}</React.Suspense>;
}
