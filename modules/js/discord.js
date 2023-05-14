const Discord = require('discord.js-selfbot-v13');
const config = require('../../config.json');

class DiscordClient {
    constructor() {
        this.client = new Discord.Client({
            syncStatus: false,
            checkUpdate: false
        });
        this.userCache = new Map();
        this.token = config.discordToken;
    }

    async login() {
        return new Promise(async (resolve) => {
            this.client.on('ready', async () => {
                console.log(`Logged in as ${this.client.user.tag}`);
                // Set the status to online
                let r = new Discord.RichPresence()
                    .setApplicationId('817229550684471297')
                    .setURL('https://youtube.com/watch?v=MqsrmhNmN3k')
                    .setType('STREAMING')
                    .setState('Server is up for:')
                    .setName('Discord Member Fetcher')
                    .setDetails('Fetching user data')
                    .setStartTimestamp(Date.now())
                    .setAssetsLargeImage('mp:attachments/1086422556258615406/1105135324251828304/b9f696010b6d410e936cd59f75e23507.png')
                    .setAssetsLargeText('Fetching...')
                    .addButton('Official WebSite', 'https://discord.krvvko.me/')
                    .addButton('GitHub', 'https://github.com/krvvko/discord-user-fetcher')
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

    async fetchUser(userId) {
        if (this.userCache.has(userId)) {
            return this.userCache.get(userId);
        }

        try {
            let targetUser = await this.client.users.fetch(userId, {force: true});

            if (targetUser.partial) {
                targetUser = await targetUser.fetch();
            }
            this.userCache.set(userId, targetUser);
            return targetUser;
        } catch (err) {
            console.error(`Error fetching user ${userId}: ${err}`);
            return null;
        }
    }
    async getAccountCreationDate(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            const creationDate = targetUser.createdAt;
            return creationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getUsername(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            return `${targetUser.username}<span class="discriminator">#${targetUser.discriminator}</span>`;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getAboutMe(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
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
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.displayAvatarURL({format: 'png', dynamic: true, size: 2048});
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async isUserBot(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.bot;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async findCommonGuilds(targetUserId) {
        try {
            const targetUser = await this.fetchUser(targetUserId);
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
                            let iconUrl = guild.iconURL({ format: 'png', dynamic: true, size: 2048 });
                            mutualGuildNamesAndNicknames.push({guildName: guild.name, nickname: nickname, icon: iconUrl});
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

    async getUserBanner(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            if (targetUser.banner == null) {
                return null;
            }
            const extension = targetUser.banner.startsWith('a_') ? 'gif' : 'png';
            return `https://cdn.discordapp.com/banners/${userId}/${targetUser.banner}.${extension}?size=1024`
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getUserAccentColor(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.hexThemeColor;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getUserBadges(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }

            const badges = targetUser.badges;
            return badges;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getNitroStatus(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser) {
                return null;
            }
            return targetUser.nitroType;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getNitroSince(userId) {
        try {
            const targetUser = await this.fetchUser(userId);
            if (!targetUser || !targetUser.premiumSince) {
                return null;
            }
            let date = new Date(targetUser.premiumSince);
            let formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            return formattedDate;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

}

module.exports = DiscordClient;