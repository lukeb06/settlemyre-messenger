import type { Messages } from '@/lib/server';
import ClientMessageList from './client-message-list';

export default function MessageList({
	className,
	messages,
	isCustomerPage,
}: {
	className?: string;
	messages: Messages;
	isCustomerPage?: boolean;
}) {
	return (
		<div
			className={`w-full px-2 ${isCustomerPage ? 'h-[70%]' : 'h-[85%]'} ${isCustomerPage ? 'md:h-[80vh]' : 'md:h-[90vh]'} md:!py-5 ${className}`}
		>
			<ClientMessageList
				className={className}
				messages={messages}
				isCustomerPage={isCustomerPage}
			/>
		</div>
	);
}
