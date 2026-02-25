import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "My Healthy Bowl",
  description: "Track your meals and calories",
  icons: {
    icon: "/logo-main.png",
    shortcut: "/logo-main.png",
    apple: "/logo-main.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("theme");
                  document.documentElement.setAttribute("data-theme", saved === "light" ? "light" : "dark");
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "dark");
                }
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
