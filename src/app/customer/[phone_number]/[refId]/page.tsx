import { SERVER } from '@/lib/server';
import CustomerPageClient from './client';
import CustomerData from '@/components/customer-data';

import CustomerPageNavbar from '@/components/customer-page-navbar';

import Loading from '@/components/loading';

export default function Page({ params }: { params: { phone_number: string; refId: any } }) {
	return (
		<>
			<CustomerPageNavbar phoneNumber={params.phone_number} refId={params.refId} />
			<Loading>
				<Server params={params} />
			</Loading>
		</>
	);
}

async function Server({ params }: { params: { phone_number: string; refId: any } }) {
	const messages = await SERVER.getMessages.query({
		search: `user:${decodeURIComponent(params.phone_number)}`,
	});

	const user = await SERVER.userProfile.query({ phone_number: params.phone_number });

	return (
		<div className="flex h-full flex-row">
			<CustomerPageClient messages={messages} />
			<CustomerData user={user} />
		</div>
	);
}
