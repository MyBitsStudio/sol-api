
import {NextResponse} from "next/server";
import {transformData} from "@/utils/transform";
import {BuyMessage, Details, SOL_ADDRESS} from "@/config/types";
import {prisma} from "@/utils/pris";
import {Connection, ParsedTransactionMeta, ParsedTransactionWithMeta} from "@solana/web3.js";
import {NETWORK} from "@/config/site";
import {requestAPINoBody} from "@/utils/api";
import {Telegraf} from "telegraf";
import {convertNumber} from "@/utils/misc";
import {bold, fmt, link} from "telegraf/format";

const connection = new Connection(NETWORK, 'confirmed');

export async function POST(req: Request){
    const webhookData = await req.json()

    console.log("receive", webhookData);

    try{

        let transformedObject: any = {};

        for (const key in transformData(webhookData)) {
            transformedObject = transformData(webhookData[key]);
        }

       // console.log("key", transformedObject);
        const type = transformedObject.type;


        if(!transformedObject){
            return NextResponse.json({ error: "Invalid or empty data in the webhook request"})
        }

        const build = JSON.parse(JSON.stringify(transformedObject.tokenTransfers));

        console.log("build", build);

        if (transformedObject.transactionError !== null && transformedObject.transactionError !== undefined) {
            console.log("Transaction Error", transformedObject.transactionError);
            return NextResponse.json({ error: "Transaction Error"})
        }

        if (type !== "SWAP" && type !== "TRANSFER") {
            console.log("Not a swap", transformedObject.type);
            return NextResponse.json({ error: "Not a swap or transfer"})
        }

        const breaks = transformedObject.description.split(" ");

        let solAmount : number = 0;
        let tokenAmount : number = 0;
        let toAccount : string ;


        if(!breaks){
            console.log("No breaks");
            return NextResponse.json({ error: "No breaks"})
        }

        if(breaks.length < 1){
            console.log("No breaks");
            return NextResponse.json({ error: "No breaks length"})
        }

        if(breaks[1] === "swapped" && breaks[3] === "SOL"){
            solAmount = Number(breaks[2]);
            tokenAmount = Number(breaks[5]);
            toAccount = breaks[0];

            let token : string;

            const events = transformedObject.events;

            //console.log("events", events);

            const swap = events.swap;

            if(swap){
                let swapping;

                for (const key in transformData(swap)) {
                    swapping = transformData(swap[key]);
                }

                //console.log("swapping", swapping);
                //console.log("swapping mint", swapping[0].mint);
                token = swapping[0].mint;
            } else {
                console.log("No swap");
                return NextResponse.json({ error: "No swap"})
            }


            const user = await prisma.tokenBuy.findUnique({
                where: {tokenAddress: token},
            })

            if (!user) {
                console.log("No User for token "+ token);
                return NextResponse.json({ error: "No user"})
            }

            if(user.expires < new Date()) {
                console.log("Expired 1");
                return NextResponse.json({ error: "Expired"})
            }

            const details : Details = {
                sol: solAmount,
                token: tokenAmount,
                toAccount: toAccount!,
                signature: transformedObject.signature,
                id: user.id,
                tokenName: user.tokenName,
                tokenAddress: user.tokenAddress,
                botChannels: user.bots,
                tag: user.tag,
                gif: user.gif
            }

            const trend = await prisma.trendPosition.findUnique({
                where: {tokenAddress: details.tokenAddress},
            })

            let trending = -1;

            if (user) {
                if(user.expires < new Date()){
                    console.log("Expired 1");
                    return;
                }

                if(trend){
                    trending = trend.position;
                }

                const trans: ParsedTransactionWithMeta | null = await connection.getParsedTransaction(details.signature, {maxSupportedTransactionVersion: 0});

                if (!trans) {
                    console.log("No Transaction");
                    return;
                }

                let {preTokenBalances, postTokenBalances} = trans.meta as ParsedTransactionMeta;
                let pre = -1, post = 0, balanceChange: string = "0";
                let pres: number[] = [], posts:number[] = [];

                preTokenBalances?.forEach((balance, index) => {
                    if(balance.mint === user.tokenAddress){
                        pres.push(balance.uiTokenAmount.uiAmount!);
                    }
                });

                postTokenBalances?.forEach((balance, index) => {
                    if(balance.mint === user.tokenAddress){
                        posts.push(balance.uiTokenAmount.uiAmount!);
                    }
                });

                if(pres.length > 0){
                    pre = Math.max(...pres);
                }

                if(pres.length > 1){
                    post = Math.max(...posts);
                }


                if(pre === -1){
                    console.log("No Pre");
                } else if(pre === 0){
                    balanceChange = "100";
                } else {
                    balanceChange = (-((post - pre) / pre) * 100).toFixed(3) + "%";
                }

                let sol_price = 0;

                await requestAPINoBody(
                    {
                        accept: 'application/json',
                    },
                    'GET',
                    'https://api-v3.raydium.io/pools/info/mint?mint1=So11111111111111111111111111111111111111112&poolType=all&poolSortField=default&sortType=desc&pageSize=1&page=1',
                    false
                ).then((res) => {
                    const price = res.data.data[0].price;
                    console.log(price);
                    sol_price = price;
                }).catch((error) => {
                    console.error(error);
                });

                const spent = details.sol * sol_price;

                if(spent < user.minBuy){
                    console.log("Less than minimum");
                    return NextResponse.json({ error: "Less than 5"})
                }

                let marketCap :number = 0, tokenPrice : number = 0;


                await requestAPINoBody(
                    {
                        accept: 'application/json',
                        'X-Billing-Token' : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzI1NDI3NTA3IiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6ImVkNjMzYWQ2NmJkNTRjMzM4ZTlkMDM1ZDAzY2JiYTgyIn0.GLJ4kzLb9wtaBDeYfB9ECOn7sJBDavBK3Aok6XHv98I"
                    },
                    'GET',
                    `https://solana.p.nadles.com/tokens/${user.tokenAddress}`,
                    false
                ).then((res) => {
                    if(res.pools) {
                        if (res.pools.length === 0) {
                            marketCap = -1;
                            tokenPrice = -1;
                        } else {
                            marketCap = (res.pools[0].marketCap.usd).toFixed(0);
                            tokenPrice = (res.pools[0].price.usd).toFixed(8);
                        }
                    }

                });

                const buyMessage : BuyMessage = {
                    details: details,
                    spent: spent,
                    position: balanceChange,
                    cap: marketCap,
                    price: ""+tokenPrice,
                    trending: trending
                }

                await checkAds().then(async () => {
                    console.log("Ads Checked");
                    await collectTrending(details).then(async () => {
                        console.log("Trending Collected");
                        await mapTrending(details).then(async () => {
                            console.log("Trending Mapped");
                            await sendBuyMessage(buyMessage).then(async () => {
                                console.log("Buy Message Sent");
                                await updateTrendingMessage().then(() => {
                                    console.log("Trending Message Updated");
                                    return NextResponse.json({ok: true})
                                })
                            })
                        })
                    })
                }).finally(() => {
                    console.log("All Done");
                    return NextResponse.json({ ok: true })
                });


            } else {
                console.log("No Buy");
            }

            return NextResponse.json({ ok: true })

        } else {
            return NextResponse.json({ error: "Not a buy"})
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}

async function checkAds(){
    const ads = await prisma.ads.findMany();

    if(ads.length !== 0){
        ads.map(async (ad) => {
            if(ad.expiresAt < new Date()){
                await prisma.ads.delete({
                    where: {id: ad.id}
                });
            }
        });
    }


    const adsNew = await prisma.ads.findMany();

    if(adsNew.length < 4){
        const check = 4 - adsNew.length;

        const queue = await prisma.adQueue.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        });

        if(queue.length !== 0){
            for(let i = 0; i < check; i++){
                const ad = queue[i];

                if(queue[i]) {
                    await prisma.adQueue.delete({
                        where: {id: ad.id}
                    });

                    await prisma.ads.create({
                        data: {
                            text: ad.text,
                            url: ad.url,
                            expiresAt: new Date(new Date().getTime() + (1000 * 60 * 60 * ad.time)),
                            address : ad.address
                        }
                    });
                } else {
                    break;
                }
            }
        }
    }
}

