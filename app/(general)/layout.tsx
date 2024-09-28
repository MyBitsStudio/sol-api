import {ReactNode} from "react";
import {SiteHeader} from "@/components/layout/header";
import {ToastContainer} from "react-toastify";
import {Metadata} from "next";

interface RootLayoutProps {
    children: ReactNode
}

export const metadata: Metadata = {
    title: 'WIF Trending',
    description:
        'WIF Trending is the king of trending on SOL',
    twitter: {
        title: 'WIF Trending',
        description:
            'WIF Trending is the king of trending on SOL',
        images: '/gifs/WifBuy.mp4',
        card: 'summary_large_image',
        site: '@WIFTRENDING',
    },
    openGraph: {
        title: 'WIF Trending',
        description:
            'WIF Trending is the king of trending on SOL',
        images: '/gifs/WifBuy.mp4',
        url: 'https://www.wiftrending.app/',
        type: 'website',
    },
}

export default function RootLayout({ children }: RootLayoutProps) {

    return (
        <>
            <div>
                <SiteHeader />
                <ToastContainer
                    autoClose={5000}
                    hideProgressBar={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <main className="flex-1">{children}</main>
                {/*<Footer />*/}
            </div>

        </>
    )
}