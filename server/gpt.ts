import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function _streamResponse(prompt: string) {
	return await client.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [{ role: 'user', content: prompt }],
		stream: true,
	});
	// for await (const chunk of stream) {
	// 	process.stdout.write(chunk.choices[0]?.delta?.content || '');
	// }
}

type ChunkCallback = (content: string, chunk?: OpenAI.Chat.ChatCompletionChunk) => void;
type StreamResult = Awaited<ReturnType<typeof _streamResponse>>;

export async function forEachChunk(stream: StreamResult, callback: ChunkCallback) {
	for await (const chunk of stream) {
		const content = chunk.choices[0]?.delta?.content || '';
		callback(content, chunk);
	}
}

export async function streamResponse(prompt: string, callback: ChunkCallback) {
	const response = await _streamResponse(prompt);

	for await (const chunk of response) {
		const content = chunk.choices[0]?.delta?.content || '';
		callback(content, chunk);
	}
}

async function test() {
	await streamResponse('Hello, how are you?', (content, chunk) => {
		process.stdout.write(content);
	});
}

// test();
