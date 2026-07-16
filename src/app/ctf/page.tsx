"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, X, Terminal, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "All" | "Cryptography" | "Forensics";

interface Challenge {
  id: string;
  title: string;
  authored: boolean; // true = I made this challenge
  ctf: string;
  category: Exclude<Category, "All">;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  repoName: string;
  githubUrl: string;
  summary: string;
  keyInsight: string;
  commands: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  // Challenges I authored
  {
    id: "50-shades-of-network",
    title: "50 shades of network",
    authored: true,
    ctf: "KERNEL CTF",
    category: "Forensics",
    difficulty: "Medium",
    tags: ["Image Steganography", "RGB Layers", "Cisco Packet Tracer"],
    repoName: "KERNEL",
    githubUrl: "https://github.com/VariableThe/KERNEL/tree/main/50%20shades%20of%20network",
    summary:
      "An image (new_q4.png) that appears blank, paired with a Cisco Packet Tracer file as a hint. The question text provides three RGB values — those are the font colors of text hidden directly inside the image.",
    keyInsight:
      "The three hint values (170,183,198 · 098,201,235 · 129,158,076) are the exact RGB colors of invisible text written into the blank image. Isolating those color channels or adjusting contrast to match them reveals the hidden message.",
    commands: [
      "# Hint values from the question:",
      "# RGB 1 → 170, 183, 198",
      "# RGB 2 → 098, 201, 235",
      "# RGB 3 → 129, 158, 076",
      "# Open new_q4.png, isolate each color channel to find the text",
    ],
  },
  {
    id: "kernel-popcorn",
    title: "K3rnE1 (popcorn.png)",
    authored: true,
    ctf: "KERNEL CTF",
    category: "Forensics",
    difficulty: "Easy",
    tags: ["EXIF", "Metadata", "exiftool"],
    repoName: "KERNEL",
    githubUrl: "https://github.com/VariableThe/KERNEL/tree/main/Kernel",
    summary:
      "A PNG file (popcorn.png) with a flag hidden in its EXIF comment field. The intended solve is a single exiftool command.",
    keyInsight:
      "The flag wtfCTF{P0pcrn} is stored verbatim in the Comment metadata tag. Running exiftool and reading the output is the entire solution — no visual inspection needed.",
    commands: [
      "exiftool popcorn.png | grep -i comment",
      "# → Comment : wtfCTF{P0pcrn}",
    ],
  },
  {
    id: "total-redoll",
    title: "T0ta1_R3doll",
    authored: true,
    ctf: "KERNEL CTF",
    category: "Forensics",
    difficulty: "Medium",
    tags: ["binwalk", "Nested Archives", "File Carving", "Matryoshka"],
    repoName: "KERNEL",
    githubUrl: "https://github.com/VariableThe/KERNEL/tree/main/Total%20redoll",
    summary:
      "Two images of Russian nesting dolls (doll.jpg and mat_doll.jpg). The theme is literal — one image contains a hidden archive inside itself, which in turn contains another image.",
    keyInsight:
      "binwalk detects a zip archive appended to doll.jpg. Extracting it with binwalk -e surfaces a nested image. The solve mirrors the matryoshka concept: keep unpacking layers until the final payload appears.",
    commands: ["binwalk doll.jpg", "binwalk -e doll.jpg"],
  },
  {
    id: "where-the-sun-dont-shine",
    title: "Wh3rE the Sun D0nt sh1n3",
    authored: true,
    ctf: "KERNEL CTF",
    category: "Forensics",
    difficulty: "Medium",
    tags: ["steghide", "Steganography", "Binary Encoding"],
    repoName: "KERNEL",
    githubUrl:
      "https://github.com/VariableThe/KERNEL/tree/main/Where%20the%20sun%20don%27t%20shine",
    summary:
      "The question gives two binary numbers (1010011001 = 665, 10000011 = 131) and asks 'where does the light of a candle not reach?'. A candle image is attached. The answer is steghide with no password.",
    keyInsight:
      "The candle image hides a text file (candle.txt) using steghide. The binary numbers are red herrings / clue flavor. Passing an empty string as the password extracts the hidden file immediately.",
    commands: [
      'steghide extract -sf pexels-nicolas-langellotti-28179636-18128539.jpg -p ""',
      "# → wrote extracted data to candle.txt",
      "cat candle.txt",
    ],
  },

