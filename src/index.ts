import {  Client, Intents } from 'discord.js';
import axios from 'axios';

import config from './config';

const pteroBaseApi = config.pteroBaseApi;
const pteroApiKey = config.pteroApiKey;

const token = config.discordBotToken;

const client: Client & { commands?: any } = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('interactionCreate', (interaction): Promise<void> => handleCommand(interaction));
client.once('ready', (e) => {
	console.log("Logged in")
	registerCommands();
});

const handleCommand = async (interaction: any) => {
	switch (interaction.commandName) {
		case "list":
			await listServers(interaction);
			break;
		case "start":
			await startServer(interaction);
			break;
		case "stop":
			await stopServer(interaction);
			break;
		default:
			break;
	}
};

const listServers = async (interaction: any) => {
	try {

		const serversReply = await axios(pteroBaseApi + "/servers/", {
			headers: {
				'Authorization': "Bearer " + pteroApiKey,
			}
		});
	
		const serversList: {
			data: {
				attributes: {
					id: string,
					name: string,
					suspended: string | null
				}
			} [],
		} = serversReply.data;
	
		const servers = serversList.data.map((server) => {
			return `Name: ${server.attributes.name}
	ID:    \`${server.attributes.id}\`
	Online: ${!server.attributes.suspended}`;
		});
	
		await interaction.reply({
			content: servers.join("\n\n"),
			ephemeral: true,
		});
	} catch (e) {
		console.log(e);
		await interaction.reply({
			content: "There was a problem fetching the SERVZ",
			ephemeral: true,
		});
	}
}

const startServer = async (interaction: any) => {
	const serverId = interaction.options.getString('id');
	try {
		await axios(pteroBaseApi + `/servers/${serverId}/unsuspend`, {
			headers: {
				'Authorization': "Bearer " + pteroApiKey,
			}
		});
	
		await interaction.reply({
			content: "Server starting",
			ephemeral: true,
		});
	} catch (e) {
		await interaction.reply({
			content: "There was a problem starting",
			ephemeral: true,
		});
	}
}

const stopServer = async (interaction: any) => {
	const serverId = interaction.options.getString('id');
	try {
		await axios(pteroBaseApi + `/servers/${serverId}/suspend`, {
			headers: {
				'Authorization': "Bearer " + pteroApiKey,
			}
		});
	
		await interaction.reply({
			content: "Server starting",
			ephemeral: true,
		});
	} catch (e) {
		await interaction.reply({
			content: "There was a problem starting",
			ephemeral: true,
		});
	}
}

const registerCommands = async () => {
	const commands = client.application?.commands;

	await commands?.create({
		name: "list",
		description: 'Lists the servers',
	});

	await commands?.create({
		name: "start",
		description: 'Starts the server',
		options: [
			{
				name: 'id',
				description: 'A server id',
				type: 3,
				required: true,
			},
		],
	});

	await commands?.create({
		name: "stop",
		description: 'Stops the server',
		options: [
			{
				name: 'id',
				description: 'A server id',
				type: 3,
				required: true,
			},
		],
	});
}


client.login(token);
