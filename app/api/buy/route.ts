import {NextResponse} from "next/server";
import {prisma} from "@/utils/pris";
import {sendInfoMessage} from "@/integrate/infoBot";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

    try{
        await prisma.buyBotWaiting.create({
            data: {
                tokenName: webhookData.name,
                tokenAddress: webhookData.address,
                tag: webhookData.tag,
                owner: webhookData.owner,
                telegram: webhookData.telegram,
                channel: webhookData.channel,
                link: webhookData.link,
            }
        })

        await sendInfoMessage({
            chatId: 7267264192,
            message: `Buy Bot requested for ${webhookData.name}`
        })

        await sendInfoMessage({
            chatId: -1002454838436,
            message: `Buy Bot requested for ${webhookData.name}`
        })

        return NextResponse.json({ ok: true })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}