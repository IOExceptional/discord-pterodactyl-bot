import {  Client, Intents } from 'discord.js';
import axios from 'axios';

import config from './config';

const pteroBaseApi = config.pteroBaseApi || process.env.BASE_API;
const pteroApiClientKey = config.pteroApiClientKey  || process.env.CLIENT_API_KEY;
const token = config.discordBotToken || process.env.DISCORD_BOT_TOKEN;

interface ServerList {
	data: {
		attributes: {
			id: string,
			uuid: string,
			name: string,
			relationships: {
				allocations: {
					data: {
						attributes: {
							ip: string,
							port: number,
						}
					} []
				}
			}
		}
	} [],
}

interface ServerReply {
	attributes: {
		id: string,
		uuid: string,
		name: string,
		relationships: {
			allocations: {
				data: {
					attributes: {
						ip: string,
						port: number,
					}
				} []
			}
		}
	}
}

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
			content: "Fetching servers...",
		});

		const serversReply = await axios(pteroBaseApi + "/client/", {
			headers: {
				'Authorization': "Bearer " + pteroApiClientKey,
			}
		});

		const serversList: ServerList = serversReply.data;

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
				port: server.attributes.relationships.allocations.data[0].attributes.port,
			};
		}));
	
		const servers = serverStatuses.map((server) => {
			return `**${server.name}** (${server.status} ${server.status === "running" ? "🟢" : "🔴"})
	ID:    \`${server.uuid}\`
	Port: \`play.ioe.gg:${server.port}\``;
		});

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

const fetchServer = async (serverId: string): Promise<ServerReply> => {
	const serverResourcesReply = await axios(pteroBaseApi + `/client/servers/${serverId}`, {
		headers: {
			'Authorization': "Bearer " + pteroApiClientKey,
		}
	});

	// console.log(serverResourcesReply.data);

	return serverResourcesReply.data;
}

const startServer = async (interaction: any) => {
	const serverId = interaction.options.getString('id');
	try {
		interaction.reply({
			content: "Starting server...",
		});

		const serverReply = await fetchServer(serverId);

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
			content: `Started **${serverReply.attributes.name}** 🟢`,
			ephemeral: true,
		});
	} catch (e) {
		console.error(e);
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
			content: "Stopping server...",
		});

		const serverReply = await fetchServer(serverId);

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
			content: `Stopped **${serverReply.attributes.name}** 🔴`,
			ephemeral: true,
		});
	} catch (e) {
		console.error(e);
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
