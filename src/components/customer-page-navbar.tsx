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

import { ModeToggle } from '@/components/mode-toggle';

import { useMediaQuery } from '@/hooks/use-media-query';

import { ChevronLeft } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { SERVER } from '@/lib/server';
import NavbarClient from './navbar-client';

export default async function CustomerPageNavbar({
	phoneNumber,
	refId,
}: {
	phoneNumber: string;
	refId: any;
}) {
	const user = await SERVER.userProfile.query({ phone_number: phoneNumber });

	const getLink = () => {
		if (refId) {
			return `/?m=${encodeURIComponent(refId)}`;
		} else {
			return '/';
		}
	};

	return (
		<NavigationMenu className="p-2 z-50">
			<NavigationMenuList className="w-full justify-normal">
				<NavigationMenuItem>
					<Button asChild className="pl-2 text-white">
						<Link href={getLink()}>
							<ChevronLeft /> Back
						</Link>
					</Button>
				</NavigationMenuItem>

				<NavbarClient user={user} />

				<NavigationMenuItem>
					<ModeToggle />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
