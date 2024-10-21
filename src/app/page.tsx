import MessageArea from '@/components/message-area';
import Conversations from '@/components/conversations';

import Navbar from '@/components/navbar';

import Loading from '@/components/loading';

export default function Page() {
	return (
		<>
			<Navbar />
			<div className="flex flex-row h-full">
				<Conversations />
				<Loading>
					<MessageArea className="w-full h-full" />
				</Loading>
			</div>
		</>
	);
}
