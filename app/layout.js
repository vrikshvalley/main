import "../styles/globals.scss";
import Providers from "./providers";
import AutoLogoutProvider from "@/components/general/AutoLogoutProvider";

export const metadata = {
  title: "Vriksh Valley",
  description: "Minimal App Router starter with Redux Toolkit cart",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AutoLogoutProvider>
            <div className="container">{children}</div>
          </AutoLogoutProvider>
        </Providers>
      </body>
    </html>
  );
}
