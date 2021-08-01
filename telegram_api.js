const { Telegraf, Markup } = require('telegraf')
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    send: function(data) {

        const keyboard = Markup.inlineKeyboard([ 
          [Markup.button.url('🌐 Quick Check 🌐', 'https://example.com/vaccine-by-district')], 
          [Markup.button.url('🌐 Cowin Self Registration 🌐', 'https://selfregistration.cowin.gov.in/')]
        ])

        const bot = new Telegraf(process.env.BOT_TOKEN)

        bot.startPolling()
        console.log('Telegram bot started.')
        bot.telegram.sendMessage(data.CHAT_ID, `${data.Details} \n🗓 ${data.Date} ⏰ ${data.Time}`, {reply_markup: keyboard.reply_markup, parse_mode: 'markdown'}).catch(console.error);
        console.log('Telegram triggered')
        bot.stop()

        process.once('SIGINT', () => bot.stop('SIGINT'))
        process.once('SIGTERM', () => bot.stop('SIGTERM'))
    }
}
