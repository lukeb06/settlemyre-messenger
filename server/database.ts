import { hash } from 'bun';
import { Database } from 'bun:sqlite';

const db = new Database('database.db');
const sql = (query: TemplateStringsArray, ...args: any[]) => {
	let queryString = '';
	let queryArr = Array.from(query);

	while (queryArr.length > 0 || args.length > 0) {
		queryString += (queryArr.shift() || '') + (args.shift() || '');
	}

	return db.query(queryString);
};

class Column {
	name: string;
	type: string;
	nullable: boolean;
	id: string;

	constructor(name: string, type: string, identifier: string, nullable: boolean = false) {
		this.name = name;
		this.type = type;
		this.nullable = nullable;
		this.id = identifier;
	}

	toString() {
		return `${this.name} ${this.type}${this.nullable ? '' : ' NOT NULL'} ${this.id}`;
	}
}

class PrimaryKey extends Column {
	constructor(name: string = 'id') {
		super(name, 'INTEGER', 'PRIMARY KEY AUTOINCREMENT');
	}
}

function createTable(tableName: string, columns: Column[]) {
	return sql`
		CREATE TABLE ${tableName}(
			${columns.map(c => c.toString()).join(', ')}
		);
	`.run();
}

function dropTable(tableName: string) {
	try {
		return sql`DROP TABLE ${tableName}`.run();
	} catch {
		return null;
	}
}

class User {
	id: number;
	username: string;
	passwordHash: string;
	displayName: string;

	constructor(id: number, username: string, passwordHash: string, displayName: string) {
		this.id = id;
		this.username = username;
		this.passwordHash = passwordHash;
		this.displayName = displayName;
	}

	checkPassword(password: string) {
		return this.passwordHash === hash(password).toString();
	}
}

export class Users {
	static get(id: number | bigint) {
		return sql`SELECT * FROM users WHERE id=?`.as(User).get(id as number);
	}

	static find(username: string) {
		return sql`SELECT * FROM users WHERE username=?`.as(User).get(username);
	}

	static create(username: string, password: string, displayName: string | null = null) {
		username = username.toLowerCase();

		const passwordHash = hash(password.toLowerCase()).toString();

		if (displayName == null)
			displayName = username.slice(0, 1).toUpperCase() + username.slice(1);

		const { lastInsertRowid } = sql`
			INSERT INTO users (username, passwordHash, displayName)
			VALUES (?1, ?2, ?3)
		`.run(username, passwordHash, displayName);

		return Users.get(lastInsertRowid);
	}
}

function dropDatabase() {
	dropTable('users');
}

function buildDatabase() {
	dropDatabase();

	createTable('users', [
		new PrimaryKey('id'),
		new Column('username', 'TEXT', 'UNIQUE NOT NULL'),
		new Column('passwordHash', 'TEXT', 'NOT NULL'),
		new Column('displayName', 'TEXT', 'NOT NULL'),
	]);
}

function testDatabase() {
	buildDatabase();

	const register = Users.create('register', '1387');
	const admin = Users.create('admin', 'settlemyre');
	console.log(register, admin);
}

testDatabase();
