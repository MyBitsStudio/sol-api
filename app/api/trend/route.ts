import {NextResponse} from "next/server";
import {prisma} from "@/utils/pris";
import {trendTimes} from "@/config/site";
import {sendInfoMessage} from "@/app/api/webhook/route";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

    try{

        await prisma.trendingQueue.create({
            data: {
                tokenAddress: webhookData.address,
                time: trendTimes[webhookData.length],
                tokenName: webhookData.name,
                tag: webhookData.tag,
                telegram: String(webhookData.telegram),
                link: webhookData.channel
            }
        })

        // await sendInfoMessage({
        //     chatId: 7267264192,
        //     message: `Trending is queued for ${webhookData.address}`
        // })
        //
        // await sendInfoMessage({
        //     chatId: webhookData.telegram,
        //     message: `Your trending has been queued.`
        // })

        await sendInfoMessage({
            chatId: -1002454838436,
            message: `Trending requested for ${webhookData.address}`
        })

        return NextResponse.json({ ok: true })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}