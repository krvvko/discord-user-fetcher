const express = require('express');
const path = require('path');
const DiscordClient = require('./modules/js/discord.js');
const app = express();
const client = new DiscordClient();

(async () => {
    await client.login();
})();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { delimiter: '%'});

app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        res.set('Content-Type', 'text/css');
    }
}));

app.get('/', async (req, res) => {
    const userList = [
        "789792247830675526", // Пашочек
        "231795547210514434", // етернал))
        "266903140354228224", // максим
        "315079824324558851", // рома
        "269415732973010945"
    ]
    const userId = userList[Math.random() * userList.length | 0];
    console.log(userId)
    const nitroSinceTimestamp = await client.getNitroSince(userId);
    const nitroSince = nitroSinceTimestamp ? new Date(nitroSinceTimestamp).toLocaleDateString() : null;
    const userData = {
        username: await client.getUsername(userId),
        creationDate: await client.getAccountCreationDate(userId),
        aboutMe: await client.getAboutMe(userId),
        avatarUrl: await client.getUserAvatar(userId),
        accentColor: await client.getUserAccentColor(userId) ? await client.getUserAccentColor(userId) : ["#1e2124", "#1e2124"],
        bannerUrl: await client.getUserBanner(userId),
        badges: await client.getUserBadges(userId),
        nitroStatus: await client.getNitroStatus(userId),
        nitroSince: nitroSince
    };
    res.render('layout.ejs', {
        ...userData,
        pageTitle: `Discord User Wrapper - krvvko`,
        body: `index`
    });
});

app.get('/user', async (req, res) => {
    const userId = req.query['uid'];
    if (!userId) {
        res.render('layout.ejs', {
            commonGuilds: null,
            pageTitle: `DUW - User ID not found`,
            body: `user`
        });
        return;
    }

    try {
        const nitroSinceTimestamp = await client.getNitroSince(userId);
        const nitroSince = nitroSinceTimestamp ? new Date(nitroSinceTimestamp).toLocaleDateString() : null;

        const userData = {
            commonGuilds: await client.findCommonGuilds(userId),
            userId: userId,
            username: await client.getUsername(userId),
            creationDate: await client.getAccountCreationDate(userId),
            aboutMe: await client.getAboutMe(userId),
            avatarUrl: await client.getUserAvatar(userId),
            accentColor: await client.getUserAccentColor(userId),
            bannerUrl: await client.getUserBanner(userId),
            badges: await client.getUserBadges(userId),
            isUserBot: await client.isUserBot(userId),
            nitroStatus: await client.getNitroStatus(userId),
            nitroSince: nitroSince
        };

        res.render('layout.ejs', {
            ...userData,
            pageTitle: `DUW - User ${userId}`,
            body: `user`
        });
    } catch (err) {
        console.error(err);
        res.render('layout.ejs', {
            commonGuilds: null,
            pageTitle: `DUW - Error ${err}`,
            body: `user`
        });
    }
});
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000}');
});