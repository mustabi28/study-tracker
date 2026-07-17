import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center relative bg-[#F5F3EF] overflow-hidden px-4">
      {/* Premium Background Dotted Triangle Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 15 L15 45 L45 45 Z' fill='none' stroke='%23C9A15A' stroke-width='1.5' stroke-dasharray='3,5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2124]">
            Study<span className="text-[#C9A15A]">Tracker</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">Welcome back! Sign in to view your progress.</p>
        </div>

        <div className="shadow-2xl rounded-2xl border border-gray-100 overflow-hidden bg-[#1E2124]">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-[#1E2124] text-white hover:bg-opacity-90 border border-gray-700",
                formButtonPrimary: "bg-[#C9A15A] hover:bg-[#B88F48] text-white",
                footerActionLink: "text-[#C9A15A] hover:text-[#B88F48]",
                formFieldLabel: "text-gray-300",
                formFieldInput: "bg-[#1E2124] border-gray-700 text-white",
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
