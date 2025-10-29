import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <AuthForm />
    </div>
  )
}
