import { Hono } from 'hono'

type Bindings = {
  GOOGLE_SHEETS_API_KEY?: string
  GOOGLE_SHEET_ID?: string
  OPENAI_API_KEY?: string
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// Log responsibility acceptance
apiRoutes.post('/log-acceptance', async (c) => {
  try {
    const { userEmail } = await c.req.json()
    const timestamp = new Date().toISOString()
    
    await logUserAction(c, userEmail || 'anonymous', 'responsibility_accepted', { 
      timestamp,
      userAgent: c.req.header('User-Agent') 
    })
    
    return c.json({ success: true, timestamp })
  } catch (error) {
    return c.json({ error: 'Failed to log acceptance' }, 500)
  }
})

// Log general user actions
apiRoutes.post('/log-action', async (c) => {
  try {
    const { userEmail, action, extraInfo } = await c.req.json()
    
    await logUserAction(c, userEmail || 'anonymous', action, extraInfo)
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to log action' }, 500)
  }
})

// AI Assistant endpoint
apiRoutes.post('/ai-assistant', async (c) => {
  try {
    const { query, userEmail } = await c.req.json()
    
    if (!query) {
      return c.json({ error: 'Query is required' }, 400)
    }
    
    // Log the AI query
    await logUserAction(c, userEmail || 'anonymous', 'ai_query', { query })
    
    // Simulate AI response (replace with actual AI integration)
    const response = await generateAIResponse(query, c.env.OPENAI_API_KEY)
    
    return c.json({ 
      response,
      timestamp: new Date().toISOString(),
      disclaimer: "Remember: Use this knowledge only in authorized lab environments. Never target systems without explicit permission."
    })
    
  } catch (error) {
    return c.json({ error: 'AI Assistant unavailable' }, 500)
  }
})

// Get learning guide data
apiRoutes.get('/learning-guide', (c) => {
  const learningGuide = [
    {
      id: 1,
      title: "Foundations",
      description: {
        casual: "Get the basics down first - networking, systems, how stuff works under the hood.",
        professional: "Establish fundamental knowledge of networking, operating systems, and security principles."
      },
      modules: [
        {
          name: "Networking Fundamentals",
          topics: ["TCP/IP", "OSI Model", "Routing & Switching", "Network Protocols"],
          resources: [
            { title: "Networking Basics", url: "https://www.cisconetacad.com", type: "course" },
            { title: "Wireshark Tutorial", url: "https://www.wireshark.org/docs/", type: "tutorial" }
          ]
        },
        {
          name: "Linux Essentials",
          topics: ["Command Line", "File System", "Permissions", "Process Management"],
          resources: [
            { title: "Linux Journey", url: "https://linuxjourney.com", type: "interactive" },
            { title: "OverTheWire Bandit", url: "https://overthewire.org/wargames/bandit/", type: "lab" }
          ]
        },
        {
          name: "Security Fundamentals",
          topics: ["CIA Triad", "Risk Assessment", "Threat Modeling", "Security Policies"],
          resources: [
            { title: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework", type: "framework" },
            { title: "SANS Reading Room", url: "https://www.sans.org/reading-room/", type: "papers" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Tools & Techniques",
      description: {
        casual: "Time to get hands-on with the cool tools. Practice in safe environments only!",
        professional: "Learn essential cybersecurity tools and methodologies in controlled lab environments."
      },
      modules: [
        {
          name: "Reconnaissance",
          topics: ["Information Gathering", "OSINT", "Network Scanning", "Enumeration"],
          resources: [
            { title: "Nmap Network Scanning", url: "https://nmap.org/book/", type: "book" },
            { title: "OSINT Framework", url: "https://osintframework.com", type: "tool" }
          ]
        },
        {
          name: "Vulnerability Assessment",
          topics: ["Nessus", "OpenVAS", "Nmap Scripting", "Manual Testing"],
          resources: [
            { title: "Nessus Essentials", url: "https://www.tenable.com/products/nessus", type: "tool" },
            { title: "OWASP Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "guide" }
          ]
        },
        {
          name: "Web Application Security",
          topics: ["Burp Suite", "OWASP Top 10", "SQL Injection", "XSS"],
          resources: [
            { title: "Burp Suite Academy", url: "https://portswigger.net/web-security", type: "course" },
            { title: "DVWA", url: "https://dvwa.co.uk", type: "lab" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Practical Labs",
      description: {
        casual: "Real challenges to test your skills. Like video games, but for hackers.",
        professional: "Hands-on challenges and simulations to apply learned concepts."
      },
      modules: [
        {
          name: "Beginner CTFs",
          topics: ["PicoCTF", "OverTheWire", "HackTheBox Academy", "TryHackMe"],
          resources: [
            { title: "PicoCTF", url: "https://picoctf.org", type: "ctf" },
            { title: "TryHackMe", url: "https://tryhackme.com", type: "platform" }
          ]
        },
        {
          name: "Intermediate Challenges",
          topics: ["HackTheBox", "VulnHub", "Root Me", "Cyber Defenders"],
          resources: [
            { title: "HackTheBox", url: "https://hackthebox.com", type: "platform" },
            { title: "VulnHub", url: "https://vulnhub.com", type: "vm" }
          ]
        },
        {
          name: "Advanced Scenarios",
          topics: ["Red Team Labs", "Attack-Defense", "Real-world Simulations"],
          resources: [
            { title: "Pentester Lab", url: "https://pentesterlab.com", type: "lab" },
            { title: "Cybrary", url: "https://cybrary.it", type: "course" }
          ]
        }
      ]
    }
  ]
  
  return c.json(learningGuide)
})

// Get events data
apiRoutes.get('/events', (c) => {
  const events = [
    {
      id: 1,
      name: "DefCon CTF 2024",
      description: {
        casual: "The legendary hacking competition. Test your skills against the best.",
        professional: "Premier cybersecurity competition featuring advanced challenges."
      },
      date: "Aug 8-11, 2024",
      location: "Las Vegas, NV",
      type: "CTF",
      status: "past",
      url: "https://defcon.org"
    },
    {
      id: 2,
      name: "PicoCTF 2024",
      description: {
        casual: "Perfect starting point for CTF newbies. Educational and fun!",
        professional: "Educational capture-the-flag competition designed for beginners."
      },
      date: "Year-round",
      location: "Online",
      type: "Educational CTF",
      status: "active",
      url: "https://picoctf.org"
    },
    {
      id: 3,
      name: "BSides Las Vegas 2024",
      description: {
        casual: "Community-driven security conference with talks and workshops.",
        professional: "Community-driven information security conference featuring presentations and workshops."
      },
      date: "Aug 6-7, 2024",
      location: "Las Vegas, NV",
      type: "Conference",
      status: "past",
      url: "https://bsideslv.org"
    },
    {
      id: 4,
      name: "National Cyber League",
      description: {
        casual: "Ongoing cybersecurity challenges for students and professionals.",
        professional: "Comprehensive cybersecurity competition platform for skill development."
      },
      date: "Seasonal",
      location: "Online",
      type: "Competition",
      status: "active",
      url: "https://nationalcyberleague.org"
    }
  ]
  
  return c.json(events)
})

// Get announcements data
apiRoutes.get('/announcements', (c) => {
  const announcements = [
    {
      id: 1,
      title: "CYB Guide v2.0 Launch!",
      content: {
        casual: "We've got some sick new features! AI assistant, better labs, and a community hub. Check it out!",
        professional: "Enhanced platform featuring improved AI assistance, expanded laboratory environments, and integrated community features."
      },
      type: "feature",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      icon: "fas fa-star",
      color: "green"
    },
    {
      id: 2,
      title: "New Lab Environment",
      content: {
        casual: "Fresh vulnerable web app for practicing your skills safely. No real targets needed!",
        professional: "New isolated laboratory environment available for secure penetration testing practice."
      },
      type: "lab",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      icon: "fas fa-flask",
      color: "blue"
    },
    {
      id: 3,
      title: "Community Guidelines Update",
      content: {
        casual: "Updated our community rules to keep everyone safe and learning together!",
        professional: "Enhanced community guidelines to ensure ethical learning practices and user safety."
      },
      type: "policy",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      icon: "fas fa-users",
      color: "purple"
    }
  ]
  
  return c.json(announcements)
})

// Get language pairs for toggle
apiRoutes.get('/language-pairs', (c) => {
  const languagePairs = [
    { casual: "Learning Path", professional: "Educational Roadmap" },
    { casual: "AI Buddy", professional: "AI Assistant" },
    { casual: "Cool Events", professional: "Events & Competitions" },
    { casual: "What's New", professional: "Announcements" },
    { casual: "Hangout", professional: "Community Hub" },
    { casual: "Your Hacking Journey", professional: "Cybersecurity Learning Path" },
    { casual: "Get the basics down first - networking, systems, how stuff works under the hood.", professional: "Establish fundamental knowledge of networking, operating systems, and security principles." },
    { casual: "Time to get hands-on with the cool tools. Practice in safe environments only!", professional: "Learn essential cybersecurity tools and methodologies in controlled lab environments." },
    { casual: "Real challenges to test your skills. Like video games, but for hackers.", professional: "Hands-on challenges and simulations to apply learned concepts." },
    { casual: "Hey there! I'm like Deke Shaw but for cybersecurity.", professional: "Greetings. I'm your AI cybersecurity assistant, designed with the analytical mindset of a skilled ethical hacker." }
  ]
  
  return c.json(languagePairs)
})

// Helper function to simulate AI response
async function generateAIResponse(query: string, apiKey?: string): Promise<string> {
  // This is a simplified implementation
  // In a real application, you would integrate with OpenAI API or another AI service
  
  const responses = {
    // Common cybersecurity queries and Deke Shaw style responses
    'nmap': `*adjusts glasses analytically* 

Nmap is your digital reconnaissance tool - like having X-ray vision for networks. Here's the breakdown:

**Basic Network Discovery:**
\`nmap -sn 192.168.1.0/24\` - Find live hosts (ping sweep)
\`nmap -sS -O target.com\` - Stealth SYN scan with OS detection

**Service Enumeration:**
\`nmap -sV -p- target.com\` - Version detection on all ports
\`nmap -sC target.com\` - Default script scan

**Remember:** Only scan networks you own or have explicit permission to test. Think of it like knocking on doors - you need permission first.

**Lab Practice:**
- Set up a local VM lab (Metasploitable, DVWA)
- Try nmap on your own network first
- Practice on platforms like TryHackMe

**Pro Tip:** Always document your scans. Real penetration testers keep detailed logs of everything they do.

Want to dive deeper into any specific nmap technique?`,

    'burp': `*leans back in chair with that calm Deke confidence*

Burp Suite is your web application testing Swiss Army knife. It's like having superhuman abilities to see what's really happening between your browser and web servers.

**Essential Components:**
- **Proxy:** Intercepts and modifies HTTP requests
- **Scanner:** Automated vulnerability detection
- **Intruder:** Automated attack tool
- **Repeater:** Manual request testing

**Getting Started Safely:**
1. Set up a local lab environment (DVWA, WebGoat)
2. Configure your browser to use Burp's proxy (127.0.0.1:8080)
3. Start with simple GET/POST request interception

**Ethical Boundaries:**
- Only test applications you own or have written permission to test
- Use lab environments like PortSwigger Academy
- Never test production systems without authorization

**Learning Path:**
1. PortSwigger Web Security Academy (free!)
2. OWASP WebGoat
3. Practice on HackTheBox web challenges

The key is understanding the HTTP protocol first. Once you get how web requests work, Burp becomes your magnifying glass into the digital world.

What specific aspect of web app testing interests you most?`,

    'sql injection': `*types methodically while explaining*

SQL injection is like finding a secret door in a building's foundation. It happens when applications don't properly sanitize user input that gets passed to database queries.

**How It Works:**
Instead of normal data, you input SQL commands that the database executes. Think of it as tricking the database into running your code instead of the intended query.

**Example (for educational understanding):**
Normal: \`SELECT * FROM users WHERE username='admin'\`
Injected: \`SELECT * FROM users WHERE username='admin'--'\`

**Types to Learn:**
- Union-based injection
- Boolean-based blind injection  
- Time-based blind injection
- Error-based injection

**Safe Learning Environments:**
- SQLi Labs (local setup)
- DVWA SQL Injection module
- PortSwigger SQL injection labs
- TryHackMe SQL Injection room

**Prevention (for defenders):**
- Use parameterized queries
- Input validation and sanitization
- Principle of least privilege for database accounts

**Ethical Practice:**
Only test on systems you own or have explicit permission to test. Many companies have bug bounty programs if you want to help secure real systems legally.

Remember: The goal is to understand vulnerabilities to better defend against them, not to cause harm.

Want to explore any specific SQLi technique or defensive measures?`,

    'default': `*adjusts position thoughtfully like Deke analyzing a problem*

Interesting question. Let me break this down for you:

Based on your query, here are some key points to consider from a cybersecurity perspective:

**Educational Approach:**
- Always start with understanding the fundamentals
- Practice in controlled, authorized environments only
- Document everything you learn

**Ethical Boundaries:**
- Only test systems you own or have explicit written permission to test
- Use dedicated lab environments (VMs, CTF platforms)
- Focus on learning to defend, not to attack

**Recommended Resources:**
- Set up a home lab with vulnerable VMs
- Try platforms like TryHackMe, HackTheBox Academy
- Read OWASP documentation for web security
- Practice on purpose-built vulnerable applications

**Next Steps:**
1. Clarify what specific aspect you want to learn about
2. Set up a proper lab environment
3. Start with guided tutorials
4. Always maintain ethical standards

Remember: Real cybersecurity professionals are defenders first. We learn offensive techniques to better understand how to protect systems and users.

What specific area would you like to explore further? I can provide more targeted guidance.`
  }
  
  // Simple keyword matching for demo purposes
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('nmap')) return responses.nmap
  if (lowerQuery.includes('burp')) return responses.burp
  if (lowerQuery.includes('sql') && lowerQuery.includes('injection')) return responses['sql injection']
  
  return responses.default
}

// Helper function to log user actions
async function logUserAction(c: any, userEmail: string, action: string, extraInfo?: any) {
  try {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      userEmail,
      action,
      extraInfo: extraInfo ? JSON.stringify(extraInfo) : ''
    }
    
    // In a real implementation, you would send this to Google Sheets
    // For now, we'll log to console
    console.log('User Action Log:', logEntry)
    
    // TODO: Implement actual Google Sheets API integration
    // This would involve using the Google Sheets API to append a row
    
  } catch (error) {
    console.error('Failed to log user action:', error)
  }
}