export const recentProjects = {
  slug: "recent-projects-roundup",
  title: "What I've Been Building: A Roundup of Projects from the Past 2 Months",
  date: "2026-07-16",
  tags: ["open-source", "tauri", "swift", "rust", "ai", "pipewire", "automation"],
  excerpt: "From floating reactive scratchpads and < 5ms system-wide macOS autocorrect to PipeWire monitor audio splitters and portfolio automation engines—here is everything I built over the last two months.",
  content: `
    <p className="lead text-lg font-medium text-foreground/90 mb-6">
      Over the past two months, my development philosophy has revolved around one simple question: <em>Where is the daily friction in my workflow, and can I build a fast, local-first, zero-BS tool to eliminate it?</em>
    </p>

    <p>
      Instead of relying on heavy SaaS applications or bloated web apps with monthly subscriptions, I spent the last few weeks building specialized utilities across macOS, Linux, and the web. Here is a thorough roundup of the core projects, automation engines, and native tools I designed and shipped during this sprint.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-8 mb-4">1. PaperCache: The Floating Reactive Knowledge Manager</h2>

    <p>
      At the heart of my recent productivity improvements sits <strong>PaperCache</strong>, an open-source floating scratchpad that completely reimagines what a quick-notes tool should do.
    </p>

    <p>
      Built with <strong>Tauri v2, Rust, React, and TypeScript</strong>, PaperCache operates completely in the background with zero Dock clutter and <code>0.0%</code> idle CPU usage. Pressing your global hotkey (<code>Cmd+Shift+C</code> or <code>Cmd+Shift+N</code>) spawns the editor directly on your active monitor at your mouse cursor.
    </p>

    <ul className="list-disc pl-6 space-y-2 my-4">
      <li><strong>Reactive Spreadsheet Math:</strong> Type <code>/var x = 12</code> and <code>x * 4 =</code> to get <code>48</code> instantly. Update variables anywhere, and your note recalculates in real-time.</li>
      <li><strong>Inline AI Assistant:</strong> Summon AI directly into your text stream using <code>/ai</code> or package your entire note as context using <code>/ctx</code>. Works natively with free models on OpenRouter or local Ollama instances.</li>
      <li><strong>Interactive Graph View:</strong> A Three.js/WebGL 2D/3D graph (<code>Cmd+G</code>) that clusters notes by folder and lets you fuzzy-search (<code>Cmd+F</code>) to fly straight to any node.</li>
    </ul>

    <p>
      <em>Want to try it out or read the deep dive? Visit the official live web app and docs at <a href="https://papercache.vrbl.win" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors font-semibold">papercache.vrbl.win</a> or read our <a href="/blog/building-papercache" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">Building PaperCache</a> post.</em>
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">2. SwiftType: Fast, Local System-Wide Autocorrect for macOS</h2>

    <p>
      Typing fast on desktop often leads to typos, but standard desktop dictionaries are notoriously clunky and lack technical vocabulary. To bridge the gap between mobile keyboard intelligence (like iOS or Gboard) and desktop power users, I engineered <strong>SwiftType</strong>.
    </p>

    <p>
      SwiftType is a native, privacy-first macOS menu bar application written in <strong>Swift 6</strong> that delivers instantaneous (<code>&lt; 5ms</code>) system-wide autocorrect with zero latency.
    </p>

    <ul className="list-disc pl-6 space-y-3 my-4">
      <li>
        <strong>Hybrid $O(1)$ Correction Engine:</strong> Powered by a dual-engine architecture combining a <strong>Symmetric Delete (<code>SymSpell</code>)</strong> $O(1)$ dictionary lookup and a <strong>Burkhard-Keller (<code>BK-Tree</code>)</strong> metric space search engine.
      </li>
      <li>
        <strong>Developer &amp; Technical Vocabularies:</strong> Out of the box, it includes specialized technical dictionary modules for programming (<code>Swift</code>, <code>Rust</code>, <code>Python</code>, <code>Go</code>, <code>Docker</code>, <code>Git</code>, <code>POSIX</code>), systems architecture (<code>Homebrew</code>, <code>Wayland</code>, <code>Kubernetes</code>, <code>x86_64</code>), and scientific terminology (<code>pLDDT</code>, <code>genome</code>, <code>mitochondria</code>).
      </li>
      <li>
        <strong>100% Offline &amp; Secure:</strong> All keystroke monitoring and statistical learning run strictly locally with zero network calls and zero telemetry. It automatically detects secure password fields (<code>AXSecureTextField</code>) and bypasses monitoring instantly.
      </li>
      <li>
        <strong>Instant <code>Cmd+Z</code> Undo:</strong> Pressing <code>Cmd+Z</code> within 5 seconds of an autocorrect event immediately restores your original typed text.
      </li>
    </ul>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">3. PipeWire Monitor Splitter (<code>pipewire-audio-controller</code>)</h2>

    <p>
      If you run a multi-monitor Linux setup, managing independent audio streams across display sinks can be frustratingly tedious. Standard desktop audio managers often lump all HDMI/DisplayPort audio outputs together or reset routing rules on reboot.
    </p>

    <p>
      I built the <strong>PipeWire Monitor Splitter</strong> (<code>pipewire-audio-controller</code>) to take complete, automated control over Linux audio pipelines. By interacting directly with the PipeWire and WirePlumber graph, this utility:
    </p>

    <ul className="list-disc pl-6 space-y-2 my-4">
      <li>Automatically detects connected monitors and creates clean, independent virtual audio sinks for each screen.</li>
      <li>Allows you to isolate system notification sounds to your secondary display while keeping high-fidelity music or media playback routed strictly to your primary DAC or headphones.</li>
      <li>Persists node routings dynamically across hot-plugs and suspend cycles with minimal overhead.</li>
    </ul>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">4. Portfolio Automation Engine &amp; Live Aggregators</h2>

    <p>
      Instead of manually updating static HTML whenever I ship code or listen to new albums, I built an automated portfolio engine right into this website that continuously aggregates live data across my entire digital footprint:
    </p>

    <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Automated Music Pipeline</h3>
    <p>
      My music dashboard is powered by a backend aggregator that ingests XML exports from Apple Music and Spotify, resolves high-resolution album artwork via automated iTunes/Apple API lookups, and dynamically computes listening timelines, genre maps, on-repeat tracks, and hidden gems automatically during build time.
    </p>

    <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Live GitHub Activity &amp; Repo Metrics</h3>
    <p>
      The Projects and Home pages hook directly into the GitHub REST API to pull live star counts, fork statistics, primary languages, and exact commit contribution grids (<code>GithubActivityGrid</code>) with fallback caching—ensuring that whenever I push code, the portfolio reflects it instantly without manual intervention.
    </p>

    <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Multi-Subdomain Routing Architecture</h3>
    <p>
      To keep everything modular, the site runs a custom routing engine that maps subdomains like <code>blog.vrbl.win</code>, <code>projects.vrbl.win</code>, <code>fun.vrbl.win</code>, and <code>about.vrbl.win</code> directly into specialized app views while preserving single-page transitions and shared design tokens.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">5. Vinyl: Real-Time macOS Menu Bar Lyrics</h2>

    <p>
      When listening to music while coding, switching windows just to check the track title or sing along to lyrics instantly breaks focus. I built <strong>Vinyl</strong> to solve that exact annoyance.
    </p>

    <p>
      Vinyl is a lightweight, native <strong>macOS application written in Swift</strong> that sits unobtrusively inside your menu bar. It hooks cleanly into both Apple Music and Spotify, reading the currently playing track and streaming time-synchronized lyrics in real-time directly across the top of your screen.
    </p>

    <blockquote className="border-l-2 border-primary pl-4 italic text-foreground/70 my-6">
      "No bulky desktop player windows, no browser extensions—just pure native Swift rendering right where your eyes naturally check the time."
    </blockquote>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">6. Omelette: Multi-Model AI for Raycast &amp; Vicinae</h2>

    <p>
      Launcher utilities like Raycast (on macOS) and Vicinae (on Linux) are where keyboard-centric workflows thrive. However, most built-in AI extensions lock you into expensive vendor tiers or rigid model selections.
    </p>

    <p>
      To bypass this, I developed <strong>Omelette</strong> across two platforms:
    </p>

    <ul className="list-disc pl-6 space-y-3 my-4">
      <li>
        <strong>Omelette for Raycast:</strong> A dedicated Raycast extension that connects directly to OpenRouter. It gives you instant, keyboard-driven access to virtually any top-tier model (like <code>gpt-4o</code>, <code>claude-3.5-sonnet</code>, or free NVIDIA/Llama models) directly from your launcher command bar.
      </li>
      <li>
        <strong>Omelette for Vicinae:</strong> A full port of the extension for Vicinae on Linux, ensuring that cross-platform developers get the exact same lightning-fast AI prompt UX whether they are running macOS or a Linux distribution.
      </li>
    </ul>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">7. Terminal AI Helper &amp; Systems Utilities</h2>

    <p>
      Outside of graphical apps, I spent significant time tightening up my command-line infrastructure:
    </p>

    <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Terminal AI Helper (<code>terminal_helper</code>)</h3>
    <p>
      A suite of lightweight Python CLI utilities that hook directly into OpenRouter and Hugging Face. When you encounter a complex <code>git</code> rebase, a convoluted <code>ffmpeg</code> pipe, or a cryptic build failure, triggering the helper translates intent into exact, syntactically correct shell commands right inside your terminal session.
    </p>

    <h3 className="text-lg font-bold text-foreground mt-6 mb-2">Newsfeed &amp; P2P Networks</h3>
    <p>
      Rounding out the sprint were <strong>Newsfeed</strong> (a fast, distraction-free personal RSS aggregator optimized for mobile reading without algorithmic noise) and <strong>Peer-Network</strong> (a research project building a custom cryptographic blockchain P2P information network).
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">Summary &amp; The Common Thread</h2>

    <p>
      When you look across PaperCache, SwiftType, PipeWire Splitter, Vinyl, Omelette, and the portfolio automation engine, a unified design philosophy emerges:
    </p>

    <ol className="list-decimal pl-6 space-y-2 my-4">
      <li><strong>Active over Passive:</strong> Tools shouldn't just store text or sit static; they should compute math (<code>PaperCache</code>), correct typos in milliseconds (<code>SwiftType</code>), route audio (<code>PipeWire Splitter</code>), or stream live lyrics (<code>Vinyl</code>).</li>
      <li><strong>Local-First &amp; Lightweight:</strong> Native Swift (<code>SwiftType</code>, <code>Vinyl</code>), native Rust (<code>PaperCache</code>), and low-level system integrations consistently outperform bloated web wrappers every time.</li>
      <li><strong>Zero Friction:</strong> The best tool is the one that spawns instantly at your cursor or in your menu bar and disappears the moment the task is complete.</li>
    </ol>

    <p>
      All of these projects are open-source and available on my <a href="https://github.com/VariableThe" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">GitHub</a>. Feel free to explore the code, fork them for your own setup, or submit PRs!
    </p>
  `,
};
