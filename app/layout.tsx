import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Staff Portal - St. Paul's College",
  description: "Teacher Leave Management System",
  icons: {
    icon: [
      { url: "/stpaulslogo.png" }
    ],
    shortcut: ["/stpaulslogo.png"],
    apple: ["/stpaulslogo.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="antialiased">
        <Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: "#111",
      color: "#fff",
      border: "1px solid #333",
    },
  }}
/>
        {children}
        
      </body>
    </html>
  );
}
