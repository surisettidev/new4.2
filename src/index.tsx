import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { authRoutes } from './routes/auth'
import { apiRoutes } from './routes/api'
import { adminRoutes } from './routes/admin'

type Bindings = {
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  DISCORD_CLIENT_ID?: string
  DISCORD_CLIENT_SECRET?: string
  ADMIN_PASSWORD?: string
  GOOGLE_SHEETS_API_KEY?: string
  GOOGLE_SHEET_ID?: string
  JWT_SECRET?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// Mount routes
app.route('/auth', authRoutes)
app.route('/api', apiRoutes)
app.route('/admin', adminRoutes)

// Main application route
app.get('/', (c) => {
  return c.render(
    <div>
      {/* Responsibility Modal */}
      <div id="responsibility-modal" className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center hidden">
        <div className="bg-gray-900 border border-green-500 rounded-lg p-8 max-w-2xl mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <i className="fas fa-shield-alt text-green-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold text-green-400 mb-2">CYB Guide - Ethical Use Policy</h2>
            <div className="w-16 h-0.5 bg-green-500 mx-auto"></div>
          </div>
          
          <div className="text-gray-300 space-y-4 mb-6">
            <p className="text-lg">Welcome, aspiring ethical hacker.</p>
            <p>The knowledge shared here is powerful. Like Deke Shaw would say - "With great power comes great responsibility."</p>
            <div className="bg-gray-800 border-l-4 border-green-500 p-4 rounded">
              <h3 className="text-green-400 font-semibold mb-2">Our Code:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Use this knowledge only in authorized lab environments</li>
                <li>• Never target systems without explicit permission</li>
                <li>• Report vulnerabilities responsibly</li>
                <li>• Help secure the digital world, don't exploit it</li>
              </ul>
            </div>
            <p className="text-sm italic">This action will be logged with timestamp for educational tracking purposes.</p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" id="responsibility-accept" className="w-5 h-5 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500" />
              <span className="text-green-400 font-medium">I Accept & Will Use Responsibly</span>
            </label>
          </div>
          
          <div className="flex justify-center mt-6">
            <button id="proceed-btn" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i className="fas fa-unlock-alt mr-2"></i>Access CYB Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Application */}
      <div id="main-app" className="hidden min-h-screen bg-black text-green-500">
        {/* Navigation */}
        <nav className="bg-gray-900 border-b border-green-500 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <i className="fas fa-terminal text-2xl text-green-400"></i>
                <h1 className="text-xl font-bold text-green-400">CYB Guide</h1>
              </div>
              
              {/* Language Toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Professional</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="language-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-sm text-gray-400">Casual</span>
                </div>
                
                <button id="user-menu" className="text-green-400 hover:text-green-300">
                  <i className="fas fa-user-circle text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 border-r border-green-500 min-h-screen p-4">
            <nav className="space-y-2">
              <a href="#learning-guide" className="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-green-400 transition-colors">
                <i className="fas fa-route"></i>
                <span data-casual="Learning Path" data-professional="Educational Roadmap">Educational Roadmap</span>
              </a>
              <a href="#ai-assistant" className="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-green-400 transition-colors">
                <i className="fas fa-robot"></i>
                <span data-casual="AI Buddy" data-professional="AI Assistant">AI Assistant</span>
              </a>
              <a href="#events" className="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-green-400 transition-colors">
                <i className="fas fa-calendar-alt"></i>
                <span data-casual="Cool Events" data-professional="Events & Competitions">Events & Competitions</span>
              </a>
              <a href="#announcements" className="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-green-400 transition-colors">
                <i className="fas fa-bullhorn"></i>
                <span data-casual="What's New" data-professional="Announcements">Announcements</span>
              </a>
              <a href="#community" className="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-green-400 transition-colors">
                <i className="fas fa-users"></i>
                <span data-casual="Hangout" data-professional="Community Hub">Community Hub</span>
              </a>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            {/* Learning Guide Section */}
            <section id="learning-guide" className="content-section">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <i className="fas fa-route mr-3"></i>
                  <span data-casual="Your Hacking Journey" data-professional="Cybersecurity Learning Path">Cybersecurity Learning Path</span>
                </h2>
                <div className="grid gap-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">1. Foundations</h3>
                    <p className="text-gray-300 text-sm mb-3" data-casual="Get the basics down first - networking, systems, how stuff works under the hood." data-professional="Establish fundamental knowledge of networking, operating systems, and security principles.">Establish fundamental knowledge of networking, operating systems, and security principles.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Networking</span>
                      <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Linux Basics</span>
                      <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Security Fundamentals</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">2. Tools & Techniques</h3>
                    <p className="text-gray-300 text-sm mb-3" data-casual="Time to get hands-on with the cool tools. Practice in safe environments only!" data-professional="Learn essential cybersecurity tools and methodologies in controlled lab environments.">Learn essential cybersecurity tools and methodologies in controlled lab environments.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">Nmap</span>
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">Burp Suite</span>
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">Metasploit</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">3. Practical Labs</h3>
                    <p className="text-gray-300 text-sm mb-3" data-casual="Real challenges to test your skills. Like video games, but for hackers." data-professional="Hands-on challenges and simulations to apply learned concepts.">Hands-on challenges and simulations to apply learned concepts.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">HackTheBox</span>
                      <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">TryHackMe</span>
                      <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">VulnHub</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Assistant Section */}
            <section id="ai-assistant" className="content-section hidden">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <i className="fas fa-robot mr-3"></i>
                  <span data-casual="AI Buddy" data-professional="AI Assistant">AI Assistant</span>
                </h2>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-robot text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-green-400 font-semibold">DEKE-AI</h3>
                      <p className="text-gray-400 text-sm" data-casual="Your chill hacking mentor" data-professional="Your cybersecurity learning companion">Your cybersecurity learning companion</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 text-sm" data-casual="Hey there! I'm like Deke Shaw but for cybersecurity. Ask me anything about ethical hacking, tools, or techniques. I'll keep it real and make sure you're learning the right way - lab environments only, of course." data-professional="Greetings. I'm your AI cybersecurity assistant, designed with the analytical mindset of a skilled ethical hacker. I provide guidance on cybersecurity concepts, tools, and methodologies while ensuring all activities remain within ethical and legal boundaries.">Greetings. I'm your AI cybersecurity assistant, designed with the analytical mindset of a skilled ethical hacker. I provide guidance on cybersecurity concepts, tools, and methodologies while ensuring all activities remain within ethical and legal boundaries.</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        id="ai-input" 
                        placeholder="Ask about cybersecurity techniques, tools, or concepts..." 
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-green-500"
                      />
                      <button id="ai-send" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div id="ai-response" className="bg-gray-800 border border-gray-700 rounded-lg p-4 hidden">
                  {/* AI responses will be inserted here */}
                </div>
              </div>
            </section>

            {/* Events Section */}
            <section id="events" className="content-section hidden">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <i className="fas fa-calendar-alt mr-3"></i>
                  <span data-casual="Cool Events" data-professional="Events & Competitions">Events & Competitions</span>
                </h2>
                
                <div className="grid gap-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-400">DefCon CTF 2024</h3>
                      <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">Live</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3" data-casual="The legendary hacking competition. Test your skills against the best." data-professional="Premier cybersecurity competition featuring advanced challenges.">Premier cybersecurity competition featuring advanced challenges.</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span><i className="fas fa-calendar mr-1"></i>Aug 8-11, 2024</span>
                      <span><i className="fas fa-map-marker-alt mr-1"></i>Las Vegas, NV</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-400">PicoCTF</h3>
                      <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Beginner Friendly</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3" data-casual="Perfect starting point for CTF newbies. Educational and fun!" data-professional="Educational capture-the-flag competition designed for beginners.">Educational capture-the-flag competition designed for beginners.</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span><i className="fas fa-calendar mr-1"></i>Year-round</span>
                      <span><i className="fas fa-globe mr-1"></i>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Announcements Section */}
            <section id="announcements" className="content-section hidden">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <i className="fas fa-bullhorn mr-3"></i>
                  <span data-casual="What's New" data-professional="Announcements">Announcements</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 border-l-4 border-green-500 rounded-r-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-star text-yellow-500"></i>
                      <h3 className="text-lg font-semibold text-green-400">CYB Guide v2.0 Launch!</h3>
                      <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>
                    <p className="text-gray-300 text-sm" data-casual="We've got some sick new features! AI assistant, better labs, and a community hub. Check it out!" data-professional="Enhanced platform featuring improved AI assistance, expanded laboratory environments, and integrated community features.">Enhanced platform featuring improved AI assistance, expanded laboratory environments, and integrated community features.</p>
                  </div>

                  <div className="bg-gray-800 border-l-4 border-blue-500 rounded-r-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-flask text-blue-500"></i>
                      <h3 className="text-lg font-semibold text-green-400">New Lab Environment</h3>
                      <span className="text-xs text-gray-400">1 day ago</span>
                    </div>
                    <p className="text-gray-300 text-sm" data-casual="Fresh vulnerable web app for practicing your skills safely. No real targets needed!" data-professional="New isolated laboratory environment available for secure penetration testing practice.">New isolated laboratory environment available for secure penetration testing practice.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Community Section */}
            <section id="community" className="content-section hidden">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <i className="fas fa-users mr-3"></i>
                  <span data-casual="Hangout" data-professional="Community Hub">Community Hub</span>
                </h2>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 mb-4" data-casual="Connect with fellow ethical hackers, share knowledge, and collaborate on projects." data-professional="Engage with the cybersecurity community for knowledge sharing and collaborative learning.">Engage with the cybersecurity community for knowledge sharing and collaborative learning.</p>
                  
                  {/* Discord Widget Placeholder */}
                  <div className="bg-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
                    <i className="fab fa-discord text-6xl text-indigo-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-green-400 mb-2">Discord Community</h3>
                    <p className="text-gray-400 mb-4">Join our Discord server to connect with other ethical hackers</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                      <i className="fab fa-discord mr-2"></i>Join Discord
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      
      <script src="/static/app.js"></script>
    </div>
  )
})

