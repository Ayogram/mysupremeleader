import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Pause, Play, Heart, Sparkles, X, Music, RotateCcw } from 'lucide-react';
import { memories, timelineEvents, reasons, interactiveMemories } from './data';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [activeMemory, setActiveMemory] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [acceptedStep, setAcceptedStep] = useState<'success' | 'countdown' | 'video'>('success');
  const [countdown, setCountdown] = useState(5);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [backgroundAudioWasPlaying, setBackgroundAudioWasPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasInitializedAudio = useRef(false);

  const acceptProposal = () => {
    setProposalAccepted(true);
    const video = videoRef.current;
    if (video) {
      video.play()
        .then(() => {
          video.pause();
          video.currentTime = 0;
        })
        .catch(err => console.log("Video unlock failed:", err));
    }
  };

  const [flippedReasons, setFlippedReasons] = useState<Record<number, boolean>>({});

  const toggleReasonFlip = (idx: number) => {
    setFlippedReasons(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // iOS preloader and HTTP caching optimizer
  useEffect(() => {
    const assets = [
      '/D8.mp4',
      '/D5.mp4',
      '/D1.mp4',
      '/thevideo.MP4',
      '/do-better-blues.mp3',
      '/firstd.jpg',
      '/thesimplethings.jpg',
      '/checking-out.jpg',
      '/D10.jpg',
      '/D2.jpg',
      '/D20.jpg'
    ];
    assets.forEach(url => {
      fetch(url, { cache: 'force-cache' })
        .then(res => res.blob())
        .catch(err => console.log(`Preloading failed for ${url}:`, err));
    });
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = 1.0;
        if (!hasInitializedAudio.current) {
          hasInitializedAudio.current = true;
        }
        audioRef.current.play().catch(err => console.log("Play failed: ", err));
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !hasInitializedAudio.current) {
        audioRef.current.volume = 1.0;
        hasInitializedAudio.current = true;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log("Autoplay failed: ", err));
      }
      // Clean up after first interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    let timeout: any;
    const currentMemory = memories[currentSlide];
    
    // Only use a fixed timer if the current slide is an image
    if (!currentMemory.image.toLowerCase().endsWith('.mp4') && !currentMemory.image.toLowerCase().endsWith('.mov')) {
      timeout = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % memories.length);
      }, 10000); // 10 seconds for pictures
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentSlide]);

  useEffect(() => {
    if (proposalAccepted) {
      // Step 1: Wait 4 seconds on the success screen
      const successTimer = setTimeout(() => {
        setCountdown(5);
        setAcceptedStep('countdown');
      }, 4000);
      return () => clearTimeout(successTimer);
    } else {
      setAcceptedStep('success');
    }
  }, [proposalAccepted]);

  useEffect(() => {
    if (acceptedStep === 'countdown') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setAcceptedStep('video');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [acceptedStep]);

  useEffect(() => {
    if (acceptedStep === 'video') {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setBackgroundAudioWasPlaying(true);
      }
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => setVideoPlaying(true))
          .catch(err => console.log("Video play failed:", err));
      }
    } else if (acceptedStep === 'success' || acceptedStep === 'countdown') {
      if (backgroundAudioWasPlaying && audioRef.current) {
        audioRef.current.play().catch(err => console.log("Music play failed:", err));
        setIsPlaying(true);
        setBackgroundAudioWasPlaying(false);
      }
    }
  }, [acceptedStep]);

  return (
    <div className={`min-h-screen bg-zinc-950 text-white selection:bg-brand-500/30 font-sans relative ${!hasStarted ? 'h-screen overflow-hidden' : 'overflow-x-hidden'}`}>
      {/* Dynamic Decorative Background Elements (Global) */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <img 
          src="/checking-out.jpg" 
          alt="Beautiful background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-zinc-950/60"></div>
        {/* Subtle decorative purple aura to blend it perfectly */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-900/20 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-600/10 rounded-full blur-[150px] mix-blend-screen"></div>
        
        {/* Floating background decorative particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-brand-400/20"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </motion.div>

      {/* Floating Music Player */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 bg-brand-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-brand-500/30"
          >
            <Music className="w-4 h-4 text-brand-300 animate-pulse" />
            <span className="text-sm font-medium text-brand-100">Do Better Blues</span>
          </motion.div>
        )}
        <button
          onClick={togglePlay}
          className="glass-card p-4 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-brand-300 group-hover:text-brand-100" />
          ) : (
            <Play className="w-6 h-6 text-brand-300 group-hover:text-brand-100" />
          )}
          {!isPlaying && (
            <span className="absolute -top-12 right-0 whitespace-nowrap bg-brand-900/90 text-brand-100 text-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-brand-500/30 shadow-xl">
              Tap to Play Our Song 💜
            </span>
          )}
        </button>
        <audio ref={audioRef} loop autoPlay>
          <source src="/do-better-blues.mp3" type="audio/mpeg" />
        </audio>
      </div>

      <main className="relative z-10">
        {/* 1. Hero Landing Page */}
        <section className="h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
          {/* Background Image specifically for the first page */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/D2.jpg" 
              alt="Abiola and I"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark gradient overlay to make text pop beautifully */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/20 to-zinc-950/90 backdrop-blur-[1px]"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto z-10"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 0px 0px rgba(139, 92, 246, 0)", "0 0 40px 10px rgba(139, 92, 246, 0.6)", "0 0 0px 0px rgba(139, 92, 246, 0)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-8 p-4 rounded-full bg-brand-900/40 border border-brand-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <Heart className="w-8 h-8 text-brand-400 drop-shadow-lg" fill="currentColor" />
            </motion.div>
            
            <h1 className="text-4xl md:text-7xl font-light mb-6 tracking-wide text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-200 to-brand-400 drop-shadow-2xl">
                From the moment I met you, Abiola... 
              </span>
              <br/> 
              <span className="font-semibold drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">everything changed.</span>
            </h1>
            <p className="text-xl md:text-2xl text-brand-100 mb-12 font-light tracking-widest uppercase letter-spacing-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
              This is our story.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setHasStarted(true);
                setTimeout(() => {
                  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }, 100);
                if (!isPlaying) togglePlay();
              }}
              className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-800 rounded-full text-white font-medium tracking-wide shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] transition-shadow duration-300 flex items-center gap-3 mx-auto"
            >
              Begin Our Story <Sparkles className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </section>

        {/* 2. Memory Slideshow Section */}
        <section className="min-h-screen py-24 px-4 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-6xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light text-center mb-16 text-brand-200"
            >
              Moments <span className="text-white italic">Frozen</span> in Time
            </motion.h2>
            
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden glass-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {memories[currentSlide].image.toLowerCase().endsWith('.mp4') || memories[currentSlide].image.toLowerCase().endsWith('.mov') ? (
                    <video 
                      src={memories[currentSlide].image} 
                      autoPlay 
                      muted 
                      playsInline
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        e.currentTarget.play().catch(err => console.log("Slideshow video play failed:", err));
                      }}
                      onEnded={() => setCurrentSlide((prev) => (prev + 1) % memories.length)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={memories[currentSlide].image} 
                      alt={memories[currentSlide].caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-brand-900/20 to-transparent"></div>
                  <div className="absolute bottom-10 left-0 right-0 text-center">
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="text-2xl md:text-4xl font-light text-white drop-shadow-lg italic"
                    >
                      "{memories[currentSlide].caption}"
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {memories.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-brand-400 w-8' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Timeline / Love Story */}
        <section className="min-h-screen py-24 px-4 relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-light text-center mb-24 text-brand-200">
              Our <span className="text-white italic">Beautiful</span> Journey
            </h2>
            
            <div className="relative border-l border-brand-500/30 ml-4 md:mx-auto md:ml-auto space-y-24">
              {timelineEvents.map((event, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative pl-8 md:pl-0 ${idx % 2 === 0 ? 'md:pr-[50%] md:text-right' : 'md:pl-[50%] md:translate-x-[1px]'}`}
                >
                  <div className={`absolute top-0 left-[-5px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-brand-400 shadow-[0_0_15px_rgba(167,139,250,0.8)]`} />
                  <div className={`glass-card p-6 md:p-8 rounded-2xl ${idx % 2 === 0 ? 'md:mr-12' : 'md:ml-12'} hover:scale-105 transition-transform duration-500`}>
                    <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase mb-2 block">{event.year}</span>
                    <h3 className="text-2xl font-light text-white mb-3">{event.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 4. Reasons Why I Like Her */}
        <section className="min-h-screen py-24 px-4 flex flex-col items-center justify-center relative bg-brand-900/10">
          <div className="max-w-6xl w-full">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light text-center mb-16 text-brand-200"
            >
              Why I Adore <span className="text-white italic">You</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reasons.map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group perspective"
                >
                  <div 
                    onClick={() => toggleReasonFlip(idx)}
                    className={`relative w-full h-48 rounded-2xl transition-all duration-500 preserve-3d cursor-pointer ${
                      flippedReasons[idx] ? 'rotate-y-180' : ''
                    } group-hover:rotate-y-180`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-6 text-center border-brand-500/20 group-hover:border-brand-400/50 transition-colors">
                      <Heart className="w-8 h-8 text-brand-500/50 mb-4" />
                      <h3 className="text-xl font-medium text-brand-100">{reason.title}</h3>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-brand-800 to-brand-600 rounded-2xl flex items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(124,58,237,0.5)] border border-brand-400">
                      <p className="text-white font-medium text-lg leading-snug">{reason.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Romantic Letter Section */}
        <section className="min-h-screen py-24 px-4 flex items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl w-full"
          >
            <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-brand-950/40 border-brand-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px]"></div>
              
              <Heart className="w-10 h-10 text-brand-400 mb-8 opacity-80" />
              
              <div className="space-y-6 text-lg md:text-xl font-light text-zinc-300 leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  viewport={{ once: true }}
                >
                  My love, my Supreme Leader,
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  viewport={{ once: true }}
                >
                  I wanted to create something special for you. Something that could try to capture even a fraction of what I feel when I look at you.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 1 }}
                  viewport={{ once: true }}
                >
                  Every moment we've shared has been beautifully etched into my memory. You bring a light into my life that I didn't even know was missing.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                  viewport={{ once: true }}
                  className="text-brand-200 font-medium pt-4"
                >
                  This isn't just a website. It's a testament to us.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 6. "Choose a Memory" Interactive Section */}
        <section className="min-h-screen py-24 px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light text-center mb-16 text-brand-200"
            >
              Unlock <span className="text-white italic">Our</span> Magic
            </motion.h2>
            
            <div className="flex flex-wrap justify-center gap-6">
              {interactiveMemories.map((memory, idx) => (
                <motion.button
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveMemory(memory.id)}
                >
                  <div className="w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden border border-brand-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 relative flex flex-col justify-end">
                    <img 
                      src={memory.image} 
                      alt={memory.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent transition-opacity duration-300"></div>
                    <div className="relative z-10 p-4 w-full text-center">
                      <span className="text-white text-lg md:text-xl font-medium drop-shadow-md">
                        {memory.title}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Modal for Interactive Memory */}
          <AnimatePresence>
            {activeMemory !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl"
                onClick={() => setActiveMemory(null)}
              >
                {interactiveMemories.filter(m => m.id === activeMemory).map(memory => (
                  <motion.div
                    key={memory.id}
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-brand-950 border border-brand-500/30 rounded-3xl overflow-hidden max-w-xl w-full relative shadow-2xl flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setActiveMemory(null)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/60 border border-brand-500/20 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="relative h-64 md:h-80 bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-brand-500/10">
                      <img 
                        src={memory.image} 
                        alt={memory.title} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                      <h3 className="text-2xl font-medium text-white mb-2">{memory.title}</h3>
                      <p className="text-brand-300 italic mb-6">"{memory.quote}"</p>
                      <p className="text-zinc-300 leading-relaxed font-light text-base md:text-lg">{memory.story}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 7. Final Proposal Scene */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 relative pb-32">
          {/* We make the background darker specifically here */}
          <div className="absolute inset-0 bg-zinc-950/80 -z-10"></div>
          
          <AnimatePresence mode="wait">
            {!proposalAccepted ? (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center max-w-4xl z-10"
              >
                <p className="text-2xl md:text-4xl text-brand-200 font-light mb-16 italic opacity-80">
                  "So after every laugh, every memory, every moment..."
                </p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-20 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-brand-100 to-brand-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    Abiola, Will You Be My Girlfriend?
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={acceptProposal}
                      className="px-12 py-5 bg-white text-brand-900 rounded-full text-xl font-medium shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all duration-300 w-full sm:w-auto"
                    >
                      Yes 💜
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={acceptProposal}
                      className="px-12 py-5 bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-full text-xl font-medium shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] transition-all duration-300 w-full sm:w-auto border border-brand-400/50"
                    >
                      Absolutely Yes, my loyal subject 💜
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="accepted-container"
                className="w-full flex items-center justify-center min-h-[50vh]"
              >
                <AnimatePresence mode="wait">
                  {acceptedStep === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1, type: "spring" }}
                      className="text-center z-10 w-full max-w-3xl flex flex-col items-center"
                    >
                      {/* Success Animation */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ 
                              opacity: 1, 
                              y: "100vh", 
                              x: `${Math.random() * 100}vw`,
                              scale: Math.random() * 1.5 + 0.5
                            }}
                            animate={{ 
                              opacity: 0, 
                              y: "-10vh",
                              x: `${Math.random() * 100}vw`,
                              rotate: Math.random() * 360
                            }}
                            transition={{ 
                              duration: Math.random() * 3 + 2, 
                              ease: "easeOut",
                              delay: Math.random() * 0.5 
                            }}
                            className="absolute bottom-0"
                          >
                            <Heart className="text-brand-400 w-8 h-8" fill="currentColor" />
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mb-10 inline-block"
                      >
                        <Heart className="w-32 h-32 text-brand-500 drop-shadow-[0_0_60px_rgba(139,92,246,0.9)]" fill="currentColor" />
                      </motion.div>
                      <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
                        You just made me the happiest person alive.
                      </h2>
                      <p className="text-2xl text-brand-300 italic mb-8">
                        I love you so much.
                      </p>

                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        onClick={() => {
                          setCountdown(5);
                          setAcceptedStep('countdown');
                        }}
                        className="px-6 py-3 bg-brand-600/50 border border-brand-400/30 rounded-full text-white font-medium hover:bg-brand-500/80 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] text-sm"
                      >
                        Watch Our Surprise 💜
                      </motion.button>
                    </motion.div>
                  )}

                  {acceptedStep === 'countdown' && (
                    <motion.div
                      key="countdown"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-center z-10 w-full max-w-xl flex flex-col items-center justify-center py-20"
                    >
                      <h3 className="text-2xl md:text-3xl font-light text-brand-200 tracking-wider mb-8 uppercase drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] font-sans">
                        THIS IS JUST THE BEGINNING
                      </h3>
                      
                      <motion.div
                        key={countdown}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="text-8xl md:text-9xl font-bold font-mono text-white drop-shadow-[0_0_50px_rgba(139,92,246,0.8)] filter blur-[0.5px]"
                      >
                        {countdown}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Fullscreen Video Portal/Overlay (Always in DOM to unlock for iOS/Safari WebKit) */}
        <div 
          className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-all duration-500 ${
            acceptedStep === 'video' ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
          }`}
        >
          <video
            ref={videoRef}
            src="/thevideo.MP4"
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onEnded={() => setVideoPlaying(false)}
          />
          
          {/* Video Custom Controls */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-brand-500/20 shadow-2xl z-50">
            <button
              onClick={() => {
                if (videoRef.current) {
                  if (videoPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play().catch(err => console.log(err));
                  }
                }
              }}
              className="p-3 bg-brand-500/20 hover:bg-brand-500/40 border border-brand-500/30 rounded-xl text-white transition-colors"
              title={videoPlaying ? "Pause" : "Play"}
            >
              {videoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(err => console.log(err));
                  setVideoPlaying(true);
                }
              }}
              className="p-3 bg-brand-500/20 hover:bg-brand-500/40 border border-brand-500/30 rounded-xl text-white transition-colors flex items-center gap-2"
              title="Restart"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="hidden sm:inline text-sm font-medium">Restart</span>
            </button>
            
            <div className="h-6 w-[1px] bg-brand-500/30"></div>
            
            <button
              onClick={() => {
                setAcceptedStep('success');
              }}
              className="p-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl text-white transition-colors flex items-center gap-2"
              title="Exit Video"
            >
              <X className="w-6 h-6" />
              <span className="hidden sm:inline text-sm font-medium">Exit</span>
            </button>
          </div>
        </div>

        {/* Background preloading for all slideshow and transition videos to make them load instantly */}
        <div className="hidden" aria-hidden="true">
          {memories.map((m) => (
            (m.image.toLowerCase().endsWith('.mp4') || m.image.toLowerCase().endsWith('.mov')) && (
              <video key={`preload-${m.id}`} src={m.image} preload="auto" muted playsInline />
            )
          ))}
          <video src="/thevideo.MP4" preload="auto" muted playsInline />
        </div>
      </main>
    </div>
  );
}

export default App;
