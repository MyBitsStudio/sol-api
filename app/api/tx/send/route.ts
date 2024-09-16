import {Connection, Transaction} from "@solana/web3.js";
import {NETWORK} from "@/config/site";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

        try {
            const connection = new Connection(NETWORK);
            const tx = Transaction.from(Buffer.from(webhookData.signedTx, "base64"));

            const txSignature = await connection.sendRawTransaction(tx.serialize());

            return NextResponse.json({ txSignature });
        } catch (e) {
            return NextResponse.json({ txSignature:"" });
        }

}