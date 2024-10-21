'use client';

import React, { useState, useEffect } from 'react';

import type { Conversation } from '@/lib/server';
import { SERVER, updateToken } from '@/lib/server';

import Convo from '@/components/conversation';
import { useCookies } from 'next-client-cookies';

export default function ClientConversations() {
	const [convos, setConvos] = useState<Conversation[]>([]);
	const [isLoading, setLoading] = useState(true);
	const cookies = useCookies();

	useEffect(() => {
		const token = cookies.get('token');
		if (!token) return;

		updateToken(token);
		const fetchConvos = async () => {
			setLoading(true);
			const convos = await SERVER.getRecentConversations.query();
			setConvos(convos);
			setLoading(false);
		};
		fetchConvos();
	}, []);

	return (
		<div>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<div>
					{convos.map((convo, i) => (
						<Convo convo={convo} key={i} />
					))}
				</div>
			)}
		</div>
	);
}
