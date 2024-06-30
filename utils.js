const fs = require('fs');
const path = require('path');

async function updateLeaderboard(client, guild) {
    const playersFilePath = path.join(__dirname, 'data/players.json');
    const leaderboardFilePath = path.join(__dirname, 'data/leaderboardMessageId.json');

    if (!fs.existsSync(playersFilePath)) {
        console.error('players.json not found!');
        return;
    }

    const players = JSON.parse(fs.readFileSync(playersFilePath, 'utf-8'));
    const sortedPlayers = Object.values(players).sort((a, b) => b.balance - a.balance);

    let leaderboardText = 'Leaderboard:\n';
    sortedPlayers.forEach((player, index) => {
        leaderboardText += `${index + 1}. <@${player.id}> - ${player.balance}\n`;
    });

    let messageId;
    if (fs.existsSync(leaderboardFilePath)) {
        const leaderboardData = JSON.parse(fs.readFileSync(leaderboardFilePath, 'utf-8'));
        messageId = leaderboardData.messageId;
    }

    const leaderboardChannel = guild.channels.cache.find(channel => channel.name === 'leaderboard');
    if (!leaderboardChannel) {
        console.error('Leaderboard channel not found!');
        return;
    }

    try {
        let leaderboardMessage;
        if (messageId) {
            leaderboardMessage = await leaderboardChannel.messages.fetch(messageId);
            await leaderboardMessage.edit(leaderboardText);
        } else {
            leaderboardMessage = await leaderboardChannel.send(leaderboardText);
            fs.writeFileSync(leaderboardFilePath, JSON.stringify({ messageId: leaderboardMessage.id }, null, 2));
        }
    } catch (error) {
        console.error('Error fetching or editing leaderboard message:', error);
        const leaderboardMessage = await leaderboardChannel.send(leaderboardText);
        fs.writeFileSync(leaderboardFilePath, JSON.stringify({ messageId: leaderboardMessage.id }, null, 2));
    }
}

module.exports = { updateLeaderboard };