async function collectTrending(details:Details) {
    const trending = await prisma.trending.findMany();

    if (details === null) {
        console.log("No Data 4");
        return;
    }

    if (details === undefined) {
        console.log("No Data 5");
        return

    }

    if(trending.length === 0){
        return;
    }

    const trend = trending.find((trend) => trend.tokenAddress === details.tokenAddress);

    if(trend){
        await prisma.trending.update({
            where: {id: trend.id},
            data: {
                sol: trend.sol + details.sol
            }
        });
    }
}

async function mapTrending(details:Details){
    const trending = await prisma.trending.findMany();

    if(trending.length === 0){
        return;
    }

    trending.map(async (trend) => {

        if (trend.expiresAt < new Date()) {
            await prisma.trending.delete({
                where: {id: trend.id}
            });
            await prisma.trendPosition.delete({
                where: {tokenAddress: trend.tokenAddress}
            });
        }
    });

    const trendNew = await prisma.trending.findMany({
        take:10,
        orderBy: {
            sol: 'desc'
        }
    });

    if(trendNew.length === 0){
        return;
    }

    if(trendNew.length < 10){

        const check = 10 - trendNew.length;

        const queue = await prisma.trendingQueue.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        });

        if(queue.length !== 0){

            for(let i = 0; i < check; i++){
                const trend = queue[i];

                if(queue[i]) {
                    await prisma.trendingQueue.delete({
                        where: {id: trend.id}
                    });

                    await prisma.trending.create({
                        data: {
                            sol: 0.00,
                            tokenName: trend.tokenName,
                            tokenAddress: trend.tokenAddress,
                            expiresAt: new Date(new Date().getTime() + (1000 * 60 * 60 * trend.time))
                        }
                    });

                    await prisma.trendPosition.create({
                        data: {
                            tokenAddress: trend.tokenAddress,
                            tokenName: trend.tokenName,
                            position: 10,
                            price: ""+0.00,
                            cap: 0,
                            tag: trend.tag,
                            link: trend.link
                        }
                    });

                    await sendInfoMessage({
                        chatId: Number(trend.telegram),
                        message: `Your trending has started for ${trend.tokenName}! Check it out now!`
                    })
                } else {
                    break;
                }
            }
        }

    }

    const reorder = await prisma.trending.findMany({
        take:10,
        orderBy: {
            sol: 'desc'
        }
    });

    if(reorder.length === 0){
        return;
    }

    for(let i = 0; i < reorder.length; i++){

        let marketCap :number = 0, tokenPrice : number = 0;

        await requestAPINoBody(
            {
                accept: 'application/json',
                'X-Billing-Token' : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzI1NDI3NTA3IiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6ImVkNjMzYWQ2NmJkNTRjMzM4ZTlkMDM1ZDAzY2JiYTgyIn0.GLJ4kzLb9wtaBDeYfB9ECOn7sJBDavBK3Aok6XHv98I"
            },
            'GET',
            `https://solana.p.nadles.com/tokens/${reorder[i].tokenAddress}`,
            false
        ).then((res) => {
            if(res.pools) {
                if (res.pools.length === 0) {
                    marketCap = -1;
                    tokenPrice = -1;
                } else {
                    marketCap = res.pools[0].marketCap.usd;
                    tokenPrice = (res.pools[0].price.usd).toFixed(8);
                }
            }
        });

        await prisma.trendPosition.update({
            where: {tokenAddress: reorder[i].tokenAddress},
            data: {
                position: i+1,
                price: ""+tokenPrice,
                cap: marketCap
            }
        });
    }

}

