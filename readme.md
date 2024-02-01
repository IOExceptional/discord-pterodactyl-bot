Use the following to invite bot
`https://discord.com/api/oauth2/authorize?client_id={bot_id}&permissions=2147600448&scope=bot%20applications.commands`

# Running in dev

First steps, run npm install

`npm i`

then to run for development, use the start:dev command

`npm run start`

should run a nodemon instance which watches for changes then runs node-ts


# Configuration

You need a CLIENT api key from your pterodactyl instance and the token for your bot.

You should add the following as environment variables;

- `BASE_API` - **NOTE: Remove the trailing slash!** This is the URI of your pterodactyl instance (e.g. `https://pterodactyl.example.com/api`)
- `CLIENT_API_KEY` - This is your pterodactyl client API key
- `DISCORD_BOT_TOKEN` - This is your discord bot's token