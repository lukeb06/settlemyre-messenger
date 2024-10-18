import MessageArea from '@/components/message-area';

import Navbar from '@/components/navbar';

import Loading from '@/components/loading';

export default function Page() {
	return (
		<>
			<Navbar />
			<Loading>
				<MessageArea className="w-full h-full" />
			</Loading>
		</>
	);
}
