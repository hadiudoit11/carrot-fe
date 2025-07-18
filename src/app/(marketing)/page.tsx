import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-24 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Manage your franchise growth <span className="text-primary">AI Support</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">
          Meet our AI-powered SaaS solution to lighten your workload, increase efficiency and make more accurate decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/user/register" className="btn btn-primary px-8 py-3 rounded-lg text-lg font-semibold">
            Sign up for free
          </Link>
          <Link href="/user/login" className="btn btn-outline px-8 py-3 rounded-lg text-lg font-semibold">
            Log in
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 justify-center opacity-80">
          <span className="text-xs text-gray-500">No credit card</span>
          <span className="text-xs text-gray-500">14-day trial</span>
          <span className="text-xs text-gray-500">Cancel anytime</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Everything You Need to Succeed</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold mb-2">AI-Powered Automation</h3>
            <p className="text-gray-500 text-sm text-center">Save time and increase your efficiency by automating your routine business processes.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Real Time Data Analytics</h3>
            <p className="text-gray-500 text-sm text-center">Make more informed and strategic decisions by instantly analyzing your data.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Personalized Experience</h3>
            <p className="text-gray-500 text-sm text-center">Flexible solutions with an adaptable structure for your business needs.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">Scalable Structure</h3>
            <p className="text-gray-500 text-sm text-center">Move forward with confidence, with infrastructure that grows as you do.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Benefits</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary/10 to-white rounded-xl p-8 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-1">AI-Powered Optimization</h3>
            <p className="text-gray-600">Our intelligent algorithms automatically enhance your website's performance, speed, and user experience.</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-white rounded-xl p-8 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-1">Real-Time Analytics</h3>
            <p className="text-gray-600">Monitor your website's performance metrics and optimization improvements with comprehensive dashboards.</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-white rounded-xl p-8 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-1">SEO Enhancement</h3>
            <p className="text-gray-600">Boost your search engine rankings with AI-driven content and metadata optimization suggestions.</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-white rounded-xl p-8 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-1">Advanced Security</h3>
            <p className="text-gray-600">Protect your website with intelligent threat detection and automated security enhancements.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Loved by Teams Worldwide</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-gray-600 text-center mb-2">“This platform transformed our workflow! The automation features saved us countless hours, and the support team is fantastic!”</p>
            <span className="font-semibold">John Doe</span>
            <span className="text-xs text-gray-400">Product Manager</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-gray-600 text-center mb-2">“I can’t imagine running my business without this tool. The insights from the analytics have helped us make smarter decisions.”</p>
            <span className="font-semibold">Sophia Collins</span>
            <span className="text-xs text-gray-400">Cybersecurity Analyst</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-gray-600 text-center mb-2">“Great integration options! Connecting our existing tools was a breeze, and it’s improved our overall efficiency.”</p>
            <span className="font-semibold">Ethan Parker</span>
            <span className="text-xs text-gray-400">Data Scientist</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Get Unlimited Access</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center border border-primary/20">
            <h3 className="font-bold text-xl mb-2">Starter</h3>
            <div className="text-4xl font-bold mb-2">$0</div>
            <div className="text-gray-500 mb-4">/Monthly</div>
            <ul className="text-gray-600 text-sm mb-6 space-y-1">
              <li>Up to 5 pages</li>
              <li>Basic optimization</li>
              <li>Weekly reports</li>
              <li>Email support</li>
            </ul>
            <Link href="/user/register" className="btn btn-primary w-full">Start Free Trial</Link>
          </div>
          <div className="bg-primary text-white rounded-xl shadow-lg p-8 flex flex-col items-center border-2 border-primary scale-105">
            <h3 className="font-bold text-xl mb-2">Professional</h3>
            <div className="text-4xl font-bold mb-2">$29</div>
            <div className="mb-4">/Monthly</div>
            <ul className="mb-6 space-y-1">
              <li>Up to 25 pages</li>
              <li>Advanced optimization</li>
              <li>Daily reports</li>
              <li>Priority email support</li>
              <li>SEO recommendations</li>
            </ul>
            <Link href="/user/register" className="btn btn-white text-primary w-full font-bold">Start Free Trial</Link>
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center border border-primary/20">
            <h3 className="font-bold text-xl mb-2">Enterprise</h3>
            <div className="text-4xl font-bold mb-2">$99</div>
            <div className="text-gray-500 mb-4">/Monthly</div>
            <ul className="text-gray-600 text-sm mb-6 space-y-1">
              <li>Unlimited pages</li>
              <li>Custom optimization rules</li>
              <li>Real-time monitoring</li>
              <li>24/7 phone & email support</li>
              <li>Advanced API access</li>
            </ul>
            <Link href="/user/register" className="btn btn-primary w-full">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">The Company Dream Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-2">👨‍💻</div>
            <span className="font-semibold">Michael Holland</span>
            <span className="text-xs text-gray-400 mb-2">DevOps Engineer</span>
            <span className="text-gray-500 text-sm text-center">CI/CD Pipeline Mastermind</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-2">👩‍💻</div>
            <span className="font-semibold">Zoe Garcia</span>
            <span className="text-xs text-gray-400 mb-2">JavaScript Evangelist</span>
            <span className="text-gray-500 text-sm text-center">Deno Champion</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-2">🧑‍💻</div>
            <span className="font-semibold">Evan James</span>
            <span className="text-xs text-gray-400 mb-2">Backend Developer</span>
            <span className="text-gray-500 text-sm text-center">API Specialist</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-2">👩‍🔬</div>
            <span className="font-semibold">Pam Taylor</span>
            <span className="text-xs text-gray-400 mb-2">Fullstack Developer</span>
            <span className="text-gray-500 text-sm text-center">UX Researcher</span>
          </div>
        </div>
      </section>
    </main>
  );
} 