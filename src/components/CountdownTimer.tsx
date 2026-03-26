'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(targetTime.getHours() + 24);
    
    // To make it look like a persistent 24h timer without complex storage, 
    // we just count down 24h from when the user opened the page.
    let remaining = 24 * 60 * 60;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) remaining = 0;
      
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 text-amber-300 font-montserrat text-sm uppercase font-bold tracking-wider mt-2 mb-4 animate-pulse">
      <Clock className="w-4 h-4" />
      <span>Акція діє ще: {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}</span>
    </div>
  );
}
