import {Details} from "@/config/types";
import {prisma} from "@/utils/pris";
import {collectInfo, collectTrending} from "@/integrate/collect";

export async function mapBots(details: Details) {
    if (details === null) {
        return;
    }

    if (details === undefined) {
        return;
    }

    const buy = await prisma.tokenBuy.findUnique({
        where: {id: details.id},
    })

    const trend = await prisma.trendPosition.findUnique({
        where: {tokenAddress: details.tokenAddress},
    })

    let trending = -1;

    if (buy) {
        if(buy.expires < new Date()){
            return;
        }

        if(trend){
            trending = trend.position;
        }

        void collectInfo(details, buy, trending);
    } else {
        console.log("No Buy");
    }


}