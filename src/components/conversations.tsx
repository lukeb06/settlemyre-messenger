import { SERVER } from '@/lib/server';

import Conversation from '@/components/conversation';

import Loading from './loading';

async function ConvoRenderer() {
	const convos = await SERVER.getRecentConversations.query();

	return (
		<>
			{convos.map((convo, i) => (
				<Conversation convo={convo} key={i} />
			))}
		</>
	);
}

export default function Conversations({
	isCustomerPage,
	isCustomRendered,
}: {
	isCustomerPage?: boolean;
	isCustomRendered?: boolean;
}) {
	return (
		<>
			{isCustomRendered ? (
				<Loading>
					<ConvoRenderer />
				</Loading>
			) : (
				<div
					className={`hidden lg:block py-5 pl-2 ${isCustomerPage ? 'h-[70%]' : 'h-[85%]'} ${isCustomerPage ? 'md:h-[80vh]' : 'md:h-[90vh]'}`}
				>
					<div
						className={`flex flex-col rounded-xl border-2 h-full overflow-y-auto w-[300px] max-w-[300px]`}
					>
						<Loading>
							<ConvoRenderer />
						</Loading>
					</div>
				</div>
			)}
		</>
	);
}
