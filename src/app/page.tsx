import Link from "next/link";
import {
  Heart,
  Shield,
  Users,
  FileText,
  Activity,
  CheckCircle,
  ArrowRight,
  Lock,
  BarChart3,
  Upload,
  Bell,
  Star,
  Zap,
  Globe,
  ChevronRight,
  Stethoscope,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">HealthCare</span>
              <span className="text-lg font-bold text-blue-600">+</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How it works</a>
            <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Platform Stats</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Patient Login
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="gradient-mesh pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* Decorative glowing circles */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-blue-500/20 mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-200">Now available — Secure Healthcare Data Platform</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up-delay-1 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white mb-6 tracking-tight">
              Your Health Data,{" "}
              <span className="text-gradient">
                Always Secure
              </span>
              <br />& Within Reach
            </h1>

            <p className="animate-fade-in-up-delay-2 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              A modern, HIPAA-inspired healthcare dashboard connecting patients with their vitals and empowering clinic administrators with powerful management tools.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 glass-card text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
              >
                Patient Login
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-in-up-delay-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              {["JWT Secured", "Role-Based Access", "Real-Time Data", "CSV Import"].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-400">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Dashboard Mockup Cards */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Blood Pressure", value: "118/78", unit: "mmHg", color: "text-emerald-400", icon: Activity, trend: "Normal" },
              { label: "Heart Rate", value: "72", unit: "bpm", color: "text-blue-400", icon: Heart, trend: "Optimal" },
              { label: "Glucose Level", value: "95", unit: "mg/dL", color: "text-violet-400", icon: BarChart3, trend: "Normal" },
            ].map((metric, i) => (
              <div
                key={metric.label}
                className="glass-card rounded-2xl p-5 hover:bg-white/10 transition-all animate-float"
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{metric.label}</span>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-bold ${metric.color} stat-number`}>{metric.value}</span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section id="stats" className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10,000+", label: "Active Patients" },
              { number: "150+", label: "Clinics Onboarded" },
              { number: "99.9%", label: "Uptime SLA" },
              { number: "500K+", label: "Reports Processed" },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-4xl sm:text-5xl font-extrabold stat-number group-hover:scale-105 transition-transform">{stat.number}</p>
                <p className="mt-2 text-sm sm:text-base text-blue-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-4 uppercase tracking-widest">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything your clinic needs,
              <br />in one platform
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built for both patients and administrators with powerful features that prioritize security and ease of use.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: "bg-blue-100 text-blue-600",
                title: "Health Report Viewer",
                description: "Patients can view their latest vitals and complete report history with beautiful, easy-to-read visualizations.",
              },
              {
                icon: Shield,
                color: "bg-emerald-100 text-emerald-600",
                title: "JWT Role-Based Security",
                description: "Military-grade JWT authentication with distinct access portals for patients and admin staff — no overlap, no compromise.",
              },
              {
                icon: Users,
                color: "bg-violet-100 text-violet-600",
                title: "Patient Management",
                description: "Admins can search, filter, and view detailed profiles of all registered patients with optimized, paginated queries.",
              },
              {
                icon: Upload,
                color: "bg-orange-100 text-orange-600",
                title: "CSV Bulk Import",
                description: "Upload health reports for multiple patients in one go using our intelligent CSV parser with row-level validation.",
              },
              {
                icon: Lock,
                color: "bg-rose-100 text-rose-600",
                title: "Protected Routes",
                description: "Next.js middleware ensures every page is guarded — unauthorized access attempts are automatically redirected.",
              },
              {
                icon: Activity,
                color: "bg-cyan-100 text-cyan-600",
                title: "Real-Time Vitals Dashboard",
                description: "Blood pressure, heart rate, glucose, cholesterol — all key health metrics displayed clearly with status indicators.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-4 uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Simple for patients.<br />Powerful for admins.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Patient Flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-blue-600">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Patients</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Create your account", desc: "Register in seconds with name, email, and a secure password." },
                  { step: "02", title: "Log in securely", desc: "Your JWT-protected session keeps your health data private." },
                  { step: "03", title: "View your latest report", desc: "See vitals uploaded by your clinic — blood pressure, heart rate, glucose, and more." },
                  { step: "04", title: "Track your history", desc: "Browse paginated report history to monitor your health over time." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-indigo-600">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Clinic Administrators</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Sign in to the Admin Portal", desc: "A dedicated, role-gated portal separates admin access from patient access." },
                  { step: "02", title: "View clinic overview", desc: "Instantly see total patients, total reports, and recent activity on your dashboard." },
                  { step: "03", title: "Search & manage patients", desc: "Find any patient by name or email with debounced search and paginated results." },
                  { step: "04", title: "Upload health reports via CSV", desc: "Bulk import reports for all patients in a single file — with row-by-row error reporting." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK STRIP ─── */}
      <section className="py-12 bg-gray-900 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500 mb-8">Built with enterprise-grade technology</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {["Next.js 15", "TypeScript", "MongoDB Atlas", "Mongoose", "JWT Auth", "Zod Validation", "Tailwind CSS", "Vercel"].map((tech) => (
              <div key={tech} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <span className="text-sm font-semibold text-gray-300">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full mb-4 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Trusted by patients &amp; clinics</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Hear from those who use HealthCare+ every day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Sarah Mitchell",
                role: "Clinic Administrator",
                avatar: "SM",
                color: "bg-indigo-100 text-indigo-700",
                stars: 5,
                quote: "Uploading CSV reports for 50 patients used to take hours. Now it takes seconds. The row-level error reporting is brilliant.",
              },
              {
                name: "James Patel",
                role: "Patient",
                avatar: "JP",
                color: "bg-emerald-100 text-emerald-700",
                stars: 5,
                quote: "I can finally see all my health reports in one place. The vitals dashboard is clean and easy to understand — even for a non-technical person.",
              },
              {
                name: "Dr. Emily Chen",
                role: "Senior Physician",
                avatar: "EC",
                color: "bg-rose-100 text-rose-700",
                stars: 5,
                quote: "The role-based access is exactly what we needed. Patient data stays private, and the admin portal gives us everything at a glance.",
              },
            ].map((review) => (
              <div key={review.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{review.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${review.color}`}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY SECTION ─── */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Security First</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Built with security at its core</h2>
                <p className="text-gray-400 leading-relaxed mb-8">Every layer of HealthCare+ is designed to protect sensitive medical data — from bcrypt password hashing to JWT token expiry and middleware route guards.</p>
                <div className="space-y-3">
                  {[
                    "bcrypt password hashing (12 salt rounds)",
                    "JWT tokens with configurable expiry",
                    "Role-based API protection",
                    "Zod input validation on all endpoints",
                    "Next.js middleware for page-level route protection",
                    "Cookie + localStorage dual-layer session",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: "Fast API", sublabel: "< 200ms avg response", color: "text-yellow-400" },
                  { icon: Globe, label: "Cloud DB", sublabel: "MongoDB Atlas", color: "text-cyan-400" },
                  { icon: Bell, label: "Validation", sublabel: "Zod schema guards", color: "text-violet-400" },
                  { icon: Shield, label: "Auth", sublabel: "JWT + Role guard", color: "text-emerald-400" },
                ].map((item) => (
                  <div key={item.label} className="glass-card rounded-2xl p-5 hover:bg-white/10 transition-all text-center">
                    <item.icon className={`h-7 w-7 mx-auto mb-3 ${item.color}`} />
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 gradient-mesh px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to take control<br />of your health data?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of patients and clinics already using HealthCare+ to manage health reports securely and effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Create Patient Account
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-8 py-4 glass-card text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
            >
              Clinic Admin Login
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 text-gray-400 px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">HealthCare+</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                A modern healthcare dashboard for patients and administrators. Secure, fast, and always available.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Portals</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Patient Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Patient Register</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white transition-colors">Next.js 15 + TypeScript</li>
                <li className="hover:text-white transition-colors">MongoDB Atlas</li>
                <li className="hover:text-white transition-colors">JWT Authentication</li>
                <li className="hover:text-white transition-colors">Deployed on Vercel</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} HealthCare+ Dashboard. All rights reserved.
            </p>
            <p className="text-xs text-gray-700">Built as a Senior Full Stack Developer Technical Assessment</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
