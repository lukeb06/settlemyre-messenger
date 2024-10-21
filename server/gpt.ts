import OpenAI from 'openai';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs';
import PROMPT from './prompt';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getMessages(prompt: string) {
	return [
		{
			role: 'system',
			content: PROMPT,
		},
		{
			role: 'user',
			content: prompt,
		},
		// {
		//     role: 'assistant',
		//     content: '',
		// }
	];
}

async function _streamResponse(prompt: string) {
	let options: any = {
		model: 'gpt-4o-mini',
		messages: getMessages(prompt),
		stream: true,
	};

	return await client.chat.completions.create(options);
}

type StringMessage = { role: string; content: string };

async function _toolResponse(messages: StringMessage[], tools: any) {
	let options: any = {
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'system',
				content: PROMPT,
			},
			...messages,
		],
		tools: tools,
		stream: true,
	};

	return await client.beta.chat.completions.runTools(options);
}

type ChunkCallback = (content: string, chunk?: OpenAI.Chat.ChatCompletionChunk) => void;

export async function forEachChunk(stream: any, callback: ChunkCallback) {
	for await (const chunk of stream) {
		const content = chunk.choices[0]?.delta?.content || '';
		callback(content, chunk);
	}
}

export async function streamResponse(prompt: string, callback: ChunkCallback) {
	const response: any = await _streamResponse(prompt);

	for await (const chunk of response) {
		const content = chunk.choices[0]?.delta?.content || '';
		callback(content, chunk);
	}
}

const toolResponseCache = new Map<string, string>();

export async function toolResponse(messages: StringMessage[], tools: any, callback: ChunkCallback) {
	const response: any = await _toolResponse(messages, tools);
	const id = messages.map((m: any) => m.content).join(';;');

	if (toolResponseCache.has(id)) {
		const cached = toolResponseCache.get(id);
		if (cached) {
			let spl = cached.split('');
			return await new Promise((resolve, reject) => {
				let i = 0;
				setInterval(() => {
					if (i >= spl.length) return resolve(undefined);
					let c = spl[i++];
					callback(c);
				});
			});
		}
	}

	let text = '';

	for await (const chunk of response) {
		const content = chunk.choices[0]?.delta?.content || '';
		callback(content, chunk);
		text += content;
	}

	toolResponseCache.set(id, text);
}

async function test() {
	await streamResponse('Hello, how are you?', (content, chunk) => {
		process.stdout.write(content);
	});
}

// test();
