const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const tradesFilePath = path.join(__dirname, '../data/trades.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Creates a new trade')
        .addStringOption(option => option.setName('symbol').setDescription('The stock or asset symbol').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The number of shares or units to trade').setRequired(true))
        .addIntegerOption(option => option.setName('takeprofit').setDescription('The take profit level').setRequired(false))
        .addIntegerOption(option => option.setName('stoploss').setDescription('The stop loss level').setRequired(false)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const symbol = interaction.options.getString('symbol');
        const amount = interaction.options.getInteger('amount');
        const takeprofit = interaction.options.getInteger('takeprofit');
        const stoploss = interaction.options.getInteger('stoploss');

        if (!fs.existsSync(tradesFilePath)) {
            fs.writeFileSync(tradesFilePath, JSON.stringify([]));
        }

        const trades = JSON.parse(fs.readFileSync(tradesFilePath, 'utf-8'));

        const tradeRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('trade_type')
                .setPlaceholder('Select Trade Type')
                .addOptions([
                    {
                        label: 'Buy',
                        description: 'Buy trade',
                        value: 'buy',
                    },
                    {
                        label: 'Sell',
                        description: 'Sell trade',
                        value: 'sell',
                    },
                ])
        );

        await interaction.reply({ content: 'Please select the trade type.', components: [tradeRow], ephemeral: true });

        const filter = i => i.customId === 'trade_type' && i.user.id === userId;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            const type = i.values[0];

            if (type !== 'buy' && type !== 'sell') {
                return i.reply({ content: 'Invalid trade type. Please choose either "buy" or "sell".', ephemeral: true });
            }

            const trade = {
                id: `trade_${Date.now()}`,
                userId,
                type,
                symbol,
                amount,
                takeprofit,
                stoploss,
                status: 'open',
                timestamp: new Date().toISOString()
            };

            trades.push(trade);
            fs.writeFileSync(tradesFilePath, JSON.stringify(trades, null, 2));

            await i.update({ content: `Trade created: ${type} ${amount} of ${symbol}`, components: [], ephemeral: true });
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ content: 'Trade creation timed out.', components: [] });
            }
        });
    }
};
