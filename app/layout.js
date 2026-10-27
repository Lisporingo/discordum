import "./globals.css";

export const metadata = {
  title: "Sohbet",
  description: "Arkadaşlar için ses ve yazı sohbeti",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-[#313338] text-gray-100 antialiased">{children}</body>
    </html>
  );
}