const fs = require('node:fs');

function getDate() {
	return new Date()
		.toLocaleDateString()
		.split('/')
		.map(v => {
			if (v.length == 1) return `0${v}`;
			if (v.length == 4) return v.substring(2);
			return v;
		})
		.join('_');
}

function getTime() {
	return new Date()
		.toLocaleString('en-us', { hour12: false })
		.split(', ')
		.map((v, i) => {
			if (i == 0) {
				let arr = v.split('/').map(v => {
					if (v.length == 1) return `0${v}`;
					return v;
				});
				let popped = arr.pop();
				if (popped) arr.unshift(popped);
				return arr.join('-');
			} else if (i == 1) {
				return v
					.split(' ')[0]
					.split(':')
					.map(v => {
						if (v.length == 1) return `0${v}`;
						return v;
					})
					.join(':');
			}
		})
		.join(' ');
}

function getProtoType(value: any) {
	if (value.__proto__ === Object.prototype) return value.name;

	return getProtoType(value.__proto__);
}

function type(value: any) {
	if (typeof value === 'object') {
		return getProtoType(value);
	} else {
		return typeof value;
	}
}

class Logger {
	name: string;
	file: string;

	constructor(file = '') {
		this.name = file;
		this.file = '';
		this.updateFile();
	}

	updateFile() {
		this.file = `${this.name}_${getDate()}.log`;
	}

	log(message: string) {
		this.updateFile();
		fs.appendFileSync(this.file, `${message}\n`);
		console.log(message);
	}

	success(message: string) {
		this.log(`[SUCCESS] [${getTime()}] ${message}`);
	}

	info(message: string) {
		this.log(`[INFO] [${getTime()}] ${message}`);
	}

	warn(message: string) {
		this.log(`[WARNING] [${getTime()}] ${message}`);
	}
}

class ErrorHandler {
	logger: Logger;
	errors: Array<string | Error>;

	constructor(logger: Logger) {
		this.logger = logger;
		this.errors = [];
	}

	add(error: string | Error) {
		this.errors.push(error);
		this.printError(error);
	}

	printError(error: string | Error) {
		if (type(error) == 'Error' && error instanceof Error) {
			error = `[ERROR] [${getTime()}] [${error.name}] ${error.message}\n${error.stack}`;
		} else {
			error = `[ERROR] [${getTime()}] ${error.toString()}`;
		}

		this.logger.log(error);
	}

	printErrors() {
		this.logger.log('');
		this.logger.log(
			'================================================================================',
		);
		this.logger.log(
			'================================================================================',
		);

		this.errors.forEach(error => this.printError(error));

		if (this.errors.length > 0) {
			this.logger.log('No errors found.');
		}

		this.logger.log(
			'================================================================================',
		);
		this.logger.log(
			'================================================================================',
		);
	}
}

module.exports = {
	Logger,
	ErrorHandler,
};
