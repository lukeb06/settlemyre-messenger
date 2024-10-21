'use client';

import type { Conversation } from '@/lib/server';

import { useRouter } from 'next/navigation';

export default function Conversation({ convo }: { convo: Conversation }) {
	const convoDate = new Date(convo.date);
	const diff = Date.now() - convoDate.getTime();

	const ONE_SECOND = 1000;
	const TEN_SECONDS = 10 * ONE_SECOND;
	const ONE_MINUTE = 60 * ONE_SECOND;
	const ONE_HOUR = 60 * ONE_MINUTE;
	const ONE_DAY = 24 * ONE_HOUR;
	const ONE_WEEK = 7 * ONE_DAY;
	const ONE_MONTH = 30 * ONE_DAY;

	const olderThan10Seconds = diff >= TEN_SECONDS;
	const olderThanAMinute = diff >= ONE_MINUTE;
	const olderThanAnHour = diff >= ONE_HOUR;
	const olderThanADay = diff >= ONE_DAY;
	const olderThanAWeek = diff >= ONE_WEEK;
	const olderThanAMonth = diff >= ONE_MONTH;

	let dateString = '';

	if (diff < TEN_SECONDS) dateString = 'Now';
	if (olderThan10Seconds) dateString = `${Math.floor(diff / ONE_SECOND)}s`;
	if (olderThanAMinute) dateString = `${Math.floor(diff / ONE_MINUTE)}m`;
	if (olderThanAnHour) dateString = `${Math.floor(diff / ONE_HOUR)}h`;
	if (olderThanADay) dateString = `${Math.floor(diff / ONE_DAY)}d`;
	if (olderThanAWeek) dateString = `${Math.floor(diff / ONE_WEEK)}w`;
	if (olderThanAMonth) dateString = `${Math.floor(diff / ONE_MONTH)}mo`;

	const router = useRouter();

	return (
		<a
			href={`/customer/${convo.from}`}
			onClick={(e: any) => {
				e.preventDefault();

				router.push(`/customer/${convo.from}`);
			}}
			onMouseEnter={(e: any) => {
				e.preventDefault();

				router.prefetch(`/customer/${convo.from}`);
			}}
			className={`block relative border-b last:border-b-0 py-2 px-4 w-full ${convo.readStatus ? '' : 'bg-card'}`}
		>
			<div className="flex-grow flex flex-col gap-2">
				<span className="flex flex-row justify-between">
					<p>
						<b>{convo.name}</b>
					</p>
					<p className="text-xs text-muted-foreground">{dateString}</p>
				</span>

				<p>
					<i>{convo.body.length > 28 ? convo.body.slice(0, 28) + '...' : convo.body}</i>
				</p>

				<p>{convo.readStatus ? 'Read' : 'Unread'}</p>
			</div>

			<div className="bg-primary w-2 h-2 rounded-full absolute top-[50%] right-2 -translate-y-1/2"></div>
		</a>
	);
}
