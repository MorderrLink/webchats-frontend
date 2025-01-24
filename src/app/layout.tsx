import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { SidebarProvider,  } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { UseSubscription } from "@/hooks/use-subscription";



// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "WebChats",
  description: "Web Messenger With Real Time Video Calls",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
// ${geistSans.variable} ${geistMono.variable}

  

  return (
    <html lang="en">
      <body
        className={` antialiased h-screen w-screen`}
      >
        <ClerkProvider>
        <SidebarProvider>
          <UseSubscription />
          <div className="flex flex-row h-full w-full">
            <AppSidebar />
            <main className="flex-1 w-full h-screen ">
              <Header />
              
              {children}
            </main>
          </div>

        </SidebarProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
