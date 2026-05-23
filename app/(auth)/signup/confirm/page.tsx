export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-900 mb-3">Check your email</h1>
        <p className="text-gray-500 mb-2">
          We sent a confirmation link to your email address.
        </p>
        <p className="text-gray-500 text-sm">
          Click the link in the email to activate your account and get started.
        </p>
        <p className="text-xs text-gray-400 mt-6">
          Didn't receive it? Check your spam folder or contact support via the chat widget.
        </p>
      </div>
    </div>
  )
}