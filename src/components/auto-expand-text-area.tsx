'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/hooks/use-store';
import type { Messages } from '@/lib/server';

import { getSuggestedMessage } from '@/lib/server';

const AutoExpandTextArea = ({ cref, messages }: { cref: any; messages: Messages }) => {
	const [store, setStore]: any = useStore();
	const [updates, setUpdates]: any = useState(0);
	const [ai, setAI] = useState('');

	const tRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (updates < 2) {
			setUpdates(updates + 1);

			if (messages && messages.length > 0) {
				getSuggestedMessage(messages, true).then((response: any) => {
					if (!response || !response.body) return;

					const reader = response.body.getReader();

					const readChunk = (): any => {
						return reader.read().then(({ done, value }: any) => {
							if (done) return;

							// Decode the chunk of data (assuming UTF-8 encoding)
							const textChunk = new TextDecoder('utf-8').decode(value);

							// Process the text chunk
							setAI(c => c + textChunk);
							// console.log(textChunk);

							// Read the next chunk
							return readChunk();
						});
					};

					readChunk();
				});
			}
		}
	}, [messages]);

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

	useEffect(() => {
		if (!tRef.current || !ai) return;
		tRef.current.placeholder = ai;
		autoExpand();
	}, [ai]);

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
