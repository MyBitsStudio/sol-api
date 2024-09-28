import {BuyMessage, Details} from "@/config/types";
import {sendBuyMessage, updateTrendingMessage} from "@/integrate/botMessage";
import {Connection, ParsedTransactionMeta, ParsedTransactionWithMeta} from "@solana/web3.js";
import {requestAPINoBody} from "@/utils/api";
import {NETWORK} from "@/config/site";
import {prisma} from "@/utils/pris";
import {sendInfoMessage} from "@/integrate/infoBot";

export async function collectInfo(details: Details, buy:
    {
        id: string;
        createdAt: Date;
        tokenName: string;
        tokenAddress: string;
        bots: string[];
        expires: Date;
        gif: string;
    } | null, trending: number) {

    const connection = new Connection(NETWORK, 'confirmed');

    if (details === null) {
        return;
    }

    if (details === undefined) {
        return;
    }

    if (buy === null) {
        return;
    }

    const trans: ParsedTransactionWithMeta | null = await connection.getParsedTransaction(details.signature, {maxSupportedTransactionVersion: 0});

    if (!trans) {
        return;
    }

    let {preTokenBalances, postTokenBalances} = trans.meta as ParsedTransactionMeta;
    let pre = -1, post = 0, balanceChange: string = "0";
    let pres: number[] = [], posts:number[] = [];

    preTokenBalances?.forEach((balance, index) => {
        if(balance.mint === buy.tokenAddress){
            pres.push(balance.uiTokenAmount.uiAmount!);
        }
    });

    postTokenBalances?.forEach((balance, index) => {
        if(balance.mint === buy.tokenAddress){
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
       sol_price = res.data.data[0].price;
    }).catch((error) => {
        console.error(error);
    });

    const spent = details.sol * sol_price;

    let marketCap :number = 0, tokenPrice : number = 0;


    await requestAPINoBody(
        {
            accept: 'application/json',
            'X-Billing-Token' : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzI1NDI3NTA3IiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6ImVkNjMzYWQ2NmJkNTRjMzM4ZTlkMDM1ZDAzY2JiYTgyIn0.GLJ4kzLb9wtaBDeYfB9ECOn7sJBDavBK3Aok6XHv98I"
        },
        'GET',
        `https://solana.p.nadles.com/tokens/${buy.tokenAddress}`,
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

    void checkAds();

    void sendBuyMessage(buyMessage);

    void collectTrending(details);

    void mapTrending(details);
}

export async function checkAds(){
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

export async function collectTrending(details:Details) {
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

export async function mapTrending(details:Details){
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

    void updateTrendingMessage();

}