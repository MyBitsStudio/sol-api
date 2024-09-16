
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
        let token : string;

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
            const build1 = build[0];

            if(!build1){
                console.log("No build1");
                return NextResponse.json({ error: "No build1" })
            }

            if(build1.mint !== SOL_ADDRESS){
                token = build1.mint;
            } else {
                token = build[1].mint;
            }

            const user = await prisma.tokenBuy.findUnique({
                where: {tokenAddress: token},
            })

            if (!user) {
                console.log("No User");
                return;
            }

            if(user.expires < new Date()) {
                console.log("Expired 1");
                return;
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
                tag: user.tag
            }

            void mapBots(details);

            return NextResponse.json({ ok: true })

        } else if(breaks[1] === "swapped" && breaks[6] === "SOL") {
            console.log("sold " + breaks[2] + " for " + breaks[5]);
            return NextResponse.json({ error: "No breaks length"})
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}