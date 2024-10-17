'use client';

import React, { useState, useEffect, useRef } from 'react';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@/components/ui/command';

import { Button } from '@/components/ui/button';

import ResponsiveDialog from '@/components/responsive-dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useRouter } from 'next/navigation';

import { useCookies } from 'next-client-cookies';

// Convert ANY format phone number to 123-456-7890
const convertToCounterpointNumber = (phoneNumber: string) => {
	return phoneNumber.replace(/^\.*?(\d{3}).*?(\d{3}).*?(\d{4})$/, '$1-$2-$3');
};

// Convert ANY format phone number to +12345678900
const convertToTwilioNumber = (phoneNumber: string) => {
	return phoneNumber.replace(/^.*?(\d{3}).*?(\d{3}).*?(\d{4})$/, '+1$1$2$3');
};

const Navbar = () => {
	// const isDesktop = useMediaQuery('md');
	const numberRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const cookies = useCookies();

	const setSearch = (value: string) => {
		cookies.set('search', value, { expires: new Date(Date.now() + 1000 * 60 * 60 * 6) });
		router.refresh();
	};

	const startNewChat = () => {
		if (!numberRef.current) return;

		if (numberRef.current.value == '') return alert('Please enter a phone number');

		const counterpointNumber = convertToCounterpointNumber(numberRef.current.value);
		router.push('/customer/' + encodeURIComponent(counterpointNumber));
	};

	return (
		<NavigationMenu className="p-2 z-50">
			<NavigationMenuList className="w-full justify-normal">
				<NavigationMenuItem className="flex flex-grow">
					<div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
						<form
							onSubmit={e => {
								e.preventDefault();
							}}
						>
							<Input
								onInput={e => {
									if (!e.target) return;
									const target = e.target as HTMLInputElement;
									setSearch(encodeURIComponent(target.value));
								}}
								defaultValue={cookies.get('search') || ''}
								placeholder="Search"
								className="w-full"
							/>
						</form>
					</div>
				</NavigationMenuItem>

				<NavigationMenuItem className="!ml-2">
					<ResponsiveDialog button={<Button className="text-white">Compose</Button>}>
						<h2 className="pt-2 text-2xl font-medium">Compose message</h2>
						<form
							onSubmit={e => {
								e.preventDefault();
							}}
							className="pt-2 pb-3"
						>
							<Label htmlFor="to">Recipient Phone Number</Label>
							<Input ref={numberRef} type="tel" placeholder="Phone number" />

							<Button
								onClick={startNewChat}
								className="mt-3 mx-auto block text-white"
							>
								Start new chat
							</Button>
						</form>
					</ResponsiveDialog>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

export default Navbar;
