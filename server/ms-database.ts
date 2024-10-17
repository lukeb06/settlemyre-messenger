import { SQL_CONFIG, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from './config';

import twilio from 'twilio';

const sql = require('mssql');

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

let isConnected = false;

class Queue<T> {
	queue: T[];

	constructor() {
		this.queue = [];
	}

	push(item: T) {
		this.queue.push(item);
	}

	pop() {
		if (this.queue.length === 0) return null;
		return this.queue.shift();
	}

	get size() {
		return this.queue.length;
	}
}

class SQLQuery {
	query: string;
	callback: Function;

	constructor(query: string, callback: Function) {
		this.query = query;
		this.callback = callback;
	}
}

type Result = {
	recordset: any;
};

class ExecutionPool {
	pool: Queue<SQLQuery>;

	constructor() {
		this.pool = new Queue<SQLQuery>();

		setInterval(() => {
			if (this.pool.size == 0 || !isConnected) return;

			const query = this.pool.pop();
			if (query == null) return;

			sql.query([query.query]).then((result: any) => {
				query.callback(result);
			});
		}, 25);
	}

	async query(query: string) {
		return new Promise((resolve, reject) => {
			this.pool.push(
				new SQLQuery(query, (result: Result) => {
					if (!result.recordset) return resolve([]);
					resolve(result.recordset);
				}),
			);
		});
	}
}

export const execPool = new ExecutionPool();

(async () => {
	try {
		await sql.connect(SQL_CONFIG);
		isConnected = true;
		// const result = await sql.query`select * from mytable where id = ${value}`;
		// console.dir(result);
	} catch (err) {
		// ... error checks
	}
})();

export const phoneToTwilio = (phone_number: string) => {
	return phone_number.replace(/^.*?(\d{3}).*?(\d{3}).*?(\d{4})$/, '+1$1$2$3');
};

export const phoneToCP = (phone_number: string) => {
	return phone_number.replace('+1', '').replace(/^.*?(\d{3}).*?(\d{3}).*?(\d{4})$/, '$1-$2-$3');
};

export class Message {
	id: number;
	date: string;
	origin: string | null;
	campaign: string | null;
	direction: string;
	to_phone: string;
	from_phone: string;
	username: string | null;
	cust_no: string | null;
	name: string | null;
	category: string | null;
	media: string[];
	sid: string | null;
	body: string | null;

	constructor(
		id: number,
		date: any,
		origin: string | null,
		campaign: string | null,
		direction: string,
		to_phone: string,
		from_phone: string,
		username: string | null,
		cust_no: string | null,
		name: string | null,
		category: string | null,
		media: string | null,
		sid: string | null,
		body: string | null,
	) {
		this.id = id;
		this.date = date
			.toGMTString()
			.replaceAll(' GMT', '')
			.replaceAll('T', ' ')
			.replaceAll('Z', ' ');
		this.origin = origin;
		this.campaign = campaign;
		this.direction = direction;
		this.to_phone = to_phone;
		this.from_phone = from_phone;
		this.username = username;
		this.cust_no = cust_no;
		this.name = name;
		this.category = category;
		this.media = media ? media.split(';;;') : [];
		this.sid = sid;
		this.body = body;
	}
}

type Messages = Message[];

const createMessages = (messages: any): Messages => {
	if (!(messages instanceof Array)) return [];
	return messages.map(
		(message: any) =>
			new Message(
				message.ID,
				message.DATE,
				message.ORIGIN || null,
				message.CAMPAIGN || null,
				message.DIRECTION,
				message.TO_PHONE,
				message.FROM_PHONE,
				message.USERNAME || null,
				message.CUST_NO || null,
				message.NAME || null,
				message.CATEGORY || null,
				message.MEDIA || null,
				message.SID || null,
				message.BODY || '',
			),
	);
};

export const getMessagesFromDB = (extra = ''): Promise<Messages> => {
	return new Promise(resolve => {
		let query = `
            SELECT * FROM SN_SMS
            WHERE SID != 'TEST'
			AND DATE > DATEADD(WEEK, -8, GETDATE())
			AND ORIGIN not like 'mass_campaign'
			AND ORIGIN not like 'automations'
            ${extra}
            ORDER BY DATE DESC
        `;

		execPool.query(query).then((messages: any) => {
			// resolve(messages);
			resolve(createMessages(messages));
		});
	});
};

export const getAllMessagesFromDB = (extra = ''): Promise<Messages> => {
	return new Promise(resolve => {
		let query = `
            SELECT * FROM SN_SMS
            WHERE SID != 'TEST'
            ${extra}
            ORDER BY DATE DESC
        `;

		execPool.query(query).then((messages: any) => {
			// resolve(messages);
			resolve(createMessages(messages));
		});
	});
};

export const mergeMessages = (messages: Messages): Promise<Messages> => {
	return new Promise(resolve => {
		resolve(
			messages.filter(
				// (message, i, self) => {
				// 	return self.findIndex(m => m.origin == message.origin) == i;
				// },
				message =>
					message.origin?.toLowerCase() != 'mass_campaign' &&
					message.origin?.toLowerCase() != 'automations' &&
					message.origin?.toLowerCase() != 'server',
			),
		);
	});
};

export const getMessages = (search: string = ''): Promise<Messages> => {
	if (search == '')
		return new Promise(resolve => {
			getMessagesFromDB()
				// .then((messages: Messages) => {
				// 	return mergeMessages(messages);
				// })
				.then((messages: Messages) => {
					resolve(messages);
				});
		});

	if (search.startsWith('user:')) {
		const user = phoneToCP(search.split(':')[1]);
		return new Promise(resolve => {
			let msgs: Messages = [];
			getAllMessagesFromDB(` AND (FROM_PHONE = '${user}' OR TO_PHONE = '${user}')`).then(
				(messages: Messages) => {
					resolve(messages);
				},
			);
		});
	}

	return new Promise(resolve => {
		let msgs: Messages = [];
		getAllMessagesFromDB(` AND (BODY LIKE '%${search}%' OR NAME LIKE '%${search}%')`).then(
			(messages: Messages) => {
				resolve(messages);
			},
		);
	});
};

export class User {
	name: string;
	category_code: string;
	email: string;
	loyalty_points: number;
	last_sale_date: string;
	last_sale_amount: number;
	include_in_marketing_mailouts: boolean;
	customer_number: string;

	constructor(
		name: string,
		category_code: string,
		email: string,
		loyalty_points: number,
		last_sale_date: any,
		last_sale_amount: number,
		include_in_marketing_mailouts: boolean,
		customer_number: string,
	) {
		this.name = name;
		this.category_code = category_code;
		this.email = email;
		this.loyalty_points = loyalty_points;
		try {
			this.last_sale_date = last_sale_date
				.toGMTString()
				.replaceAll(' GMT', '')
				.replaceAll('T', ' ')
				.replaceAll('Z', ' ');
		} catch (e) {
			this.last_sale_date = '';
		}
		this.last_sale_amount = last_sale_amount;
		this.include_in_marketing_mailouts = include_in_marketing_mailouts;
		this.customer_number = customer_number;
	}

	async updateSubscription(status: boolean) {
		const query = `
			UPDATE AR_CUST SET INCLUDE_IN_MARKETING_MAILOUTS = '${status ? 'Y' : 'N'}' WHERE CUST_NO = '${this.customer_number}'
		`;

		return await execPool.query(query);
	}
}

type Users = User[];

export const getUserProfile = (phone_number: string): Promise<User | null> => {
	return new Promise((resolve, reject) => {
		let query = `
				SELECT NAM, CATEG_COD, EMAIL_ADRS_1, LOY_PTS_BAL, LST_SAL_DAT, LST_SAL_AMT, INCLUDE_IN_MARKETING_MAILOUTS, CUST_NO FROM AR_CUST
				WHERE PHONE_1 = '${phone_number}' OR PHONE_2 = '${phone_number}'
			`;

		execPool.query(query).then((users: any) => {
			if (users.length == 0) return resolve(null);
			resolve(
				new User(
					users[0].NAM,
					users[0].CATEG_COD,
					users[0].EMAIL_ADRS_1,
					users[0].LOY_PTS_BAL,
					users[0].LST_SAL_DAT,
					users[0].LST_SAL_AMT,
					users[0].INCLUDE_IN_MARKETING_MAILOUTS == 'Y',
					users[0].CUST_NO,
				),
			);
		});
	});
};

export const getUserProfileFromCustNo = (cust_no: string): Promise<User | null> => {
	return new Promise((resolve, reject) => {
		let query = `
				SELECT NAM, CATEG_COD, EMAIL_ADRS_1, LOY_PTS_BAL, LST_SAL_DAT, LST_SAL_AMT, INCLUDE_IN_MARKETING_MAILOUTS, CUST_NO FROM AR_CUST
				WHERE CUST_NO = '${cust_no}'
			`;

		execPool.query(query).then((users: any) => {
			if (users.length == 0) return resolve(null);
			resolve(
				new User(
					users[0].NAM,
					users[0].CATEG_COD,
					users[0].EMAIL_ADRS_1,
					users[0].LOY_PTS_BAL,
					users[0].LST_SAL_DAT,
					users[0].LST_SAL_AMT,
					users[0].INCLUDE_IN_MARKETING_MAILOUTS == 'Y',
					users[0].CUST_NO,
				),
			);
		});
	});
};

export const writeMessageToDB = async (
	to: string,
	body: string,
	category: string,
	name: string,
	sid: string,
) => {
	let query = `
		INSERT INTO SN_SMS
		(TO_PHONE, FROM_PHONE, BODY, USERNAME, NAME, CATEGORY, ORIGIN, DIRECTION, SID)
		VALUES
		('${phoneToCP(to)}', '${phoneToCP(
			TWILIO_PHONE_NUMBER,
		)}', '${body}', 'Messenger', '${name}', '${category}', 'Messenger', 'OUTBOUND', '${sid}')
	`;

	return await execPool.query(query);
};

export const sendMessage = (to: string, body: string, category: string, name: string) => {
	return new Promise((resolve, reject) => {
		client.messages
			.create({
				body,
				from: TWILIO_PHONE_NUMBER,
				to,
			})
			.then(msg => {
				writeMessageToDB(to, body, category, name, msg.sid).then(resolve);
			});
	});
};
