import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexus Trade AI | Decision Support Dashboard',
  description: 'AI-powered stock market visualization and trend forecasting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; padding: 0; margin: 0; }
          html, body {
            max-width: 100vw;
            overflow-x: hidden;
            background-color: #0a0e17;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
          }
          a { color: inherit; text-decoration: none; }
          input, button, select, textarea { font-family: inherit; }
        `}} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}