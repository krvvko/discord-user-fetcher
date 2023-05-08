const Discord = require('discord.js-selfbot-v13');
const config = require('../../config.json');

class DiscordClient {
    constructor() {
        this.client = new Discord.Client({
            checkUpdate: false
        });
        this.token = config.discordToken;
        this.login();
    }

    async login() {
        await this.client.login(this.token);
        // await this.fetchAllGuildMembersWithRetry();
    }

    async fetchAllGuildMembersWithRetry(retries = 3, delay = 5000) {
        for (let i = 0; i < retries; i++) {
            try {
                this.guildsMembers = await Promise.all(
                    this.client.guilds.cache.map(guild => guild.members.fetch())
                );
                console.log('Successfully fetched guild members.');
                return;
            } catch (error) {
                if (error.code === 'GUILD_MEMBERS_TIMEOUT') {
                    console.warn(`Attempt ${i + 1}: Failed to fetch guild members. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('An unexpected error occurred while fetching guild members:', error);
                    break;
                }
            }
        }
    }

    async initialize() {
        return new Promise(async (resolve) => {
            this.client.on('ready', async () => {
                console.log(`Logged in as ${this.client.user.tag}`);
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
        });
    }

    async getUserStatus(userId) {
        try {
            const targetUser = await this.client.users.fetch(userId);
            if (!targetUser) {
                return null;
            }
            console.log(targetUser)
            const targetUserPresence = targetUser.presence;

            if (targetUserPresence && targetUserPresence.status) {
                return targetUserPresence.status;
            } else {
                return "offline";
            }
        } catch (err) {
            console.error(err);
            return null;
        }
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