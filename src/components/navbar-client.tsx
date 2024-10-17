'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';

import { CircleUser } from 'lucide-react';
import { CustomerDataMobile } from '@/components/customer-data';

import { Button } from '@/components/ui/button';
import type { User } from '@/lib/server';

export default function NavbarClient({ user }: { user: User }) {
	const isDesktop = useMediaQuery('lg');

	return (
		<div className="flex flex-grow flex-row justify-center">
			{isDesktop ? (
				<></>
			) : (
				<Drawer>
					<DrawerTrigger asChild>
						<Button className="pl-1 text-white">
							<CircleUser className="mx-2" />
							View Profile
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<CustomerDataMobile user={user} />
						</DrawerHeader>
						<DrawerFooter></DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
		</div>
	);
}
