import {Markup, Telegraf} from 'telegraf';

export function StartBot(){
    const bot = new Telegraf("7259776617:AAH5cSrkEOqfcFcvKMGl3BMFYjGXVUF04M4");

    bot.start((ctx) => {
        ctx.reply('Hello ' + ctx.from.first_name + '!');
    });
    bot.help((ctx) => {
        ctx.reply('Send /start to receive a greeting');
        ctx.reply('Send /keyboard to receive a message with a keyboard');
        ctx.reply('Send /quit to stop the bot');
    });
    bot.command('quit', (ctx) => {
        // Explicit usage
        ctx.telegram.leaveChat(ctx.message.chat.id);// Context shortcut
        ctx.leaveChat();
    });
    bot.command('keyboard', (ctx) => {
        ctx.reply(
            'Keyboard',
            Markup.inlineKeyboard([
                Markup.button.callback('First option', 'first'),
                Markup.button.callback('Second option', 'second'),
            ])
        );
    });

    void bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}