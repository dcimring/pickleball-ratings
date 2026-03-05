"use client";

import { motion } from 'framer-motion';
import { MessageCircle, Zap, Users, Trophy } from 'lucide-react';

export function Alerts() {
  const groupUrl = 'https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x250&data=${encodeURIComponent(groupUrl)}`;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-6 pb-20 text-center min-h-full">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-volt" />
          <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Community</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
          REAL-TIME <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">ALERTS</span>
        </h1>
        <p className="mt-4 text-ghost/60 max-w-lg mx-auto font-sans text-lg text-balance">
          Join our WhatsApp group to get instant notifications when rankings change or new matches are logged.
        </p>
      </div>

      <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
        {/* Desktop/Tablet View: QR Code */}
        <div className="hidden md:flex flex-col items-center gap-8">
          <div className="bg-white p-4 rounded-2xl">
            <img 
              src={qrCodeUrl}
              alt="WhatsApp Group QR Code"
              className="w-48 h-48"
            />
          </div>
          <div className="space-y-2">
            <p className="text-white font-display text-lg font-bold tracking-tight">SCAN TO JOIN</p>
            <p className="text-ghost/40 text-sm">Open your phone's camera to scan the code</p>
          </div>
        </div>

        {/* Mobile View: Join Button */}
        <div className="md:hidden flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-volt/10 rounded-full flex items-center justify-center mb-2">
            <MessageCircle className="w-10 h-10 text-volt" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-display text-xl font-black">STAY IN THE LOOP</h3>
            <p className="text-ghost/60 text-sm">Tap the button below to join the Cayman Pickleball Alerts group.</p>
          </div>
          <a 
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-volt hover:bg-volt/90 text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm text-center"
          >
            JOIN GROUP
          </a>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
        <div className="flex flex-col items-center gap-1">
          <Zap className="w-4 h-4" />
          <span className="text-[8px] font-display tracking-widest">INSTANT</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Users className="w-4 h-4" />
          <span className="text-[8px] font-display tracking-widest">COMMUNITY</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span className="text-[8px] font-display tracking-widest">COMPETITIVE</span>
        </div>
      </div>
    </div>
  );
}
