import {  Client, Intents } from 'discord.js';
import axios from 'axios';

import config from './config';

const pteroBaseApi = config.pteroBaseApi;
const pteroApiKey = config.pteroApiKey;
const pteroApiClientKey = config.pteroApiClientKey;

const token = config.discordBotToken;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('interactionCreate', (interaction): Promise<void> => handleCommand(interaction));
client.once('ready', (e) => {
	console.log("Logged in");
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
		await interaction.reply({
			content: "Fetching servers",
			ephemeral: true,
		});

		const serversReply = await axios(pteroBaseApi + "/application/servers/", {
			headers: {
				'Authorization': "Bearer " + pteroApiKey,
			}
		});
	
		const serversList: {
			data: {
				attributes: {
					id: string,
					uuid: string,
					name: string,
				}
			} [],
		} = serversReply.data;

		const serverStatuses = await Promise.all(serversList.data.map(async (server) => {
			const serverResourcesReply = await axios(pteroBaseApi + `/client/servers/${server.attributes.uuid}/resources`, {
				headers: {
					'Authorization': "Bearer " + pteroApiClientKey,
				}
			});

			const status = serverResourcesReply.data.attributes.current_state;

			return {
				id: server.attributes.id,
				name: server.attributes.name,
				uuid: server.attributes.uuid,
				status,
			};
		}));
	
		const servers = serverStatuses.map((server) => {
			return `Name: ${server.name}
	ID:    \`${server.id}\`
	UUID:    \`${server.uuid}\`
	Online: ${server.status !== 'offline'}`;
		});

		// console.log(servers);
		await interaction.editReply({
			content: servers.join("\n\n"),
			ephemeral: true,
		});
	} catch (e) {
		console.log(e);
		await interaction.editReply({
			content: "There was a problem fetching the SERVZ",
			ephemeral: true,
		});
	}
}

const startServer = async (interaction: any) => {
	const serverId = interaction.options.getString('id');
	try {
		interaction.reply({
			content: "Starting server",
			ephemeral: true,
		});
		await axios(pteroBaseApi + `/client/servers/${serverId}/power`, {
			headers: {
				'Authorization': "Bearer " + pteroApiClientKey,
			},
			method: 'POST',
			data: {
				signal: "start",
			}
		});
	
		await interaction.editReply({
			content: "Server started",
			ephemeral: true,
		});
	} catch (e) {
		await interaction.editReply({
			content: "There was a problem starting",
			ephemeral: true,
		});
	}
}

const stopServer = async (interaction: any) => {
	const serverId = interaction.options.getString('id');
	try {
		await interaction.reply({
			content: "Stopping server",
			ephemeral: true,
		});
		await axios(pteroBaseApi + `/client/servers/${serverId}/power`, {
			headers: {
				'Authorization': "Bearer " + pteroApiClientKey,
			},
			method: 'POST',
			data: {
				signal: "stop",
			}
		});
	
		await interaction.editReply({
			content: "Server Stopped",
			ephemeral: true,
		});
	} catch (e) {
		await interaction.editReply({
			content: "There was a problem stopping",
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
