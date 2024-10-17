import { SERVER } from '@/lib/server';

import MessageCard from './message-card';
import MessageList from './message-list';

import { cookies } from 'next/headers';

export default async function MessageArea({ className }: { className: string }) {
	const search = cookies().get('search')?.value || '';
	const messages = await SERVER.getMessages.query({ search });

	return <MessageList messages={messages} />;
}
