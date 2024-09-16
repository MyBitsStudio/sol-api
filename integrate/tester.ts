import {Details} from "@/config/types";
import {Telegraf} from "telegraf";
import {Agent} from "node:http";


export async function sendTestMessage(details: Details) {

    const bot = new Telegraf('vz7231761650:AAGeT5jMV3lAScM6MEsmT_ydd9AE6Bd6QDY');

    if (details === null) {
        return;
    }

    if (details === undefined) {
        return;
    }

    try {
        await bot.telegram.sendMessage(-1002149168327, 'New Buy Alert').catch((err) => {
            console.log(`Ooops, encountered an error `, err)
        });
    } catch (error) {
        console.error(error);
    }
}