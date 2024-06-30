const { MessageEmbed } = require('discord.js');

function createEmbedMessage(title, description, color = '#0099ff', fields = [], footer = '') {
    const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .addFields(fields);

    if (footer) {
        embed.setFooter(footer);
    }

    return embed;
}

function createErrorMessage(description) {
    return createEmbedMessage('Error', description, '#ff0000');
}

module.exports = {
    createEmbedMessage,
    createErrorMessage,
};
