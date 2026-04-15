import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { DataProvider } from "@/components/DataProvider";

export const metadata: Metadata = {
  title: "PowerWatch GenSan — SOCOTECO 2 Brownout Alerts",
  description:
    "Real-time brownout alerts, countdown timers, electricity rates, and bill calculator for SOCOTECO 2 areas in General Santos City.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PowerWatch",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <AppShell>
          <DataProvider>{children}</DataProvider>
        </AppShell>
      </body>
    </html>
  );
}