  // Solved writeups
  {
    id: "minirsa",
    title: "miniRSA",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Medium",
    tags: ["RSA", "Small Exponent", "e=3", "Cube Root"],
    repoName: "Cryptography-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Cryptography-PicoCTF-writeup/blob/main/miniRSA.md",
    summary:
      "RSA with e=3 and no padding. The plaintext cubed is smaller than the modulus, so the ciphertext is just M³ in plain integers — no modular wrapping occurs.",
    keyInsight:
      "Because M³ < N, taking the integer cube root of C gives M directly. gmpy2.iroot handles this exactly without floating-point precision issues.",
    commands: [
      "python3 -c 'import gmpy2; c = int(open(\"ciphertext\").read()); m,_ = gmpy2.iroot(c,3); print(bytes.fromhex(hex(m)[2:]).decode())'",
    ],
  },
  {
    id: "dachshund-attacks",
    title: "Dachshund Attacks",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Hard",
    tags: ["RSA", "Wiener's Attack", "Continued Fractions", "Small d"],
    repoName: "Cryptography-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Cryptography-PicoCTF-writeup/blob/main/Dachshund_Attacks.md",
    summary:
      "RSA with a small private exponent d. Wiener's theorem says that if d < ⅓·N^(1/4), the continued fraction expansion of e/N leaks d.",
    keyInsight:
      "Evaluating the convergents of the continued fraction of e/N and checking each candidate d via ed ≡ 1 (mod φ(N)) recovers the private key in polynomial time.",
    commands: [
      "python3 -m RsaCtfTool -n <N> -e <e> --attack wiener --uncipher <C>",
    ],
  },
  {
    id: "substitution1",
    title: "substitution1",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Easy",
    tags: ["Substitution Cipher", "Frequency Analysis"],
    repoName: "Cryptography-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Cryptography-PicoCTF-writeup/blob/main/substitution1.md",
    summary:
      "A monoalphabetic substitution cipher without the key. Frequency analysis combined with the known flag prefix picoCTF{...} is enough to reconstruct the full alphabet mapping.",
    keyInsight:
      "Match high-frequency ciphertext letters against English frequency tables (E, T, A, O, I, N). The flag format gives six confirmed mappings for free.",
    commands: [
      "python3 -c 'from collections import Counter; print(Counter(open(\"message.txt\").read().upper()))'",
    ],
  },
  {
    id: "transposition-trial",
    title: "transposition-trial",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Easy",
    tags: ["Block Transposition", "3-Byte Scramble"],
    repoName: "Cryptography-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Cryptography-PicoCTF-writeup/blob/main/transposition-trial.md",
    summary:
      "Every 3-character block has its third character moved to the front: ABC → CAB. Reversing it restores the plaintext.",
    keyInsight:
      "For each chunk s[i:i+3] in the ciphertext, re-emit s[i+1:i+3] + s[i]. One-liner with a generator expression.",
    commands: [
      "python3 -c 's=open(\"msg.txt\").read(); print(\"\".join(s[i+1:i+3]+s[i] for i in range(0,len(s),3)))'",
    ],
  },
  {
    id: "vignere",
    title: "Vigenère",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Easy",
    tags: ["Vigenère Cipher", "Known Plaintext"],
    repoName: "PicoCTF_ver2",
    githubUrl: "https://github.com/VariableThe/PicoCTF_ver2/blob/main/Vignere.md",
    summary:
      "Polyalphabetic Vigenère with a known flag prefix. The first 7 characters of plaintext (picoCTF) reveal the full repeating key.",
    keyInsight:
      "XOR the first 7 ciphertext chars with 'picoCTF' to extract the key. Repeat it across the full ciphertext to decrypt.",
    commands: ["python3 -c 'key=\"CYLINDER\"; ...'"],
  },
  {
    id: "flags-visual",
    title: "Flags",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Easy",
    tags: ["Maritime Signal Flags", "Visual Cipher"],
    repoName: "Cryptography-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Cryptography-PicoCTF-writeup/blob/main/Flags.md",
    summary:
      "An image of colored nautical signal flags arranged in sequence. Each flag maps to a letter in the International Code of Signals.",
    keyInsight:
      "Look up each flag against an ICS chart. No computation required.",
    commands: ["# Reference: https://en.wikipedia.org/wiki/International_Code_of_Signals"],
  },
  {
    id: "easy1-otp",
    title: "Easy1",
    authored: false,
    ctf: "picoCTF",
    category: "Cryptography",
    difficulty: "Easy",
    tags: ["One-Time Pad", "Table Lookup", "Modular Arithmetic"],
    repoName: "PicoCTF_ver2",
    githubUrl: "https://github.com/VariableThe/PicoCTF_ver2/blob/main/Easy1.md",
    summary:
      "Table-based one-time pad where the key is given. Subtract key shifts from ciphertext modulo 26.",
    keyInsight:
      "(C_i - K_i) % 26 reverses the table for each character pair.",
    commands: [
      "python3 -c 'c=\"UFJKXQZQDRB\"; k=\"SOLVECRYPTO\"; print(\"\".join(chr((ord(a)-ord(b))%26+65) for a,b in zip(c,k)))'",
    ],
  },
  {
    id: "matryoshka-doll-pico",
    title: "Matryoshka doll",
    authored: false,
    ctf: "picoCTF",
    category: "Forensics",
    difficulty: "Medium",
    tags: ["binwalk", "Nested Archives", "PNG"],
    repoName: "Forensics-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Forensics-PicoCTF-writeup/blob/main/Matryoshka%20doll.md",
    summary:
      "A PNG with a zip inside, which contains a PNG with a zip inside, four layers deep. Recursively extract to reach flag.txt.",
    keyInsight:
      "binwalk -e on each extracted PNG reveals the next hidden archive. Four passes surfaces the flag.",
    commands: [
      "binwalk -e dolls.png",
      "binwalk -e _dolls.png.extracted/2_c.png",
      "binwalk -e _2_c.png.extracted/3_c.png",
      "cat _4_c.png.extracted/flag.txt",
    ],
  },
  {
    id: "glory-of-the-garden",
    title: "glory of the garden",
    authored: false,
    ctf: "picoCTF",
    category: "Forensics",
    difficulty: "Easy",
    tags: ["strings", "EOF Inspection", "Appended Data"],
    repoName: "Forensics-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Forensics-PicoCTF-writeup/blob/main/glory%20of%20the%20garden.md",
    summary:
      "Flag appended as plain text after the IEND chunk of a JPEG. Image viewers stop at IEND; strings does not.",
    keyInsight:
      "Any data after the image end marker is invisible to viewers but trivially exposed by strings.",
    commands: ["strings garden.jpg | grep picoCTF"],
  },
  {
    id: "information-exif",
    title: "Information",
    authored: false,
    ctf: "picoCTF",
    category: "Forensics",
    difficulty: "Easy",
    tags: ["EXIF Metadata", "Base64", "exiftool"],
    repoName: "Forensics-PicoCTF-writeup",
    githubUrl:
      "https://github.com/VariableThe/Forensics-PicoCTF-writeup/blob/main/Information.md",
    summary:
      "A cat photo with a base64-encoded flag stuffed into the EXIF License field.",
    keyInsight:
      "exiftool surfaces the anomalous base64 string in the License tag. Pipe to base64 -d.",
    commands: [
      "exiftool cat.jpg | grep -i license",
      "echo '<value>' | base64 -d",
    ],
  },
  {
    id: "mob-psycho",
    title: "Mob Psycho",
    authored: false,
    ctf: "picoCTF",
    category: "Forensics",
    difficulty: "Medium",
    tags: ["Android APK", "apktool", "Decompilation", "Hex"],
    repoName: "PicoCTF_ver2",
    githubUrl: "https://github.com/VariableThe/PicoCTF_ver2/blob/main/Mob%20Psycho.md",
    summary:
      "An Android APK containing a hex-encoded flag buried inside the res/color/ directory.",
    keyInsight:
      "Decompile with apktool, then grep recursively for the hex string 7069636f (the ASCII encoding of 'pico'). xxd -r -p decodes it.",
    commands: [
      "apktool d mobpsycho.apk -o mob_extracted",
      "grep -rn '7069636f' mob_extracted/",
      "echo -n '<hex>' | xxd -r -p",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<Exclude<Category, "All">, string> = {
  Cryptography: "#7c3aed",
  Forensics: "#d97706",
};

const DIFFICULTY_LABEL: Record<Challenge["difficulty"], string> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CtfPage() {
  const [homeUrl, setHomeUrl] = useState("/fun");
  const [categoryFilter, setCategoryFilter] = useState<Category>("All");
  const [showAuthored, setShowAuthored] = useState<boolean | null>(null); // null = all
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Challenge | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hostname.toLowerCase();
    if (/^(blog|projects|about|fun)\./.test(h)) {
      setHomeUrl(h.includes("localhost") ? `http://localhost:${window.location.port || "3000"}/fun` : "https://intro.vrbl.win/fun");
    }
  }, []);

  const categories: Category[] = ["All", "Cryptography", "Forensics"];

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CHALLENGES.filter((c) => {
      if (showAuthored !== null && c.authored !== showAuthored) return false;
      if (categoryFilter !== "All" && c.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [categoryFilter, showAuthored, search]);

  const authored = CHALLENGES.filter((c) => c.authored);
  const solved = CHALLENGES.filter((c) => !c.authored);

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href={homeUrl}
          className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Fun</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            CTF Writeups
          </h1>
          <p className="text-foreground/50 text-base">
            {authored.length} challenges I authored · {solved.length} solved writeups —{" "}
            <a
              href="https://github.com/VariableThe?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              github.com/VariableThe
            </a>
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10">
          {/* Authored toggle */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {(
              [
                [null, "all"],
                [true, "authored"],
                [false, "solved"],
              ] as [boolean | null, string][]
            ).map(([val, label]) => (
              <button
                key={String(val)}
                onClick={() => setShowAuthored(val)}
                className={`px-3 py-1 transition-colors ${
                  showAuthored === val
                    ? "text-foreground"
                    : "text-foreground/35 hover:text-foreground/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-foreground/15 hidden sm:block">|</span>

          {/* Category */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 transition-colors ${
                  categoryFilter === cat
                    ? "text-foreground"
                    : "text-foreground/35 hover:text-foreground/60"
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search..."
              className="bg-foreground/[0.03] border border-border text-sm text-foreground placeholder:text-foreground/25 pl-8 pr-3 py-1.5 w-48 focus:outline-none focus:border-foreground/30 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Challenge list */}
        {visible.length === 0 ? (
          <p className="text-foreground/35 font-mono text-sm py-12">No challenges match the current filter.</p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {visible.map((c, i) => (
                <motion.button
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  onClick={() => setSelected(c)}
                  className="text-left group border border-border hover:border-foreground/25 p-5 transition-colors card-lift flex flex-col"
                >
                  {/* Accent line */}
                  <div
                    className="w-6 h-0.5 mb-4 shrink-0"
                    style={{ backgroundColor: CATEGORY_COLOR[c.category] }}
                  />

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base text-foreground leading-snug">{c.title}</h3>
                    {c.authored && (
                      <span className="font-mono text-[10px] text-foreground/40 bg-foreground/5 px-1.5 py-0.5 shrink-0 mt-0.5">
                        authored
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/50 leading-relaxed line-clamp-3 flex-1 mb-4">
                    {c.summary}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-mono text-xs text-foreground/35">{c.ctf}</span>
                    <span className="font-mono text-xs text-foreground/25">{DIFFICULTY_LABEL[c.difficulty]}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none"
              >
                <div
                  className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-background border border-border p-6 sm:p-8 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute right-5 top-5 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Accent */}
                  <div
                    className="w-8 h-0.5 mb-5"
                    style={{ backgroundColor: CATEGORY_COLOR[selected.category] }}
                  />

                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-3 font-mono text-xs text-foreground/40">
                    <span>{selected.ctf}</span>
                    <span>·</span>
                    <span>{selected.category}</span>
                    <span>·</span>
                    <span>{DIFFICULTY_LABEL[selected.difficulty]}</span>
                    {selected.authored && (
                      <>
                        <span>·</span>
                        <span className="text-foreground/60">authored by me</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{selected.title}</h2>

                  <p className="text-sm text-foreground/65 leading-relaxed mb-6">{selected.summary}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {selected.tags.map((t) => (
                      <span key={t} className="font-mono text-xs text-foreground/40 bg-foreground/[0.04] px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Key insight */}
                  <div className="mb-6">
                    <p className="font-mono text-xs uppercase tracking-widest text-foreground/35 mb-2">
                      {selected.authored ? "intended solve" : "key insight"}
                    </p>
                    <p className="text-sm text-foreground/75 leading-relaxed">{selected.keyInsight}</p>
                  </div>

                  {/* Commands */}
                  {selected.commands.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground/35 mb-2">
                        <Terminal size={12} />
                        <span>commands</span>
                      </div>
                      <div className="bg-foreground/[0.03] border border-border p-4 overflow-x-auto">
                        {selected.commands.map((cmd, i) => (
                          <div key={i} className="flex items-start gap-3 font-mono text-xs text-foreground/80 mb-1 last:mb-0">
                            <span className="text-foreground/20 select-none shrink-0">$</span>
                            <code className="whitespace-pre-wrap break-all">{cmd}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-border">
                    <span className="font-mono text-xs text-foreground/30">{selected.repoName}</span>
                    <a
                      href={selected.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="mt-16 text-foreground/25 font-mono text-xs"
        >
          More writeups added as challenges are solved.
        </motion.p>
      </div>
    </main>
  );
}
