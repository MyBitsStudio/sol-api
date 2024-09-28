import {NextResponse} from "next/server";
import {prisma} from "@/utils/pris";
import {adTimes, trendTimes} from "@/config/site";
import {sendInfoMessage} from "@/app/api/webhook/route";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

    try{

        await prisma.pinPost.create({
            data: {
                tokenName: webhookData.name,
                tokenAddress: webhookData.address,
                tag: webhookData.tag,
                message: "",
                telegram: webhookData.telegram
            }
        })

        await sendInfoMessage({
            chatId: -1002454838436,
            message: `Pin Post requested for ${webhookData.telegram}`
        })

        return NextResponse.json({ ok: true })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while processing the webhook request"})
    }
}