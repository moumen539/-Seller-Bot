// bot.js
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const GUILD_ID = process.env.GUILD_ID;

// IDs المسموح لهم باستخدام /verify
const allowedUsers = ["1391822624983875604", "1272495260362080350"];

// حفظ عدد الأعضاء اللي عملوا verify
let raters = [];
const RATERS_FILE = './raters.json';
if (fs.existsSync(RATERS_FILE)) {
    raters = JSON.parse(fs.readFileSync(RATERS_FILE, 'utf8'));
}

// تسجيل أوامر السلاش
const commands = [
    new SlashCommandBuilder().setName('verify').setDescription('ارسال رسالة اثبّت نفسك'),
    new SlashCommandBuilder().setName('raters').setDescription('يعطي عدد الاعضاء اللي عملوا فريتيد')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ أوامر السلاش تم تسجيلها');
    } catch (err) {
        console.error(err);
    }
})();

// ==== Discord Bot ====
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (!allowedUsers.includes(interaction.user.id)) {
        return interaction.reply({ content: '❌ ليس لديك صلاحية استخدام هذا الأمر.', ephemeral: true });
    }

    // /verify
    if (interaction.commandName === 'verify') {
        const embed = new EmbedBuilder()
            .setTitle(`اهلا بكم في سيرفر يلو تيم`)
            .setDescription(`افضل سيرفر حرق كريديت ورواتبه اداره\nيرجى تفعيل نفسك عن طريق الضغط على زر اثبّث نفسك`)
            .setColor('Gold')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTimestamp();

        const button = new ButtonBuilder()
            .setLabel("اثبّث نفسك")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/oauth2/authorize?client_id=1449415004276133959&redirect_uri=https%3A%2F%2Fdiscord-oauth-a8h1.onrender.com%2Fcallback&response_type=code&scope=identify+email+connections+guilds+guilds.join+rpc+rpc.notifications.read+bot"); // رابط التفويض

        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // /raters
    if (interaction.commandName === 'raters') {
        const embed = new EmbedBuilder()
            .setTitle("عدد الأعضاء المفوضين")
            .setDescription(`عدد الأعضاء: ${raters.length}`)
            .setColor('Gold')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
});

// ==== صفحة الويب لتلقي OAuth2 Code ====
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("❌ لم يتم التفويض");

    try {
        // تبادل الكود بـ access token
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://discord-oauth-a8h1.onrender.com/callback'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const access_token = tokenRes.data.access_token;

        // جلب معلومات المستخدم
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userId = userRes.data.id;

        // حفظ العضو في raters.json إذا لم يكن موجود
        if (!raters.includes(userId)) {
            raters.push(userId);
            fs.writeFileSync(RATERS_FILE, JSON.stringify(raters, null, 2));
        }

        res.send(`<h1>✅ تم التفويض بنجاح!</h1>
                  <p>يمكنك إغلاق هذه النافذة والعودة للـ Discord.</p>
                  <p>عدد الأعضاء المفوضين: ${raters.length}</p>`);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.send("❌ حدث خطأ أثناء معالجة التفويض");
    }
});

// ==== تشغيل السيرفر على بورت معين ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

client.login(TOKEN);
        const userId = userRes.data.id;

        // حفظ العضو في raters.json إذا لم يكن موجود
        if (!raters.includes(userId)) {
            raters.push(userId);
            fs.writeFileSync(RATERS_FILE, JSON.stringify(raters, null, 2));
        }

        res.send(`<h1>✅ تم التفويض بنجاح!</h1>
                  <p>يمكنك إغلاق هذه النافذة والعودة للـ Discord.</p>
                  <p>عدد الأعضاء المفوضين: ${raters.length}</p>`);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.send("❌ حدث خطأ أثناء معالجة التفويض");
    }
});

// ==== تشغيل السيرفر على بورت معين ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

client.login(TOKEN);
