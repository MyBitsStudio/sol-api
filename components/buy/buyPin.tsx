import {MouseEventHandler, useState} from "react";
import {GridLoader} from "react-spinners";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {requestAPI} from "@/utils/api";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {Transaction} from "@solana/web3.js";
import {fetcher} from "@/utils/use-data-fetch";
import {TxCreateData} from "@/remove/create";
import {TxSendData} from "@/remove/send";
import {TxConfirmData} from "@/remove/confirm";
import {PIN_COST} from "@/config/site";


export function PinBot(props: { toggle: MouseEventHandler<HTMLButtonElement> | undefined; }) {

    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [telegram, setTelegram] = useState('');
    const [length, setLength] = useState(0);

    const { publicKey, signTransaction, connected } = useWallet();
    const [txState, setTxState] = useState("initial");

    function verifyData(data: any) {

        if(data.name == null || data.address == null || data.telegram == null || data.tag == null){
            toast.error("Please fill out all fields");
            return false;
        }

        if(data.address.length <= 24){
            toast.error("Please verify your token address.");
            return false;
        }

        return true;

    }

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault();
        setLoading(true);

        if(name === '' || address === '' || tag === ''){
            toast.error("Please fill out all fields");
            setLoading(false);
            return;
        }

        if(!verifyData({name: name, address: address, tag: tag, telegram:telegram })){
            setLoading(false);
            return;
        }


        void onTxClick();

    }

    const onTxClick = () => {
        async function run() {
            if (connected && publicKey && signTransaction && txState !== "loading") {
                setTxState("loading");
                toast.info("Creating transaction...");

                try {
                    // Create transaction
                    let {tx: txCreateResponse} = await fetcher<TxCreateData>(
                        "/api/tx/create",
                        {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                "Content-type": "application/json; charset=UTF-8"
                            },
                            body: JSON.stringify({
                                payerAddress: publicKey.toBase58(),
                                amount: PIN_COST
                            }),

                        }
                    );

                    const tx = Transaction.from(Buffer.from(txCreateResponse, "base64"));

                    // Request signature from wallet
                    const signedTx = await signTransaction(tx);
                    const signedTxBase64 = signedTx.serialize().toString("base64");

                    // Send signed transaction
                    let {txSignature} = await fetcher<TxSendData>("/api/tx/send", {
                        method: "POST",
                        body: JSON.stringify({signedTx: signedTxBase64}),
                        headers: {"Content-type": "application/json; charset=UTF-8"},
                    });

                    setTxState("success");
                    toast.success(
                        (t) => (
                            <a
                                href={`https://solscan.io/tx/${txSignature}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Transaction created
                            </a>
                        )
                    );

                    toast.info(
                        "Confirming transaction..."
                    );

                    const confirmationResponse = await fetcher<TxConfirmData>(
                        "/api/tx/confirm",
                        {
                            method: "POST",
                            body: JSON.stringify({txSignature}),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8",
                            },
                        }
                    );

                    if (confirmationResponse.confirmed) {
                        toast.promise(requestAPI({
                            "accept": "application/json",
                        }, 'POST', JSON.stringify({
                            name:name ,
                            address: address,
                            tag:tag,
                            telegram: telegram
                        }), "/api/pin/", true), {
                            pending: 'Submitting...',
                            success: 'Purchase successful. You will receive a message to start your pin!',
                            error: 'Submission failed. Please contact @wif_professor for support.'
                        }).then(r => {
                            console.log(r);
                            setLoading(false);
                        }).catch(e => {
                            console.error(e);
                            toast.error("Submission failed. Please contact @wif_professor for support.");
                        });
                    } else {
                        toast.success("Error confirming transaction");
                    }
                } catch (error: any) {
                    setTxState("error");
                    toast.error("Error creating transaction");
                    setLoading(false);
                }
            }
        }

        void run();
    }


    return (
        <>
            {connected ? (
                <>
                {loading ? (
                        <div>
                            <div className={"flex justify-center"}>
                                <GridLoader />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className={"flex justify-center"}>
                                <WalletMultiButton className="btn" />
                            </div>

                            <div>
                                <br/>
                                <p className={"text-center"}>
                                   Purchase a pin post in our Lounge! Get the exposure you need to bump your token.
                                    <br/>

                                    <b>Pin Post Cost 1 SOL and includes a spot on our daily AMA</b>
                                </p>
                                <br />
                                <span className="relative flex justify-center">
                          <div
                              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"
                          ></div>

                          <span className="relative z-10 bg-white px-6">Purchase Pin Post</span>
                        </span>
                                <br />


                                <form onSubmit={handleSubmit}>
                                    <h2 className={"text-center"}>Token Name</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Ad Text</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="ElonWifHat"
                                                required={true}
                                                onChange={(e) => setName(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Token Address</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Token Address</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="DpDuHScSNi6LQZ9hjrwS2fjfgfeoAH1jRgcXt38rDrEw"
                                                required={true}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Token Tag</h2>
                                    <div>
                                        <label htmlFor="text" className="sr-only">URL</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="ELON"
                                                required={true}
                                                onChange={(e) => setTag(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Telegram Tag</h2>
                                    <div>
                                        <label htmlFor="text" className="sr-only">Telegram</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="@QuantumComputed"
                                                required={true}
                                                onChange={(e) => setTelegram(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                     <br/>

                                    <button
                                        type="submit"
                                        className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                                    >
                                        Submit
                                    </button>

                                </form>
                            </div>
                        </div>
                )}
                </>
            ) : (
                <div className={"flex justify-center my-5"}>
                    <WalletMultiButton className="btn"/>
                </div>
            )}
        </>
    )
}