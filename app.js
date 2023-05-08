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

app.get('/', (req, res) => {
    res.render('layout.ejs', {
        pageTitle: `Discord User Wrapper - krvvko`,
        body: `index`
    });
});

app.get('/user', async (req, res) => {
    const userId = req.query['uid'];

    if (!userId) {
        res.render('layout.ejs', {
            commonGuilds: null,
            pageTitle: `DWP - User ID not found`,
            body: `user`
        });
        return;
    }

    try {
        const commonGuilds = await client.findCommonGuilds(userId);
        const username = await client.getUsername(userId);
        const creationDate = await client.getAccountCreationDate(userId);
        const aboutMe = await client.getAboutMe(userId);
        const avatarUrl = await client.getUserAvatar(userId);

        res.render('layout.ejs', {
            commonGuilds: commonGuilds,
            username: username,
            creationDate: creationDate,
            aboutMe: aboutMe,
            avatarUrl: avatarUrl,
            pageTitle: `DWP - User ${userId}`,
            body: `user`
        });
    } catch (err) {
        console.error(err);
        res.render('layout.ejs', {
            commonGuilds: null,
            pageTitle: `DWP - Error ${err}`,
            body: `user`
        });
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000}');
});