import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 뉴스 브리핑',
  description: 'AI가 요약해주는 최신 뉴스 브리핑 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}