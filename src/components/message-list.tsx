'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Messages } from '@/lib/server';
import MessageCard from './message-card';

import { useRouter, useSearchParams } from 'next/navigation';

import { useStore } from '@/hooks/use-store';

import { Button } from './ui/button';

import { useCookies } from 'next-client-cookies';

export default function MessageList({
	className,
	messages,
	isCustomerPage,
}: {
	className?: string;
	messages: Messages;
	isCustomerPage?: boolean;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const searchParams = useSearchParams();

	const [store, setStore]: any = useStore();

	const [pixelsScrolledUp, setPixelsScrolledUp] = useState(0);

	const cookies = useCookies();

	const doScroll = () => {
		if (store.prevLength === messages.length) return;

		setStore({ prevLength: messages.length });
		if (scrollRef.current && bottomRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

			const m = searchParams.get('m');
			if (m) {
				const message = scrollRef.current.querySelector(`#message-${m}`);
				if (message) {
					setTimeout(() => {
						message.scrollIntoView();
						router.replace('/');
					});
				}
			}
		}
	};

	const scrollToBottom = () => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView();
		}
	};

	const onScroll = (e: any) => {
		const scrollTop = e.target.scrollTop;
		const clientHeight = e.target.clientHeight;
		const scrollHeight = e.target.scrollHeight;

		setPixelsScrolledUp(scrollHeight - (scrollTop + clientHeight));
	};

	useEffect(doScroll, [messages]);

	useEffect(() => {
		setTimeout(() => {
			router.refresh();
		});

		const interval = setInterval(() => {
			router.refresh();
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div
			className={`w-full px-2 ${isCustomerPage ? 'h-[70%]' : 'h-[85%]'} ${isCustomerPage ? 'md:h-[80vh]' : 'md:h-[90vh]'} md:!py-5 ${className}`}
		>
			<div
				ref={scrollRef}
				onScroll={onScroll}
				className="overflow-y-auto overflow-x-hidden text-5xl w-full h-full p-5 rounded-xl border-2"
			>
				{messages
					.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
					.map((message, index) => (
						<MessageCard
							key={index}
							message={message}
							isCustomerPage={isCustomerPage}
						/>
					))}
				<div ref={bottomRef}></div>
			</div>
			{!isCustomerPage ? (
				<ScrollToBottom
					scrollToBottom={scrollToBottom}
					pixelsScrolledUp={pixelsScrolledUp}
				/>
			) : (
				<></>
			)}
		</div>
	);
}

function ScrollToBottom({
	scrollToBottom,
	pixelsScrolledUp,
}: {
	scrollToBottom: () => void;
	pixelsScrolledUp: number;
}) {
	return pixelsScrolledUp > 1000 ? (
		<Button variant="ghost" onClick={scrollToBottom} size="sm" className="block mx-auto">
			Scroll to bottom
		</Button>
	) : (
		<></>
	);
}
