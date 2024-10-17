import * as React from 'react';

import { cn } from '@/lib/utils';
import { useMediaQuery, query } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResponsiveDialog({
	children,
	button,
}: {
	children: React.ReactNode;
	button?: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery('md');

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{button || <></>}</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">{children}</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{button || <></>}</DrawerTrigger>
			<DrawerContent className="px-3 pb-3">{children}</DrawerContent>
		</Drawer>
	);
}
