import {NextResponse} from "next/server";
import {prisma} from "@/utils/pris";
import {adTimes, trendTimes} from "@/config/site";
import {sendInfoMessage} from "@/app/api/webhook/route";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

    try{

        await prisma.adQueue.create({
            data: {
                address: webhookData.address,
                time: adTimes[webhookData.length],
                text: webhookData.text,
                url: webhookData.url,
                telegram: ""
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
            message: `Ad requested for ${webhookData.address}`
        })

        return NextResponse.json({ ok: true })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}