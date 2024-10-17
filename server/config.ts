let hasConfig = true;

const WINDOWS = String.raw`\\mainserver\cpsql.1\business_automations\config.json`;
const MAC = '/Volumes/CPSQL.1/business_automations/config.json';

const DOTENV = process.env.CONFIG_FILE;

const MODE = DOTENV || MAC;

try {
	require(MODE);
} catch {
	hasConfig = false;
}

const JSONdb = require('simple-json-db');
let configPath;

if (!hasConfig) {
	console.log('No config file found, using manual config');
	configPath = './manual_config.json';
} else {
	configPath = MODE;
}

const configDB = new JSONdb(configPath);

if (hasConfig) {
	let manualDB = new JSONdb('./manual_config.json');
	let configKeys = { ...configDB.get('keys') };

	manualDB.set('keys', configKeys);
}

const keys = configDB.get('keys');
const main_server = keys.main_server;

export const authentication = main_server.db;

export const server = main_server.address;
export const options = {
	encrypt: main_server.encrypt,
	database: main_server.database,
};

export const TWILIO_PHONE_NUMBER = keys.twilio.twilio_phone_number;
export const TWILIO_ACCOUNT_SID = keys.twilio.twilio_account_sid;
export const TWILIO_AUTH_TOKEN = keys.twilio.twilio_auth_token;

let LOG_FILE;

if (MODE == MAC) LOG_FILE = '/Volumes/Share/logs/business_automations/messenger/log';
if (MODE == WINDOWS) LOG_FILE = '\\mainserversharelogs\business_automationsmessengerlog';

export const LOG_FILE_PATH = LOG_FILE;

export const SQL_CONFIG = {
	user: main_server.db_username,
	password: main_server.db_password,
	database: main_server.database,
	server: main_server.address,
	pool: {
		max: 30,
		min: 0,
		idleTimeoutMillis: 30000,
	},
	options: {
		encrypt: main_server.encrypt,
		trustServerCertificate: true,
	},
};
