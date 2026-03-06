export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0f172a] text-white">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="College Logo" className="h-10" />
          <div>
            <h1 className="font-semibold text-lg">St. Paul's College</h1>
            <p className="text-sm text-slate-400">Staff Administration Portal</p>
          </div>
        </div>

        <a
          href="/login"
          className="px-5 py-2 bg-red-700 hover:bg-red-800 transition rounded-md text-sm font-medium"
        >
          Staff Login
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Official Leave Management System
        </h2>

        <p className="max-w-2xl text-slate-400 mb-8">
          Secure institutional platform for faculty leave management,
          approval workflow, digital documentation and administrative control.
        </p>

        <a
          href="/login"
          className="px-8 py-3 bg-red-700 hover:bg-red-800 transition rounded-md text-lg font-medium"
        >
          Access Portal
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-slate-700 text-slate-500 text-sm">
        © {new Date().getFullYear()} St. Paul’s College, Kalamassery. All rights reserved.
      </footer>

    </main>
  );
}