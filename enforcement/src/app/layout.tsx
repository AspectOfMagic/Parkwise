export const metadata = {
  title: 'ParkWise Parking Enforcement'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#eeeeee' }}>{children}</body>
    </html>
  )
}
