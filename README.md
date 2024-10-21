# Settlemyre Messenger

## Setup

### (1) Basic setup

-   Make sure you have [Bun](https://bun.sh) installed if you want to run locally.
-   Must change the SERVER_IP in the /src/lib/server.ts file to the IP of your server.

### (2) .env Setup

-   Set the OPENAI_API_KEY to your OpenAI API key.
-   Set the PORT to the port you want to run the server on. (Should match port at SERVER_IP in /src/lib/server.ts)
-   Set the CONFIG_FILE to the path of the config.json file.
-   Make sure that you have a database.db file in the root directory BEFORE building the project to docker.

### (3) Missing database.db file

If you dont yet have a database.db file, you can create one by referring to the /server/database.ts file.
The database.ts file has a function called buildDatabase() which describes the database structure.
You will have to use [Bun](https://bun.sh) to properly run the file, which will create the database.db file and the user entries by adding running the following code:

```typescript
// This function already exists and needs to be setup and called.
function testDatabase() {
	// This is already present and will create the tables.
	buildDatabase();

	// Create a new user with the given username and password.
	// The password is hashed before being stored in the database.
	Users.create('example_username', 'example_password');

	// Create a new user with a display name.
	Users.create('example_user', 'test123', 'Example User');
}

// You need to uncomment this line.
// testDatebase();
```

Now run the script:

```bash
bun run build:db
```

Now you're database should be properly setup. Make sure to remove the test code from the database.ts file once you are done (to avoid pushing the credentials to GitHub).

The database.ts file will be copied to the docker container so you don't need to worry about creating a new one once you build the project.

## Build with docker

If you have [Bun](https://bun.sh) or NPM installed, you can build with an NPM script. Otherwise, use the default docker command.

Bun:

```bash
bun run build:docker
```

NPM:

```bash
npm run build:docker
```

Default:

```bash
docker compose up --build
```

## Run Locally

### Install dependencies

```bash
bun install
```

### Run Development Server

```bash
bun dev
```

### Build for Production

NOTE: Will not compile with bun.

```bash
npm run build
```

### Start

```bash
bun run start
```
