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
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import ClientConversations from './client-conversations';

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
				<NavigationMenuItem className="mr-2 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon">
								<Menu />
							</Button>
						</SheetTrigger>

						<SheetContent side="left">
							<br />
							<ClientConversations />
						</SheetContent>
					</Sheet>
				</NavigationMenuItem>

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
