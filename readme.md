# NOTE

This is shelved for now, my pterodactyl instance only ever returns `suspended: false` for each server and the `/suspend` and `/unsuspend` endpoints return a weird status code and don't do anything :)


# Configuration

Copy the config.ts.example file to be config.ts

`cp src/config.ts.example src/config.ts`

populate the fields with the pterodactyl APPLICATION api key (not a user's), then discord bot info

# Running in dev

First steps, run npm install

`npm i`

then to run for development, use the start:dev command

`npm run start:dev`

should run a nodemon instance which watches for changes then runs node-ts