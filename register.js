const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const { updateLeaderboard } = require('../utils');
const { createEmbedMessage, createErrorMessage } = require('../messageUtils');

const playersFilePath = path.join(__dirname, '../data/players.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a new user or reset the balance of an existing user'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const initialBalance = 100000;

        if (!fs.existsSync(playersFilePath)) {
            fs.writeFileSync(playersFilePath, JSON.stringify({}));
        }

        const players = JSON.parse(fs.readFileSync(playersFilePath, 'utf-8'));
        const guild = interaction.guild;
        const member = await guild.members.fetch(userId);
        const role = guild.roles.cache.find(role => role.name === 'Paper Trader');

        if (!role) {
            return interaction.reply({ embeds: [createErrorMessage('Role "Paper Trader" not found.')], ephemeral: true });
        }

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({ embeds: [createErrorMessage('You are already registered.')], ephemeral: true });
        }

        if (players[userId]) {
            players[userId].balance = initialBalance;
        } else {
            players[userId] = { id: userId, username, balance: initialBalance };
        }

        fs.writeFileSync(playersFilePath, JSON.stringify(players, null, 2));
        await member.roles.add(role);

        await interaction.reply({
            embeds: [createEmbedMessage('Registration Successful', 'You have been registered successfully.')],
            ephemeral: true,
        });
        const announcementsChannel = guild.channels.cache.find(channel => channel.name === 'dg-announcements');
        if (announcementsChannel) {
            announcementsChannel.send(`Welcome <@${userId}>! Use /help to get started.`);
        }

        await updateLeaderboard(interaction.client, guild);
    }
};
