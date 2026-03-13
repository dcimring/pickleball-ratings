"use client";

import { motion } from 'framer-motion';
import { MessageCircle, Zap, Users, Trophy } from 'lucide-react';
import Image from 'next/image';

export function Alerts() {
  const groupUrl = 'https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(groupUrl)}`;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-center min-h-full">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Community</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9] uppercase text-shadow-premium">
          COMMUNITY <br />
          <span className="text-primary">ALERTS</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-lg mx-auto font-sans text-lg text-balance">
          Join our WhatsApp group to get instant notifications when rankings change or new matches are logged.
        </p>
      </div>

      <div className="bg-secondary/30 border border-border/10 rounded-3xl p-8 md:p-16 backdrop-blur-sm relative overflow-hidden">
        {/* Desktop/Tablet View: QR Code */}
        <div className="hidden md:flex flex-col items-center gap-10">
          <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-primary/10">
            <Image 
              src={qrCodeUrl}
              alt="WhatsApp Group QR Code"
              width={224}
              height={224}
              className="w-56 h-56"
              unoptimized
            />
          </div>
          <div className="space-y-3">
            <p className="text-foreground font-display text-2xl font-bold tracking-tight uppercase">Scan to Join</p>
            <p className="text-muted-foreground font-medium">Open your phone&apos;s camera to scan the code</p>
          </div>
        </div>

        {/* Mobile View: Join Button */}
        <div className="md:hidden flex flex-col items-center gap-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground font-display text-2xl font-bold tracking-tight uppercase">Stay in the Loop</h3>
            <p className="text-muted-foreground text-sm font-medium">Tap the button below to join the Cayman Pickleball Alerts group.</p>
          </div>
          <a 
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-display font-bold py-5 rounded-2xl transition-all tracking-[0.2em] text-sm text-center shadow-lg shadow-primary/20"
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
