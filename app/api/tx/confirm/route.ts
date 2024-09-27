import {Connection} from "@solana/web3.js";
import {NETWORK} from "@/config/site";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

        const connection = new Connection(NETWORK);

        const latestBlockhash = await connection.getLatestBlockhash("confirmed");
        try {
            const confirmation = await connection.confirmTransaction({
                signature: webhookData.txSignature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            });

            if (confirmation.value.err) {
                return NextResponse.json({ confirmed: false, message: "Transaction not confirmed" });
            }

            return NextResponse.json({ confirmed: true, message: "Transaction confirmed" });
        } catch (e) {
            return NextResponse.json({ confirmed: false, message: "Transaction not confirmed" });
        }

}