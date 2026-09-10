import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Keuangan OSIS - Sistem Informasi Keuangan',
    template: '%s | Keuangan OSIS',
  },
  description: 'Sistem Informasi Keuangan OSIS — Kelola kas masuk, kas keluar, laporan keuangan, dan data anggota dengan mudah.',
  keywords: ['keuangan OSIS', 'sistem informasi keuangan', 'kas OSIS', 'manajemen keuangan sekolah'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
