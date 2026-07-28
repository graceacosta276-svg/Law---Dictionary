import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata = {
  title: "My Law Dictionary",
  description: "A personal, growing law dictionary for first-year Philippine law students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Law Dictionary",
  },
};

export const viewport = {
  themeColor: "#7FA377",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
