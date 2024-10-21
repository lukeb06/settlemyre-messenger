'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import type { Messages } from '@/lib/server';
import Link from 'next/link';

import ViewAttachments from './view-attachments';

type Message = Messages[number];

// TODO
// import ViewAttachments from '@/components/ViewAttachments.jsx';

// Convert phone number from +1234567890 to 123-456-7890
const formatPhoneNumber = (number: string) => {
	return number?.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
};

export default function MessageCard({
	message,
	isCustomerPage,
}: {
	message: Message;
	isCustomerPage?: boolean;
}) {
	const isUserMessage = message.direction == 'OUTBOUND';
	const userPhone = isUserMessage ? message.to_phone : message.from_phone;

	const links = message.body?.match(/(https?:\/\/[^\s]+)/g) || [];
	let messageBody = message.body || '';

	links?.forEach((link, i) => {
		messageBody = messageBody.replace(link, `Link ${i + 1}`);
	});

	return (
		<div
			id={`message-${message.id}`}
			className={`flex ${
				isUserMessage ? 'flex-row-reverse' : 'flex-row'
			} my-4 first:mt-0 last:mb-0 w-full`}
		>
			<Card
				className={`w-fit min-w-[30%] bg-accent max-w-[90%] md:max-w-[50%] ${
					isUserMessage ? 'bg-primary text-white' : ''
				}`}
			>
				<CardHeader className="p-3 pb-1">
					<CardTitle className="text-lg">
						<span>{message.name}</span>{' '}
						{message.category ? (
							<span
								className={`text-xs !m-0${
									isUserMessage
										? ' text-primary-foreground dark:text-gray-200'
										: ''
								}`}
							>
								({message.category})
							</span>
						) : (
							<></>
						)}
					</CardTitle>

					<CardDescription
						className={`!m-0 text-base ${
							isUserMessage ? 'text-primary-foreground dark:text-gray-200' : ''
						}`}
					>
						{isUserMessage ? (
							!isCustomerPage ? (
								<>
									Reply to:
									{/* <a onClick={getUserProfileHandle} href="" className="underline">
									{message.name || 'Unknown'}
								</a> */}
									<Link
										href={`/customer/${userPhone}/${message.id}`}
										className="underline"
									>
										{message.name || 'Unknown'}
									</Link>
								</>
							) : (
								<></>
							)
						) : !isCustomerPage ? (
							<Link
								href={`/customer/${userPhone}/${message.id}`}
								className="underline"
							>
								{formatPhoneNumber(message.from_phone)}
							</Link>
						) : (
							<Link href={`tel:${userPhone}`} className="underline">
								{formatPhoneNumber(message.from_phone)}
							</Link>
						)}
					</CardDescription>
				</CardHeader>

				<CardContent className="p-3 pt-0">
					<p className="text-xl break-words">{messageBody}</p>
					{links.length > 0 ? (
						<p>
							{links.map((link, i) => {
								return (
									<a
										className="text-xl break-words"
										key={i}
										href={link}
										target="_blank"
										rel="noopener noreferrer"
									>
										{link}
									</a>
								);
							})}
						</p>
					) : (
						<></>
					)}
					{/* TODO */}
					{message && message.media && message.media.length > 0 ? (
						<ViewAttachments
							textClass={isUserMessage ? 'text-white' : ''}
							media={message.media}
							date={new Date(message.date)}
						/>
					) : (
						<></>
					)}
				</CardContent>

				<CardFooter className="p-3 pt-0 flex flex-col items-start">
					<CardDescription
						className={`!m-0${
							isUserMessage ? ' text-primary-foreground dark:text-gray-200' : ''
						}`}
					>
						{new Date(message.date).toLocaleString()}
					</CardDescription>
				</CardFooter>
			</Card>
		</div>
	);
}