async function sendBuyMessage(details: BuyMessage) {

    if (details === null) {
        console.log("No Data 4");
        return;
    }

    if (details === undefined) {
        console.log("No Data 5");
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
            const owner = link(bold`👤`, 'https://solscan.io/account/' + details.details.toAccount);
            const position = bold`📈: + ${details.position}`;
            const cap = bold`🏦: $ ${details.price} ( $${caps} )`;
            const tran = link(bold`🔗`, 'https://solscan.io/tx/' + details.details.signature);
            const chart = link(bold`📊`, 'https://dexscreener.com/solana/' + details.details.tokenAddress);
            const trending = link(bold`🎰`, 'https://t.me/WIFTRENDINGCASINO/3013/3020');
            const support = link(bold`📩`, 'https://t.me/wif_professor');
            const trend = details.trending === -1 ? `` : link(bold`🎰 TRENDING ${details.trending} 🎰`, 'https://t.me/WIFTRENDINGCASINO/3013/3020') ;
            const ad = link(bold`🎁 BUY AD`, 'https://www.wiftrending.app');

            let ad1, ad2, ad3, ad4;

            const ads = await prisma.ads.findMany();

            const anim = details.details.gif === "none" ? "https://igate.email/wif_assets/WifBuy.mp4" : details.details.gif;

            ad1 = ads[0] ? link(bold`🎰 ${ads[0].text}`, ads[0].url) : ad;
            ad2 = ads[1] ? link(bold`🎰 ${ads[1].text}`, ads[1].url) : ad;
            ad3 = ads[2] ? link(bold`🎰 ${ads[2].text}`, ads[2].url) : ad;
            ad4 = ads[3] ? link(bold`🎰 ${ads[3].text}`, ads[3].url) : ad;


            const format = fmt`
    ${newBuy} \n\n ${emoji20} \n\n ${price} \n ${got}  \n ${position} \n ${cap}  
     \n ${ad1} | ${ad2} \n\ ${ad3} | ${ad4} \n\n  ${trend} \n\n ${chart} | ${trending} | ${support} | ${tran} | ${owner}
    `;

            try {

                const channels = bots.channels.map((channel: string) => {
                    return channel;
                })

                for(let i = 0; i < channels.length; i++) {
                    let message_thread = undefined;
                    let channel = undefined;

                    if(channels[i].includes(":")){
                        const split = channels[i].split(":");
                        channel = parseInt(split[0]);
                        message_thread = parseInt(split[1]);
                    } else {
                        channel = parseInt(channels[i]);
                    }

                    console.log("sending...");

                    await bot.telegram.sendAnimation(channel, anim, {
                        caption: format,
                        message_thread_id: message_thread
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

async function updateTrendingMessage() {

    const messageId = 3020;
    const bot = new Telegraf("8013395656:AAHKFh1K-hYKgGdgV4ugTvWDbTGRO-a0oFw", {
        telegram: {
            apiMode: 'bot',
            testEnv: false
        }
    });

    // @ts-ignore
    if(messageId === -1){
        await bot.telegram.sendAnimation(-1002232500109, "https://igate.email/wif_assets/WifBuy.mp4", {
            caption: "PIN ME AND DONT DELETE!!",
            message_thread_id: 3013
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
                format = fmt`${format} \n\n ${link(bold`🎰 BUY TRENDING 🎰`, 'https://www.wiftrending.app')}`;
            }
        }

        await bot.telegram.editMessageCaption(-1002232500109, messageId, undefined, format, {

        }).catch((err) => {
            console.log(`Shit, encountered an error `, err)
        });

    } catch (error) {
        console.error(error);
    }

}

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