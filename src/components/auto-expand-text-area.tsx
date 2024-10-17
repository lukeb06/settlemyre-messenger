'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/hooks/use-store';

const AutoExpandTextArea = ({ cref }: { cref: any }) => {
	const [store, setStore]: any = useStore();

	const tRef = useRef<HTMLTextAreaElement>(null);

	const autoExpand = () => {
		setTimeout(() => {
			const t = tRef.current;
			if (!t) return;

			t.style.cssText = 'height: auto;';
			t.style.cssText = `height: ${7 + t.scrollHeight}px;`;

			if (t.clientHeight > 64 && t.parentElement?.style) {
				t.parentElement.style.cssText += `border-radius: 1rem !important;`;
			} else {
				if (t.parentElement?.style) {
					t.parentElement.style.cssText = t.parentElement.style.cssText.replace(
						'border-radius: 1rem !important;',
						'',
					);
				}
			}
		}, 1);
	};

	useEffect(() => {
		autoExpand();

		window.onresize = autoExpand;
	}, []);

	return (
		<>
			<textarea
				rows={1}
				ref={mergeRefs(tRef, cref)}
				className="w-full h-16 pt-3 pb-1 px-5 rounded-lg max-h-[17vh] md:max-h-[10vh] bg-transparent resize-none"
				placeholder="Type a message..."
				onChange={autoExpand}
				onKeyDown={autoExpand}
				onPaste={autoExpand}
			/>
		</>
	);
};

export default AutoExpandTextArea;

function mergeRefs(...inputRefs: any[]) {
	return (ref: any) => {
		inputRefs.forEach(inputRef => {
			if (!inputRef) {
				return;
			}

			if (typeof inputRef === 'function') {
				inputRef(ref);
			} else {
				// eslint-disable-next-line no-param-reassign
				inputRef.current = ref;
			}
		});
	};
}
