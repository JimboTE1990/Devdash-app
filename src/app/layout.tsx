import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { VersionSwitcher } from '@/components/dev/VersionSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevDash - Project Planner for Indie Developers',
  description: 'The ultimate project planner for indie developers and business owners. Streamline your workflow from build, launch, and marketing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <VersionSwitcher />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
