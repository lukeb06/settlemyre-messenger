'use client';

import React, { useState, useEffect } from 'react';

import { Switch } from '@/components/ui/switch';
import type { User } from '@/lib/server';

import { SERVER } from '@/lib/server';
import { useMediaQuery } from '@/hooks/use-media-query';

const CustomerData = ({ user }: { user: User }) => {
	const isDesktop = useMediaQuery('md');

	return <>{isDesktop ? <CustomerDataMobile user={user} /> : <></>}</>;
};

export function CustomerDataMobile({ user }: { user: User }) {
	const [defaultChecked, setDefaultChecked] = useState(user?.include_in_marketing_mailouts);

	const [isUpdating, setIsUpdating] = useState(false);

	const updateSubscription = async (checked: boolean) => {
		if (!user) return;

		setIsUpdating(true);
		setDefaultChecked(checked);

		console.log(user.customer_number, checked);

		const { success, reason } = await SERVER.updateSubscription.mutate({
			cust_no: user.customer_number,
			status: checked,
		});

		console.log(reason);

		setIsUpdating(false);
		if (!success) {
			setDefaultChecked(!checked);
		}
	};

	return (
		<div className="px-3 md:!py-5 pb-0 !h-[75%] md:!h-[85%]">
			<div className="text-2xl md:text-3xl whitespace-nowrap">
				<span>{user?.name}</span>
			</div>
			<div className="text-base md:text-lg text-left whitespace-nowrap">
				{user?.customer_number ? (
					<>
						<br />
						<b>Customer #:</b> {user.customer_number}
					</>
				) : (
					<></>
				)}

				{user?.email ? (
					<>
						<br />
						<b>Email:</b> {user.email}
					</>
				) : (
					<></>
				)}

				<>
					<br />
					<b>Loyalty Points:</b> {user?.loyalty_points || 0}
				</>

				{user?.last_sale_date ? (
					<>
						<br />
						<b>Last Sale Date:</b> {new Date(user.last_sale_date).toLocaleDateString()}
					</>
				) : (
					<></>
				)}

				{user?.last_sale_amount ? (
					<>
						<br />
						<b>Last Sale Amount:</b>
						{' $'}
						{user.last_sale_amount.toFixed(2)}
					</>
				) : (
					<></>
				)}

				{user?.category_code ? (
					<>
						<br />
						<b>Category:</b> {user.category_code}
					</>
				) : (
					<></>
				)}

				{user?.include_in_marketing_mailouts != undefined && user.customer_number ? (
					<>
						<br />
						<span className="flex flex-row items-center gap-2">
							<b>Subscribed:</b>{' '}
							<Switch
								checked={defaultChecked}
								onCheckedChange={checked => {
									// setDefaultChecked(checked);
									updateSubscription(checked);
								}}
								className="h-4 w-7 translate-y-[1px]"
								disabled={isUpdating}
							/>
						</span>
					</>
				) : (
					<></>
				)}
			</div>
		</div>
	);
}

export default CustomerData;
