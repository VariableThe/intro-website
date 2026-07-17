export const buildingPapercache = {
  slug: "building-papercache",
  title: "Building PaperCache: Why I Made a Floating Knowledge Manager",
  date: "2026-07-16",
  tags: ["open-source", "tauri", "rust", "react", "productivity"],
  excerpt: "Why I built a reactive, floating markdown notepad that evaluates math instantly, runs AI inline, and lives in your menu bar — completely free and local-first.",
  content: `
    <p className="lead text-lg font-medium text-foreground/90 mb-6">
      Have you ever been deep in a coding problem or a fast-moving meeting, needed to jot down a quick note, do a fast calculation, or draft a thought, and felt the overwhelming friction of opening your heavy notes app?
    </p>

    <p>
      Traditional knowledge bases are built like databases. They demand titles, folders, tags, and permanent structure before you even type your first word. But our actual day-to-day thinking isn't like that—it's messy, ephemeral, and fast.
    </p>

    <p>
      I saw a beautifully designed app called Antinote that tackled this floating scratchpad concept, but it was locked behind a paywall. I wanted something just as sleek that fit my exact workflow as a developer without paying monthly rent for my own scratch notes. So I decided to build my own: <strong>PaperCache</strong>.
    </p>

    <p>
      Once I built it and felt how much time it saved me every single day, I realized thousands of other developers and power users likely felt the exact same friction. So I made it 100% free, open-source, and local-first for everyone. You can explore the live web version, feature documentation, and downloads right now at <a href="https://papercache.vrbl.win" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors font-semibold">papercache.vrbl.win</a>.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-8 mb-4">What Exactly is PaperCache?</h2>

    <p>
      PaperCache is a floating, background-first knowledge manager that stays completely invisible until you need it. There's no window cluttering your desktop and no icon sitting in your macOS Dock.
    </p>

    <p>
      When you press your global shortcut (<code>Cmd+Shift+C</code> or <code>Cmd+Shift+N</code>), a crisp, minimalist notepad materializes right on the active monitor where your mouse cursor is currently resting. You jot your thought, check off a task, or run an equation. The moment you click away or press <code>Esc</code>, it vanishes back into the background—using zero CPU and leaving your workspace spotless.
    </p>

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">Core Philosophy: Active Over Passive</h2>

    <p>
      Most markdown editors are passive sheets of digital paper. I wanted PaperCache to feel like an active collaborator—a lightweight spreadsheet disguised as a clean notepad:
    </p>

    <ul className="list-disc pl-6 space-y-3 my-4">
      <li>
        <strong>Reactive Math &amp; Variables:</strong> Type an equation like <code>120 * 1.18 =</code> and PaperCache instantly evaluates and appends the result. Even better, you can declare live variables right inline: <code>/var rate = 85</code> and later write <code>rate * 40 =</code> to get <code>3400</code>. If you update <code>rate</code> anywhere in the document, every dependent calculation instantly recalculates in real-time across your notes.
      </li>
      <li>
        <strong>Invisible Inline AI:</strong> Instead of breaking your flow to open a browser tab for ChatGPT, you just type <code>/ai summarize these bullet points</code> right in your editor. Press Enter, and the response is streamed directly inline. Or use <code>/ctx</code> to automatically inject your entire note as context. It works out-of-the-box with free models on OpenRouter as well as local Ollama instances, with all API keys encrypted locally using your OS keychain.
      </li>
      <li>
        <strong>Developer-First Micro-Interactions:</strong> Hex colors (like <code>#D97757</code>) render as clickable color pills—clicking the circle instantly copies the code. Dates and timestamps turn into neat badges. Interactive slash commands let you spin up strikethrough checkboxes (<code>/check</code>), countdown timers with native OS notifications (<code>/timer</code>), and due-date task reminders (<code>/task @ 1d2h</code>) with auto-expire cleanup.
      </li>
      <li>
        <strong>Interactive Knowledge Graph:</strong> Press <code>Cmd+G</code> to launch a WebGL-powered 2D/3D knowledge graph that clusters notes by folder and lets you fuzzy-search (<code>Cmd+F</code>) to fly straight to any node.
      </li>
    </ul>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">The Journey: From Electron to Tauri &amp; Rust</h2>

    <p>
      The early prototypes of PaperCache (originally called <em>Antipaper</em>) were built using web tech and Electron. Electron gave us rapid iteration, but shipping a complete Chromium browser and Node.js runtime inside a background hotkey tool felt wrong:
    </p>

    <blockquote className="border-l-2 border-primary pl-4 italic text-foreground/70 my-6">
      "For a utility whose entire purpose is to stay out of the way and consume near-zero resources while idling, sitting on 100+ megabytes of RAM just to render a notepad was unacceptable."
    </blockquote>

    <p>
      In <code>v0.5.0-beta</code>, we made the architectural leap to migrate the entire system to <strong>Tauri v2 and Rust</strong>. That rewrite transformed what the application could do:
    </p>

    <ul className="list-disc pl-6 space-y-3 my-4">
      <li>
        <strong>90% Smaller Binaries:</strong> Because we leverage the operating system's native webview (WebKit on macOS, WebView2 on Windows) instead of bundling Chrome, the macOS installer shrank from ~80MB down to a razor-thin <strong>~6.8MB</strong>.
      </li>
      <li>
        <strong>66% Less RAM &amp; Zero Idle CPU:</strong> Idle memory usage dropped under 38MB, and when hidden, the app uses literally <code>0.0%</code> CPU.
      </li>
      <li>
        <strong>Deep Native OS Hooks:</strong> Writing custom Rust allowed us to hook directly into low-level macOS Cocoa APIs to completely detach from the Dock as an accessory app, accurately calculate multi-monitor mouse coordinates to prevent space jumping, and fire reliable native desktop notifications.
      </li>
    </ul>

    <h3 className="text-xl font-bold text-foreground mt-8 mb-3">Obsession with Speed &amp; Security</h3>

    <p>
      As the project matured through recent releases (up to <code>v0.5.9</code>), the focus turned to ruthless optimization and self-reliance:
    </p>

    <p>
      We discovered that third-party math parsers like <code>expr-eval</code> carried high-severity prototype pollution risks. Instead of accepting bloat, we built our own recursive-descent arithmetic and variable evaluator from scratch in ~150 lines of zero-dependency TypeScript with full unit test coverage. We offloaded the heavy Three.js knowledge graph to lazy-loaded WebGL chunks so the editor boots instantly. And we built custom visible-range regex scanning for our custom syntax highlighting, ensuring O(visible lines) performance regardless of how massive your notes grow.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-10 mb-4">Looking Forward</h2>

    <p>
      Building PaperCache has been a masterclass in local-first software, performance engineering, and opinionated UX design. It started as a personal itch—a developer wanting a fast, free, and private scratchpad without another monthly subscription—and has evolved into a robust tool that I rely on every single hour of the day.
    </p>

    <p>
      If you want to give it a spin, visit the official live app and documentation at <a href="https://papercache.vrbl.win" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors font-semibold">papercache.vrbl.win</a>, or install it right now on macOS via Homebrew:
    </p>

    <pre data-lang="bash" className="bg-foreground/5 border border-border p-4 rounded font-mono text-sm my-4 overflow-x-auto"><code>brew tap variablethe/tap
brew install --cask papercache</code></pre>

    <p>
      You can also check out the source code, inspect our performance benchmarks, and contribute directly over on <a href="https://github.com/VariableThe/PaperCache" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">GitHub</a>.
    </p>
  `,
};
