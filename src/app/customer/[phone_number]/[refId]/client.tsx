'use client';

import AutoExpandTextArea from '@/components/auto-expand-text-area';
import LoadSpinner from '@/components/load-spinner';
import MessageArea from '@/components/message-area';
import MessageList from '@/components/message-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { Messages } from '@/lib/server';
import { ImagePlus, Send, Sparkles } from 'lucide-react';

import React, { useRef, useState } from 'react';

import { SERVER } from '@/lib/server';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CustomerPageClient({ messages }: { messages: Messages }) {
	const isDesktop = useMediaQuery('md');

	const searchParams = useSearchParams();

	const pictureUtilsRef = useRef<HTMLDivElement>(null);
	const pictureRef = useRef<HTMLInputElement>(null);
	const pictureButtonRef = useRef<HTMLButtonElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const borderRef = useRef<HTMLDivElement>(null);
	const messageBoxRef = useRef<HTMLTextAreaElement>(null);

	const [sendingMessage, setSendingMessage] = useState(false);

	const router = useRouter();

	const sendMessage = async (e: any) => {
		e.preventDefault();

		setSendingMessage(true);

		const { success } = await SERVER.sendMessage.mutate({
			to: messages.find(m => m.direction == 'INBOUND')?.from_phone || '',
			body: messageBoxRef.current?.value || '',
			category: messages[0].category || 'RETAIL',
			name: messages.find(m => m.direction == 'INBOUND')?.name || '',
		});

		if (!success) {
			alert('There was a problem sending the message.');
		}

		setSendingMessage(false);

		formRef?.current?.reset();
		router.refresh();
	};

	return (
		<div className="flex-grow w-full">
			<MessageList messages={messages} isCustomerPage={true} />

			<div
				className="flex flex-row-reverse gap-4 pt-2 px-3 pb-0 hidden"
				ref={pictureUtilsRef}
			>
				<Button
					onClick={() => {
						if (!pictureRef.current || !pictureUtilsRef.current) return;

						pictureRef.current.value = '';
						pictureButtonRef.current?.classList.remove(
							'bg-primary',
							'text-white',
							'image-input',
							'border-0',
							'aspect-ratio-[1/1]',
						);

						pictureUtilsRef.current.classList.add('hidden');
					}}
					className="p-0 h-fit"
					variant="link"
				>
					Remove Image
				</Button>
			</div>

			<form onSubmit={sendMessage} ref={formRef} className="p-2 flex flex-row">
				<div
					ref={borderRef}
					className="flex flex-grow items-center rounded-full border-2 px-3 pr-1"
				>
					<AutoExpandTextArea cref={messageBoxRef} messages={messages} />

					<Button
						ref={pictureButtonRef}
						className="my-1 mr-2 rounded-full text-base aspect-square"
						size="icon"
						variant="ghost"
						onClick={e => {
							e.preventDefault();
							// pictureRef.current?.click();
							if (!messageBoxRef.current) return;
							messageBoxRef.current.value = messageBoxRef.current.placeholder;
							messageBoxRef.current.placeholder = 'Type a message...';
						}}
					>
						{/* <ImagePlus /> */}
						<Sparkles />
					</Button>
					{/* <Input
						ref={pictureRef}
						id="picture"
						className="hidden"
						type="file"
						accept="image/*"
						onChange={(e: any) => {
							if (!e.target) return;

							const target = e.target as HTMLInputElement;

							if ((target.files?.length || 0) > 0) {
								pictureButtonRef.current?.classList.add(
									'bg-primary',
									'text-white',
									'image-input',
									'border-0',
									'aspect-ratio-[1/1]',
								);

								pictureUtilsRef.current?.classList.remove('hidden');
							} else {
								pictureButtonRef.current?.classList.remove(
									'bg-primary',
									'text-white',
									'image-input',
									'border-0',
									'aspect-ratio-[1/1]',
								);

								pictureUtilsRef.current?.classList.add('hidden');
							}
						}}
					></Input> */}

					<Button
						onClick={sendMessage}
						className="my-1 rounded-full text-base aspect-square"
						size="icon"
					>
						{sendingMessage ? (
							<LoadSpinner classNameSVG="!stroke-white" />
						) : (
							<Send className="text-white" />
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
