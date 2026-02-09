import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Food Tracker App",
  description: "Track your meals and calories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
