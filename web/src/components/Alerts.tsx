"use client";

import { motion } from 'framer-motion';
import { MessageCircle, Zap, Users, Trophy, Star } from 'lucide-react';
import Image from 'next/image';

export function Alerts() {
  const groupUrl = 'https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(groupUrl)}`;

  return (
    <div className="max-w-full mx-auto pb-20 text-center min-h-full bg-background">
      {/* Center Court Hero Header */}
      <header className="relative pt-24 pb-16 md:pt-32 md:pb-20 px-6 text-left bg-primary overflow-hidden mb-12">
        {/* Pressed Grass Texture Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

        {/* Kinetic Cut Accent */}
        <div 
          className="absolute bottom-0 left-0 w-full h-12 bg-background" 
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-secondary font-sans font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Community Network</span>
            </div>
            <h1 className="text-6xl md:text-[7rem] font-display italic tracking-tighter text-secondary leading-[0.85]">
              Community <br />
              Alerts
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        <p className="text-foreground/40 max-w-lg mx-auto font-medium text-lg text-balance mb-12">
          Join our official WhatsApp dispatch to receive instant notifications on seed changes and match logs.
        </p>

        <div className="bg-muted p-1 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
          <div className="bg-secondary p-10 md:p-20 flex flex-col items-center">
            {/* Desktop/Tablet View: QR Code */}
            <div className="hidden md:flex flex-col items-center gap-12">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-primary/10 border-8 border-background">
                <Image 
                  src={qrCodeUrl}
                  alt="WhatsApp Group QR Code"
                  width={224}
                  height={224}
                  className="w-56 h-56"
                  unoptimized
                />
              </div>
              <div className="space-y-4">
                <p className="text-foreground font-display italic text-4xl tracking-tighter">Scan to Join</p>
                <p className="text-foreground/40 font-bold text-[10px] tracking-widest uppercase">Open camera to scan</p>
              </div>
            </div>

            {/* Mobile View: Join Button */}
            <div className="md:hidden flex flex-col items-center gap-10 w-full">
              <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <MessageCircle className="w-12 h-12 text-secondary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-foreground font-display italic text-4xl tracking-tighter">Stay in the Loop</h3>
                <p className="text-foreground/40 text-sm font-medium">Tap below to join the Cayman Pickleball Alerts group.</p>
              </div>
              <a 
                href={groupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary hover:opacity-95 text-secondary font-sans font-bold py-6 rounded-2xl transition-all tracking-[0.2em] text-xs text-center shadow-xl shadow-primary/10 uppercase"
              >
                Join Dispatch
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-12 opacity-30">
          <div className="flex flex-col items-center gap-3">
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-sans font-bold tracking-[0.3em] uppercase">Instant</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-sans font-bold tracking-[0.3em] uppercase">Community</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Trophy className="w-5 h-5" />
            <span className="text-[9px] font-sans font-bold tracking-[0.3em] uppercase">Elite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
