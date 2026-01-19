'use client';

import React from 'react';
import { Settings, ShieldAlert, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-white to-white">
            <div className="max-w-2xl w-full text-center space-y-12">
                {/* Animated Icon Container */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="relative bg-white border-4 border-primary/20 rounded-[40px] p-8 shadow-2xl shadow-primary/10 rotate-3 transition-transform hover:rotate-0 duration-500">
                        <Settings className="w-20 h-20 text-primary animate-[spin_8s_linear_infinite]" />
                        <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-2xl p-3 shadow-lg shadow-red-200">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
                        Improving <span className="text-primary italic">Your</span> <br /> Learning Experience
                    </h1>
                    <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                        We're currently performing some magic behind the scenes to make ITSLab even better. We'll be back shortly!
                    </p>
                </div>

                {/* Status Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="p-6 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Estimated Return</p>
                            <p className="font-bold text-slate-900">Under 2 Hours</p>
                        </div>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Need Support?</p>
                            <p className="font-bold text-slate-900 underline decoration-primary decoration-2 underline-offset-4">Contact Us</p>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-8">
                    <Link href="mailto:support@itslab.com">
                        <Button
                            className="rounded-[20px] h-14 px-10 font-black text-lg gap-2 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                        >
                            Check Social Updates
                        </Button>
                    </Link>
                </div>

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    &copy; 2026 ITSLab Platform. All Rights Reserved.
                </p>
            </div>
        </div>
    );
}
