
import {NextResponse} from "next/server";
import {transformData} from "@/utils/transform";
import {Details, SOL_ADDRESS} from "@/config/types";
import {prisma} from "@/utils/pris";
import {mapBots} from "@/integrate/mapBots";

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

            console.log("events", events);

            const swap = events.swap;

            if(swap){
                let swapping;

                for (const key in transformData(swap)) {
                    swapping = transformData(swap[key]);
                }

                console.log("swapping", swapping);
                console.log("swapping mint", swapping[0].mint);
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

            await mapBots(details);

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