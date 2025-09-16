import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CYB Guide - Ethical Cybersecurity Learning Hub</title>
        
        {/* TailwindCSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Font Awesome for Icons */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Custom CSS */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* Meta Tags */}
        <meta name="description" content="CYB Guide - Ethical Cybersecurity Learning Hub for aspiring ethical hackers. Learn responsibly in lab environments only." />
        <meta name="keywords" content="cybersecurity, ethical hacking, penetration testing, security education, cybersecurity learning" />
        <meta name="author" content="CYB Guide Team" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </head>
      <body className="bg-black text-green-500 font-mono">
        {children}
      </body>
    </html>
  )
})
