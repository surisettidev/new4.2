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
  
  // Return enhanced learning guide with progress tracking
  return c.json({
    modules: learningGuide,
    totalEstimatedTime: "18-24 weeks",
    skillLevels: ["Beginner", "Intermediate", "Advanced", "Professional"],
    lastUpdated: new Date().toISOString()
  })
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

// Helper function to simulate AI response with enhanced Deke Shaw personality
async function generateAIResponse(query: string, apiKey?: string): Promise<string> {
  // This is a simplified implementation with comprehensive Deke Shaw responses
  // In a real application, you would integrate with OpenAI API or another AI service
  
  const responses = {
    // Common cybersecurity queries and Deke Shaw style responses
    'nmap': `*adjusts glasses analytically with that signature Deke focus* 

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

    'metasploit': `*leans forward with analytical intensity*

Metasploit - now we're talking serious penetration testing framework. Think of it as the ultimate Swiss Army knife for security professionals.

**Core Components:**
- **Exploits:** Code that takes advantage of vulnerabilities
- **Payloads:** What runs after successful exploitation
- **Auxiliaries:** Scanning and enumeration tools
- **Encoders:** Evade detection systems

**Essential Commands:**
\`msfconsole\` - Main interface
\`search [vulnerability]\` - Find exploits
\`use [exploit/path]\` - Select exploit module
\`show options\` - View required parameters
\`set RHOSTS [target]\` - Set target

**Safe Practice Environment:**
- Use Metasploitable 2/3 VMs (purposely vulnerable)
- Set up isolated lab networks
- Practice on VulnHub/HackTheBox retired machines

**Ethical Boundaries:**
Only use against systems you own or have explicit written authorization to test. Real penetration testers always have signed agreements before touching any system.

**Learning Path:**
1. Start with basic auxiliary scanners
2. Practice with known vulnerabilities in lab VMs
3. Learn payload generation for different scenarios
4. Understand how to write custom modules

Remember: We're defenders learning offensive techniques. The goal is understanding attack vectors to better protect systems.

What specific Metasploit module or technique would you like to explore?`,

    'wireshark': `*pulls up packet capture with methodical precision*

Wireshark is like having X-ray vision into network traffic. Every packet tells a story - you just need to know how to read it.

**Key Features:**
- **Live Capture:** Monitor real-time network traffic
- **Protocol Analysis:** Deep packet inspection
- **Filtering:** Focus on specific traffic types
- **Statistics:** Network performance metrics

**Essential Filters:**
\`tcp.port == 80\` - HTTP traffic
\`ip.addr == 192.168.1.1\` - Specific IP
\`dns\` - DNS queries only
\`tcp.flags.syn == 1\` - TCP connection attempts

**Security Analysis Techniques:**
- Identify suspicious connections
- Analyze malware communication
- Detect data exfiltration
- Monitor authentication traffic

**Ethical Practice:**
- Only capture traffic on networks you own/administer
- Respect privacy - focus on security analysis
- Use in controlled lab environments
- Follow company policies for network monitoring

**Lab Setup:**
1. Create isolated VM network
2. Generate different types of traffic
3. Practice identifying normal vs suspicious patterns
4. Learn to correlate with other security tools

The key is understanding network protocols first. TCP/IP knowledge is essential before diving deep into packet analysis.

What type of network traffic analysis interests you most?`,

    'osint': `*steeples fingers thoughtfully while considering information gathering*

OSINT - Open Source Intelligence. It's like being a digital detective, gathering information from publicly available sources. The art is in knowing where to look and how to connect the dots.

**Primary Categories:**
- **Social Media Intelligence:** Public profiles, posts, connections
- **Search Engine Intelligence:** Cached pages, indexed documents
- **Website Intelligence:** DNS records, certificates, technology stacks
- **Image Intelligence:** Metadata, reverse searches, geolocation

**Essential Tools:**
- **Google Dorking:** Advanced search operators
- **Shodan:** Internet-connected device search
- **theHarvester:** Email and subdomain enumeration
- **Maltego:** Link analysis and visualization
- **SpiderFoot:** Automated OSINT framework

**Advanced Techniques:**
\`site:target.com filetype:pdf\` - Find PDFs on target domain
\`inurl:admin site:target.com\` - Look for admin panels
\`"index of" site:target.com\` - Directory listings

**Ethical Boundaries:**
- Only gather publicly available information
- Respect privacy and terms of service
- Don't use information for harassment or illegal purposes
- Consider the impact on individuals

**Professional Applications:**
- Threat intelligence gathering
- Brand protection monitoring
- Security awareness training
- Penetration testing reconnaissance

**Privacy Protection:**
Understanding OSINT helps you protect yourself - review your digital footprint, adjust privacy settings, minimize information leakage.

Remember: Information is powerful. Use it responsibly and ethically.

What aspect of OSINT would you like to explore further?`,

    'privilege escalation': `*analyzes system architecture with systematic approach*

Privilege escalation - the art of climbing the digital ladder from user to root. It's about understanding system weaknesses and configuration errors.

**Types:**
- **Vertical:** Low privilege to high privilege (user to admin)
- **Horizontal:** Same privilege level but different user context

**Common Vectors:**
- **SUID/SGID binaries:** Files with elevated permissions
- **Kernel exploits:** Operating system vulnerabilities
- **Service misconfigurations:** Poorly configured services
- **Credential harvesting:** Finding stored passwords
- **Path hijacking:** Exploiting PATH environment variables

**Linux Enumeration:**
\`sudo -l\` - Check sudo permissions
\`find / -perm -4000 2>/dev/null\` - Find SUID files
\`cat /etc/passwd\` - Enumerate users
\`ps aux\` - Running processes
\`netstat -tulpn\` - Network connections

**Windows Enumeration:**
\`whoami /priv\` - Current privileges
\`net user\` - User accounts
\`systeminfo\` - System information
\`tasklist\` - Running processes

**Safe Learning:**
- Use vulnerable VMs (Kioptrix, FristiLeaks)
- Practice on HackTheBox/TryHackMe machines
- Set up local privilege escalation labs
- Study CVE databases for understanding

**Defensive Perspective:**
Understanding these techniques helps you:
- Properly configure system permissions
- Implement defense in depth
- Monitor for suspicious activity
- Apply security patches promptly

The goal is learning to secure systems better, not to exploit them maliciously.

What specific privilege escalation technique would you like to explore?`,

    'social engineering': `*observes human behavior patterns with analytical detachment*

Social engineering - the art of manipulating human psychology for information gathering. It's often the weakest link in security, but also the most critical to understand and defend against.

**Core Principles:**
- **Authority:** People comply with perceived authority figures
- **Scarcity:** Creating urgency through limited time/resources
- **Social Proof:** Following what others appear to be doing
- **Reciprocity:** Feeling obligated to return favors
- **Trust:** Exploiting established relationships

**Common Techniques:**
- **Phishing:** Fraudulent emails requesting information
- **Vishing:** Voice-based social engineering attacks
- **Pretexting:** Creating false scenarios to gather information
- **Baiting:** Offering something enticing to trigger actions
- **Tailgating:** Physical unauthorized access following authorized personnel

**Educational Framework:**
- Study psychology of influence (Cialdini's principles)
- Analyze real-world social engineering cases
- Practice in controlled awareness training scenarios
- Understand cultural and contextual factors

**Defensive Strategies:**
- Security awareness training for all personnel
- Verification procedures for sensitive requests
- Multi-factor authentication implementation
- Regular simulated phishing exercises
- Clear incident reporting procedures

**Ethical Boundaries:**
- NEVER manipulate people for personal gain
- Only practice in authorized training scenarios
- Focus on defensive education and awareness
- Respect privacy and psychological well-being
- Always get proper authorization for security testing

**Professional Applications:**
- Security awareness program development
- Authorized penetration testing social engineering assessments
- Incident response and threat analysis
- Training security teams on human factor risks

Remember: The human element is both the weakest and strongest part of security. Education and awareness are our best defenses.

What aspect of social engineering defense would you like to explore?`,

    'default': `*adjusts position thoughtfully like Deke analyzing a complex problem*

Interesting question. Let me break this down from a cybersecurity perspective:

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
  
  // Enhanced keyword matching for comprehensive cybersecurity topics
  const lowerQuery = query.toLowerCase()
  
  // Core tools
  if (lowerQuery.includes('nmap')) return responses.nmap
  if (lowerQuery.includes('burp')) return responses.burp
  if (lowerQuery.includes('metasploit') || lowerQuery.includes('msf')) return responses.metasploit
  if (lowerQuery.includes('wireshark')) return responses.wireshark
  
  // Techniques and concepts
  if (lowerQuery.includes('sql') && lowerQuery.includes('injection')) return responses['sql injection']
  if (lowerQuery.includes('osint') || lowerQuery.includes('reconnaissance')) return responses.osint
  if (lowerQuery.includes('privilege') && lowerQuery.includes('escalation')) return responses['privilege escalation']
  if (lowerQuery.includes('social') && lowerQuery.includes('engineering')) return responses['social engineering']
  
  // Additional tool matches
  if (lowerQuery.includes('nikto') || lowerQuery.includes('dirb') || lowerQuery.includes('gobuster')) {
    return `*methodically configures web application scanner*

Web application scanners - essential for finding hidden directories and vulnerabilities. Each tool has its strengths:

**Nikto:** General web server scanner
- Checks for outdated software versions
- Identifies dangerous files and programs
- Tests for server configuration issues

**Dirb/Gobuster:** Directory and file brute forcing
- Discovers hidden paths and files
- Uses wordlists to find common directories
- Essential for web app enumeration

**Usage Examples:**
\`nikto -h https://target.com\`
\`gobuster dir -u https://target.com -w /wordlist.txt\`
\`dirb https://target.com /usr/share/wordlists/dirb/common.txt\`

**Safe Practice:**
- Use only on systems you own or have permission to test
- Start with DVWA, WebGoat, or similar vulnerable applications
- Practice on local lab environments first

Remember: These tools are for finding vulnerabilities to fix them, not to exploit systems maliciously.

What specific aspect of web application testing interests you?`
  }
  
  if (lowerQuery.includes('john') || lowerQuery.includes('hashcat') || lowerQuery.includes('password')) {
    return `*analyzes password security with methodical precision*

Password cracking tools - understanding these helps build better password policies and security measures.

**John the Ripper:**
- Multi-platform password cracker
- Supports many hash formats
- Excellent for password policy testing

**Hashcat:**
- GPU-accelerated password recovery
- Extremely fast with proper hardware
- Advanced attack modes and rules

**Educational Usage:**
\`john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt\`
\`hashcat -m 0 -a 0 hashes.txt wordlist.txt\`

**Ethical Applications:**
- Testing organizational password policies
- Recovery of your own forgotten passwords
- Security awareness demonstrations
- Penetration testing with proper authorization

**Defensive Insights:**
- Implement strong password policies
- Use multi-factor authentication
- Regular password auditing
- Employee security awareness training

Understanding how passwords are cracked helps you defend against these attacks effectively.

What aspect of password security would you like to explore further?`
  }
  
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