import { publicProcedure } from './trpc';
import { z } from 'zod';
import axios from 'axios';

import { Users } from './database';

import {
	getMessages as GetMessages,
	getUserProfile,
	sendMessage as SendMessage,
	getUserProfileFromCustNo,
} from './ms-database';

const status = publicProcedure.query(async () => {
	return { status: 'Hello, Next.js!' };
});

const userExample = publicProcedure.query(async o => {
	if (!o.ctx.user) return { status: 'Unauthorized' };
	return { status: 'Hello, User!' };
});

const validateTokenInput = z.object({
	username: z.string(),
	password: z.string(),
});
const validateToken = publicProcedure.input(validateTokenInput).query(async ({ input }) => {
	const username = input.username.toLowerCase();
	const password = input.password.toLowerCase();

	const user = await Users.find(username);
	if (user == null) return { valid: false };

	if (!user.checkPassword(password)) return { valid: false };

	return { valid: true };
});

const getMessagesInput = z
	.object({
		search: z.string().optional(),
	})
	.optional();
const getMessages = publicProcedure.input(getMessagesInput).query(async ({ ctx, input }) => {
	if (!ctx.user) return [];

	const { search } = input || { search: '' };
	let messages = await GetMessages(search);
	// console.log(messages.map(m => m.body));
	return messages;
});

const userProfileInput = z.object({
	phone_number: z.string(),
});
const userProfile = publicProcedure.input(userProfileInput).query(async ({ input }) => {
	if (!input.phone_number) return null;
	return await getUserProfile(input.phone_number);
});

const updateSubscriptionInput = z.object({
	cust_no: z.string(),
	status: z.boolean(),
});
const updateSubscription = publicProcedure
	.input(updateSubscriptionInput)
	.mutation(async ({ input }) => {
		const user = await getUserProfileFromCustNo(input.cust_no);
		if (!user) return { success: false, reason: 'User not found' };
		await user.updateSubscription(input.status);
		return { success: true, reason: '' };
	});

const sendMessageInput = z.object({
	to: z.string(),
	body: z.string(),
	category: z.string(),
	name: z.string(),
});
const sendMessage = publicProcedure.input(sendMessageInput).mutation(async ({ input }) => {
	console.log(input);
	if (!input.to) return { success: false };
	if (!input.body) return { success: false };

	await SendMessage(input.to, input.body, input.category, input.name);

	return { success: true };
});

export const procedures = {
	status,
	validateToken,
	getMessages,
	userProfile,
	updateSubscription,
	sendMessage,
};
