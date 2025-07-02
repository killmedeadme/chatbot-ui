// app/layout.tsx

export const metadata = {
  title: 'Chatbot UI',
  description: 'Root Layout',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
