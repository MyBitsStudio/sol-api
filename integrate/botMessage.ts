import {BuyMessage, Details} from "@/config/types";
import {Input, Telegraf} from "telegraf";
import {fmt, bold, link, FmtString} from "telegraf/format";
import {prisma} from "@/utils/pris";
import {convertNumber} from "@/utils/misc";


export async function sendBuyMessage(details: BuyMessage) {

    if (details === null) {
        return;
    }

    if (details === undefined) {
        return;
    }


    try {

        for(let i = 0; i < details.details.botChannels.length; i++) {

            const bots = await prisma.botChannels.findUnique({
                where: {tokenKey: details.details.botChannels[i]},
            })

            if (!bots) {
                console.log("No Bots");
                continue;
            }

            const bot = new Telegraf(bots.tokenKey, {
                telegram: {
                    apiMode: 'bot',
                    testEnv: false
                }
            });

            const address = details.details.toAccount.slice(0, 5) + '...' + details.details.toAccount.slice(-5);
            const caps = convertNumber(details.cap);
            const newBuy = bold`${details.details.tokenName.toUpperCase()} BUY`;
            const emoji = '🎰';
            const emoji20 = emoji.repeat(40);
            const price = bold`🎲 : ${details.details.sol} SOL ( $ ${details.spent.toFixed(2)} )`;
            const got = bold`💵: ${details.details.token} $${details.details.tag}`;
            const newPrice = bold`💎: $ ${details.price}`;
            const owner = link(bold`👤: ${address}`, 'https://solscan.io/account/' + details.details.toAccount);
            const position = bold`📈: + ${details.position}`;
            const cap = bold`🏦: $ ${details.price} ( $${caps} )`;
            const tran = link(bold`🔗 TRANSACTION`, 'https://solscan.io/tx/' + details.details.signature);
            const chart = link(bold`📊 CHART`, 'https://dexscreener.com/solana/' + details.details.tokenAddress);
            const trending = link(bold`🎰 TRENDING`, 'https://t.me/professor_nahm');
            const support = link(bold`📩 SUPPORT`, 'https://t.me/professor_nahm');
            const trend = details.trending === -1 ? `` : link(bold`🎰 TRENDING ${details.trending} 🎰`, 'https://t.me/WIFLOUNGE1/141') ;
            const ad = link(bold`🎁 PURCHASE`, 'https://t.me/professor_nahm');

            let ad1, ad2, ad3, ad4;

            const ads = await prisma.ads.findMany();

            ad1 = ads[0] ? link(bold`🎰 ${ads[0].text}`, ads[0].url) : ad;
            ad2 = ads[1] ? link(bold`🎰 ${ads[1].text}`, ads[1].url) : ad;
            ad3 = ads[2] ? link(bold`🎰 ${ads[2].text}`, ads[2].url) : ad;
            ad4 = ads[3] ? link(bold`🎰 ${ads[3].text}`, ads[3].url) : ad;


            const format = fmt`
    ${newBuy} \n\n ${emoji20} \n\n ${price} \n ${got}  \n ${position} \n ${cap}  
    \n\n ${chart} | ${trending} | ${support} \n ${tran} | ${owner} \n\n ${ad1} | ${ad2} \n\ ${ad3} | ${ad4} \n\n  ${trend} \n\n
    `;

            try {

                const channels = bots.channels.map((channel: string) => {
                    return parseInt(channel);
                })

                for(let i = 0; i < channels.length; i++) {
                    await bot.telegram.sendAnimation(channels[i], Input.fromLocalFile("E:\\business\\elon\\sol-api\\public\\gifs\\WifBuy.mp4"), {
                        caption: format
                    }).catch((err) => {
                        console.log(`Ooops, encountered an error `, err)
                    });
                    bot.catch((err) => {
                        console.log(`Fuck, encountered an error `, err)
                    });

                }
            } catch (error) {
                console.error(error);
            }
        }


    } catch (error) {
        console.error(error);
    }
}

export async function updateTrendingMessage() {

    const messageId = 876;
    const bot = new Telegraf("7206357706:AAFf4355Lr1KralPI7v_qy4h_1ZCaZ5P3yQ", {
        telegram: {
            apiMode: 'bot',
            testEnv: false
        }
    });

    // @ts-ignore
    if(messageId === -1){
        await bot.telegram.sendAnimation(-1002149168327, Input.fromLocalFile("E:\\business\\elon\\sol-api\\public\\gifs\\WifBuy.mp4"), {
            caption: "PIN ME AND DONT DELETE!!"
        }).then((res) => {
            console.log("Trending Bot Pin Message", res);
        }).catch((err) => {
            console.log(`Shize, encountered an error `, err)
        });
        return;
    }

    const trending = await prisma.trendPosition.findMany();

    if(trending.length === 0){
        return;
    }

    const trend = trending.sort((a, b) => {
        return a.position - b.position;
    });

    let trendString : string[] = []


    for(let i = 0; i < trend.length; i++) {
        const trends = trend[i];

        const format = `🎰 ${trends.position} : ${trends.tokenName}   🏦($${convertNumber(trends.cap)})   💵($${trends.price})`

        trendString.push(format);

    }

    try {
        let formatted: string[] = [];
        for (let i = 0; i < trendString.length; i++) {
            formatted.push(`${trendString[i]}`);
        }

        let format = fmt`${bold`🎰 WIF TRENDING 🎰`} \n\n`;
        for(let i = 0; i < formatted.length; i++) {
            format = fmt`${format} ${link(bold`${formatted[i]}`, trend[i].link)} \n\n`;
            if(i === formatted.length - 1){
                format = fmt`${format} \n\n ${link(bold`🎰 BUY TRENDING`, 'https://t.me/professor_nahm')}`;
            }
        }

        await bot.telegram.editMessageCaption(-1002149168327, messageId, undefined, format).catch((err) => {
            console.log(`Shit, encountered an error `, err)
        });

    } catch (error) {
        console.error(error);
    }

}