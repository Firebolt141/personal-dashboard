import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

export const metadata = {
  title: "Personal Dashboard",
  description: "Your personal journey dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
