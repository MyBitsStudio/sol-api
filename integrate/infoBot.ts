import {Telegraf} from "telegraf";

export async function sendInfoMessage(data: any) {

    if(data === undefined) return
    if(data === null) return

    try{
        const bot = new Telegraf("7501374982:AAFOuWS6c6bJd2-q-Jr_1F9Trp9sIbivHUY", {
            telegram: {
                apiMode: 'bot',
                testEnv: false
            }
        });

        await bot.telegram.sendMessage(data.chatId, data.message)
    } catch (error) {
        console.error(error)
    }

}