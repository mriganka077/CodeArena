import {
    ArrowRightIcon,
    PlayIcon,
    ZapIcon,
    CheckIcon,
    Timer,
    Sparkles,
    Play,
    Radio,
} from 'lucide-react';
import { PrimaryButton, GhostButton } from './Buttons';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Hero() {

    const trustedUserImages = [
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
    ];

    const mainImageUrl = 'https://images.unsplash.com/photo-1616587894289-86480e533129?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const galleryStripImages = [
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=100',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=100',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=100',
    ];

    const trustedLogosText = [
        'Tech recruiters',
        'Hiring managers',
        'Engineering teams',
        'HR professionals',
        'Global companies'
    ];

    const [time, setTime] = useState({ m: 24, s: 17 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => {
                const totalSec = prev.m * 60 + prev.s;
                if (totalSec <= 0) return prev;
                const next = totalSec - 1;
                return { m: Math.floor(next / 60), s: next % 60 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const timeStr = `${time.m}:${String(time.s).padStart(2, '0')}`;

    return (
        <>
            <section id="home" className="relative z-10">
                <div className="max-w-6xl mx-auto px-4 min-h-screen max-md:w-screen max-md:overflow-hidden pt-32 md:pt-26 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="text-left">
                            <motion.a className="inline-flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-full bg-white/10 mb-6 justify-start"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
                            >
                                <div className="flex -space-x-2">
                                    {trustedUserImages.map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt={`Client ${i + 1}`}
                                            className="size-6 rounded-full border border-black/50"
                                            width={40}
                                            height={40}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-200/90">
                                    Trusted by brands & founders worldwide
                                </span>
                            </motion.a>

                            <motion.h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-xl"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
                            >
                                We conduct & evaluate<br />
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-300 to-indigo-400">
                                    AI-powered technical interviews
                                </span>
                            </motion.h1>

                            <motion.p className="text-gray-300 max-w-lg mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
                            >
                                Built for modern hiring, CodeArena leverages AI to conduct smart
                                technical interviews with live coding, video interaction, and automated assessment,
                                helping teams identify top talent with speed and confidence.
                            </motion.p>

                            <motion.div className="flex flex-col sm:flex-row items-center gap-4 mb-8"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.3 }}
                            >
                                <a href="/drive" className="w-full sm:w-auto">
                                    <PrimaryButton className="max-sm:w-full py-3 px-7">
                                        Start your assessment
                                        <ArrowRightIcon className="size-4" />
                                    </PrimaryButton>
                                </a>

                                <GhostButton className="max-sm:w-full max-sm:justify-center py-3 px-5">
                                    <PlayIcon className="size-4" />
                                    View demo
                                </GhostButton>
                            </motion.div>

                            <motion.div className="flex sm:inline-flex overflow-hidden items-center max-sm:justify-center text-sm text-gray-200 bg-white/10 rounded"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
                            >
                                <div className="flex items-center gap-2 p-2 px-3 sm:px-6.5 hover:bg-white/3 transition-colors">
                                    <ZapIcon className="size-4 text-sky-500" />
                                    <div>
                                        <div>Intelligent evaluation system</div>
                                        <div className="text-xs text-gray-400">
                                            Data   driven hiring decisions
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden sm:block h-6 w-px bg-white/6" />

                                <div className="flex items-center gap-2 p-2 px-3 sm:px-6.5 hover:bg-white/3 transition-colors">
                                    <CheckIcon className="size-4 text-cyan-500" />
                                    <div>
                                        <div>Complete interview solution</div>
                                        <div className="text-xs text-gray-400">
                                            Code, communicate & analyze
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: modern mockup card */}
                        <motion.div
                            className="mx-auto w-full max-w-lg"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.5 }}
                        >
                            {/* EDITOR CARD */}
                            <div
                                className="rounded-2xl overflow-hidden relative border border-white/10 bg-[#111328]"
                                style={{
                                    boxShadow:
                                        "0 0 0 1px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                                }}
                            >
                                {/* TOPBAR */}
                                <div className="flex items-center justify-between px-4 py-3 bg-[#181b35] border-b border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <div className="px-3 py-1 rounded-md text-[11px] font-mono border border-indigo-500/20 bg-indigo-500/15 text-indigo-300">
                                            solution.py
                                        </div>
                                        <div className="px-3 py-1 rounded-md text-[11px] font-mono text-white/40">
                                            test_cases.py
                                        </div>
                                    </div>

                                    <div className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                        Python 3.11
                                    </div>
                                </div>

                                {/* SPLIT PANE */}
                                <div className="grid grid-cols-[1fr_200px] h-[310px]">

                                    {/* CODE PANEL */}
                                    <div className="border-r border-white/10 font-mono text-[12.5px] leading-[1.8] overflow-hidden py-5">
                                        <div className="flex">
                                            {/* LINE NUMBERS */}
                                            <div className="min-w-[36px] px-3 text-right text-white/15 select-none">
                                                {Array.from({ length: 16 }, (_, i) => (
                                                    <div key={i}>{i + 1}</div>
                                                ))}
                                            </div>

                                            {/* CODE */}
                                            <div className="pr-4 overflow-hidden text-[#eeffff]">
                                                <div className="hover:bg-white/[0.02] transition">
                                                    <span className="text-[#c792ea]">from</span>{" "}
                                                    typing{" "}
                                                    <span className="text-[#c792ea]">import</span>{" "}
                                                    <span className="text-[#ffcb6b]">List</span>
                                                </div>

                                                <div>&nbsp;</div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    <span className="text-[#c792ea]">class</span>{" "}
                                                    <span className="text-[#ffcb6b]">Solution</span>:
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;
                                                    <span className="text-[#c792ea]">def</span>{" "}
                                                    <span className="text-[#82aaff]">twoSum</span>(self,
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nums:
                                                    <span className="text-[#ffcb6b]"> List</span>[
                                                    <span className="text-[#ffcb6b]">int</span>],
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;target:
                                                    <span className="text-[#ffcb6b]"> int</span>
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;) -&gt;
                                                    <span className="text-[#ffcb6b]"> List</span>[
                                                    <span className="text-[#ffcb6b]">int</span>]:
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[#546e7a]"># O(n) hashmap solution</span>
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;seen = {`{}`}
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[#c792ea]">for</span> i, n{" "}
                                                    <span className="text-[#c792ea]">in</span>{" "}
                                                    <span className="text-[#82aaff]">enumerate</span>(nums):
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diff = target - n
                                                </div>

                                                {/* CURSOR LINE */}
                                                <div className="bg-indigo-500/10 -mx-[100px] px-[100px]">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[#c792ea]">if</span> diff{" "}
                                                    <span className="text-[#c792ea]">in</span> seen:
                                                    <span className="inline-block w-[2px] h-[14px] bg-indigo-300 ml-0.5 animate-pulse align-middle" />
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[#c792ea]">return</span>{" "}
                                                    [seen[diff], i]
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i
                                                </div>

                                                <div className="hover:bg-white/[0.02] transition">
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[#c792ea]">return</span> []
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI PANEL */}
                                    <div className="flex flex-col bg-[#0c0e1f] overflow-hidden">
                                        <div className="px-3.5 py-3 border-b border-white/10 text-[11px] text-white/40 flex items-center gap-2 font-mono">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                                            AI Interviewer
                                        </div>

                                        <div className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
                                            <div className="text-[11.5px] leading-[1.55] p-2.5 rounded-lg rounded-tl-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                                                Good start! Walk me through your time complexity here.
                                            </div>

                                            <div className="text-[11.5px] leading-[1.55] p-2.5 rounded-lg rounded-tr-sm bg-white/[0.04] border border-white/10 text-white/45 self-end max-w-[90%]">
                                                It's O(n) — single pass with a hashmap.
                                            </div>

                                            <div className="text-[11.5px] leading-[1.55] p-2.5 rounded-lg rounded-tl-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                                                Exactly right. What about space? Could we do it in-place?
                                            </div>

                                            <div className="text-[11.5px] leading-[1.55] p-2.5 rounded-lg rounded-tr-sm bg-white/[0.04] border border-white/10 text-white/45 self-end max-w-[90%]">
                                                Space is O(n). In-place would be O(n²)...
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTTOM BAR */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-[#181b35] border-t border-white/10">
                                    <div className="font-mono text-xs text-white/40 flex items-center gap-1.5">
                                        <Timer size={13} className="text-cyan-300" />

                                        <span>
                                            Time remaining:{" "}
                                            <span className="text-cyan-300 font-medium">
                                                {timeStr}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
                                        <Sparkles size={12} />
                                        <span>Score: 91/100</span>
                                    </div>

                                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-mono font-medium hover:opacity-85 transition">
                                        <Play size={12} fill="currentColor" />
                                        <span>Run Tests</span>
                                    </button>
                                </div>
                            </div>

                            {/* VIDEO CARD */}
                            <div className="mt-3 rounded-xl border border-white/10 bg-[#111328] px-4 py-3 flex items-center gap-3 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-transparent pointer-events-none" />

                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                                    AI
                                </div>

                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-cyan-100 flex items-center justify-center text-[11px] font-semibold shrink-0">
                                    JS
                                </div>

                                <div className="flex-1">
                                    <div className="text-[11px] text-white/40 mb-0.5">
                                        Live session · Interview #2047
                                    </div>
                                    <div className="text-[13px] font-medium flex items-center gap-2">
                                        <Radio
                                            size={12}
                                            className="text-red-400 animate-pulse"
                                        />
                                        Recording &amp; evaluating in real time
                                    </div>
                                </div>

                                {/* WAVEFORM */}
                                <div className="flex items-end gap-1 h-[22px]">
                                    {[8, 16, 12, 20, 10, 18].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-[3px] rounded bg-indigo-300 animate-pulse"
                                            style={{
                                                height: `${h}px`,
                                                animationDelay: `${i * 0.12}s`,
                                                animationDuration: `${0.6 + i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LOGO MARQUEE */}
            <motion.section className="border-y border-white/6 bg-white/1 max-md:mt-10"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="w-full overflow-hidden py-6">
                        <div className="flex gap-14 items-center justify-center animate-marquee whitespace-nowrap">
                            {trustedLogosText.concat(trustedLogosText).map((logo, i) => (
                                <span
                                    key={i}
                                    className="mx-6 text-sm md:text-base font-semibold text-gray-400 hover:text-gray-300 tracking-wide transition-colors"
                                >
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
};