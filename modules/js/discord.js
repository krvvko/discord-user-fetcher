const Discord = require('discord.js-selfbot-v13');
const config = require('../../config.json');

class DiscordClient {
    constructor() {
        this.client = new Discord.Client({
            checkUpdate: false
        });
        this.token = config.discordToken;
    }

    async login() {
        return new Promise(async (resolve) => {
            this.client.on('ready', async () => {
                console.log(`Logged in as ${this.client.user.tag}`);
                // Set the status to online
                await this.client.user.setStatus('online');
                let r = new Discord.RichPresence()
                    .setApplicationId('817229550684471297')
                    .setName('Discord User Fetcher')
                    .setType('PLAYING')
                    .setState('meow')
                    .setName('Name')
                    .setDetails('Fetching user data')
                    .setStartTimestamp(Date.now())
                    .setAssetsLargeImage('mp:attachments/1086422556258615406/1105135324251828304/b9f696010b6d410e936cd59f75e23507.png')
                    .setAssetsLargeText('Fetching...')
                    .addButton('Official WebSite', 'https://link.com/')
                    .addButton('GitHub', 'https://link.com/')
                this.client.user.setActivity(r);

                this.guildsMembers = new Map();
                await Promise.all(
                    this.client.guilds.cache.map(async (guild) => {
                        try {
                            const members = await guild.members.fetch();
                            this.guildsMembers.set(guild.id, members);
                        } catch (err) {
                            console.error(`Error fetching members for guild ${guild.name}: ${err}`);
                        }
                    })
                );

                resolve();
            });
            await this.client.login(this.token);
        });
    }

    async getAccountCreationDate(userId) {
        try {
            const targetUser = this.client.users.cache.get(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.createdAt;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getUsername(userId) {
        try {
            const targetUser = this.client.users.cache.get(userId);
            if (!targetUser) {
                return null;
            }
            return `${targetUser.username}#${targetUser.discriminator}`;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getAboutMe(userId) {
        try {
            const targetUser = await this.client.users.fetch(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.bio || "No 'About Me' information provided.";
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getUserAvatar(userId) {
        try {
            const targetUser = await this.client.users.fetch(userId, {cache: false});
            if (!targetUser) {
                return null;
            }

            return targetUser.displayAvatarURL({format: 'png', dynamic: true, size: 2048});
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async findCommonGuilds(targetUserId) {
        try {
            const targetUser = await this.client.users.fetch(targetUserId);
            if (!targetUser) {
                return null;
            }

            let mutualGuildNamesAndNicknames = [];

            await Promise.all(
                this.client.guilds.cache.map(async (guild) => {
                    try {
                        const member = await guild.members.fetch(targetUserId).catch(() => null);
                        if (member) {
                            const nickname = member.nickname || targetUser.username;
                            mutualGuildNamesAndNicknames.push({guildName: guild.name, nickname: nickname});
                        }
                    } catch (err) {
                        console.error(err);
                    }
                })
            );

            return mutualGuildNamesAndNicknames;
        } catch (err) {
            console.error(err);
            return -1;
        }
    }
}

module.exports = DiscordClient;