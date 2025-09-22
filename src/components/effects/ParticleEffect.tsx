import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

interface ParticleEffectProps {
  isActive: boolean;
  particleCount?: number;
  colors?: string[];
  containerClass?: string;
}

const ParticleEffect = ({ 
  isActive, 
  particleCount = 15,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  containerClass = "absolute inset-0 pointer-events-none"
}: ParticleEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2
      }));
      
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, particleCount, colors]);

  if (!isActive) return null;

  return (
    <div className={containerClass}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          initial={{ 
            scale: 0,
            opacity: 0,
          }}
          animate={{ 
            scale: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0],
            y: [0, -30, -60, -100],
            x: [0, Math.random() * 40 - 20],
            rotate: [0, 360]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
            times: [0, 0.2, 0.8, 1]
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;