// Authentication routes
app.get('/login', (c) => {
  return c.render(
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <i className="fas fa-terminal text-4xl text-green-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-green-400">Access CYB Guide</h2>
          <p className="text-gray-400 mt-2">Choose your authentication method</p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <i className="fab fa-google"></i>
            <span>Continue with Google</span>
          </button>
          
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <i className="fab fa-discord"></i>
            <span>Continue with Discord</span>
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">By continuing, you agree to our ethical use policy</p>
        </div>
      </div>
    </div>
  )
})

// Terms and Privacy routes
app.get('/terms', (c) => {
  return c.render(
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-8">Terms & Conditions</h1>
        <div className="bg-gray-900 border border-green-500 rounded-lg p-6 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Educational Purpose Only</h2>
            <p>CYB Guide is strictly for educational purposes. All content, tools, and techniques shared are intended for learning cybersecurity in controlled, authorized laboratory environments only.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Prohibited Activities</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Unauthorized access to any computer systems or networks</li>
              <li>Attacking or testing systems without explicit written permission</li>
              <li>Using learned techniques for malicious purposes</li>
              <li>Sharing vulnerabilities publicly before responsible disclosure</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">User Responsibility</h2>
            <p>Users are solely responsible for ensuring their activities comply with local laws and regulations. CYB Guide is not liable for any misuse of the provided information.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Activity Logging</h2>
            <p>User activities are logged for educational tracking and security purposes. This includes page visits, resource access, and learning progress.</p>
          </section>
        </div>
      </div>
    </div>
  )
})

app.get('/privacy', (c) => {
  return c.render(
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-8">Privacy Policy</h1>
        <div className="bg-gray-900 border border-green-500 rounded-lg p-6 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Information Collection</h2>
            <p>We collect information necessary for providing educational services, including email addresses, learning progress, and interaction logs.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Data Usage</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Tracking educational progress and completion</li>
              <li>Improving platform functionality and user experience</li>
              <li>Ensuring compliance with ethical use policies</li>
              <li>Providing personalized learning recommendations</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Data Storage</h2>
            <p>Activity data is stored securely using Google Sheets with appropriate access controls. Data is retained for educational analytics and platform improvement purposes.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-green-400 mb-3">Data Sharing</h2>
            <p>We do not sell or share personal information with third parties except as required by law or for platform functionality (e.g., OAuth providers).</p>
          </section>
        </div>
      </div>
    </div>
  )
})

export default app