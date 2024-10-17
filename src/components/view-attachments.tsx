import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

import { endpoint } from '@/lib/server';
import Loading from './loading';
import { useRouter } from 'next/navigation';

const ImageCarousel = ({ media, className }: { media: string[]; className?: string }) => {
	const isNotMobile = useMediaQuery('sm');

	const router = useRouter();

	return (
		<Carousel>
			<CarouselContent>
				{media.map((item, index) => (
					<CarouselItem className="grid place-items-center p-4 md:p-0" key={index}>
						<img
							className="cursor-pointer max-h-[80vh] min-h-[100px] bg-white"
							width={isNotMobile ? '80%' : ''}
							onLoadedData={router.refresh}
							src={endpoint(`getImage?imageUrl=${encodeURIComponent(item)}`)}
							alt={`Attachment ${index + 1}`}
							onClick={() => {
								window.open(
									endpoint(`getImage?imageUrl=${encodeURIComponent(item)}`),
									'_blank',
								);
							}}
						/>
					</CarouselItem>
				))}
			</CarouselContent>
			{isNotMobile ? (
				<>
					<CarouselPrevious />
					<CarouselNext />
				</>
			) : (
				<></>
			)}
		</Carousel>
	);
};

export default function ViewAttachments({
	media,
	textClass,
	date,
}: {
	media: string[];
	textClass: string;
	date?: Date;
}) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery('md');

	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const otherButtonRef = React.useRef<HTMLButtonElement>(null);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				{date && Date.now() - date.getTime() < 1000 * 60 * 60 * 24 * 7 ? (
					<img
						src={endpoint(`getImage?imageUrl=${encodeURIComponent(media[0])}`)}
						alt="Thumbnail"
						className="max-h-32"
						onClick={() => buttonRef.current?.click()}
					/>
				) : (
					<></>
				)}
				<DialogTrigger asChild>
					<Button ref={buttonRef} className={`p-0 ${textClass}`} variant="link">
						+{media.length} attachment
						{media.length > 1 ? 's' : ''}
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<ImageCarousel media={media} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{date && Date.now() - date.getTime() < 1000 * 60 * 60 * 24 * 7 ? (
				<img
					src={endpoint(`getImage?imageUrl=${encodeURIComponent(media[0])}`)}
					alt="Thumbnail"
					className="max-h-32"
					onClick={() => otherButtonRef.current?.click()}
				/>
			) : (
				<></>
			)}
			<DialogTrigger asChild>
				<Button ref={otherButtonRef} className={`p-0 ${textClass}`} variant="link">
					+{media.length} attachment
					{media.length > 1 ? 's' : ''}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<ImageCarousel media={media} className="absolute top-0 left-0 w-full z-50" />
			</DialogContent>
		</Dialog>
	);
}
