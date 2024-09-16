import {Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {NETWORK} from "@/config/site";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const webhookData = await req.json()

    console.log(webhookData);

    try {

        const receiverAddress = "3H3aVKZN3pb9Kmd2pfQnAexPKQk2AGnFwLVtLNVp5twK";
        const connection = new Connection(NETWORK);

        const payer = new PublicKey(webhookData.payerAddress);
        const receiver = new PublicKey(receiverAddress);

        let transaction = new Transaction();

        console.log("amount", webhookData.amount)

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: payer,
                toPubkey: receiver,
                lamports: webhookData.amount as number * LAMPORTS_PER_SOL,
            })
        );

        console.log("transaction", transaction)

        const blockHash = (await connection.getLatestBlockhash("finalized"))
            .blockhash;

        console.log("blockHash", blockHash)

        transaction.feePayer = payer;
        transaction.recentBlockhash = blockHash;

        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: true,
        });

        console.log("serializedTransaction", serializedTransaction)

        const transactionBase64 = serializedTransaction.toString("base64");

        console.log("transactionBase64", transactionBase64)

        return NextResponse.json({tx: transactionBase64});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "An error occurred while processing the webhook request"})
    }
}