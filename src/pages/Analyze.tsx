import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MusicAnalysis, FortuneResult } from '@/types';

const SPOTIFY_STEPS = [
  "Connecting to Spotify...",
  "Fetching listening history...",
  "Analyzing genre patterns...",
  "Detecting mood shifts...",
  "Consulting the oracle...",
  "Generating your fortune..."
];

const YOUTUBE_STEPS = [
  "Connecting to YouTube Music...",
  "Scanning liked videos...",
  "Analyzing playlists...",
  "Detecting mood shifts...",
  "Consulting the oracle...",
  "Generating your fortune..."
];

// --- MOCK DATA ---
const MOCK_ANALYSIS: MusicAnalysis = {
  userId: 'mock-user-123',
  dateRange: { start: '2023-10-01', end: '2023-10-14' },
  dominantMood: 'Introspective',
  topGenres: [
    { name: 'Indie Pop', percentage: 35, mood: 'Introspective' },
    { name: 'Lo-fi', percentage: 25, mood: 'Calm' },
    { name: 'Rock', percentage: 20, mood: 'Energetic' },
    { name: 'Jazz', percentage: 15, mood: 'Classy' },
    { name: 'Other', percentage: 5, mood: 'Mixed' },
  ],
  topArtists: [
    { id: '1', name: 'Arctic Monkeys', images: [{ url: 'https://picsum.photos/200', height: 200, width: 200 }] },
    { id: '2', name: 'Tame Impala', images: [{ url: 'https://picsum.photos/201', height: 200, width: 200 }] },
    { id: '3', name: 'The Strokes', images: [{ url: 'https://picsum.photos/202', height: 200, width: 200 }] },
    { id: '4', name: 'Glass Animals', images: [{ url: 'https://picsum.photos/203', height: 200, width: 200 }] },
    { id: '5', name: 'Lana Del Rey', images: [{ url: 'https://picsum.photos/204', height: 200, width: 200 }] },
    { id: '6', name: 'The Weeknd', images: [{ url: 'https://picsum.photos/205', height: 200, width: 200 }] },
    { id: '7', name: 'Daft Punk', images: [{ url: 'https://picsum.photos/206', height: 200, width: 200 }] },
    { id: '8', name: 'Gorillaz', images: [{ url: 'https://picsum.photos/207', height: 200, width: 200 }] },
  ],
  timePatterns: [
    { label: 'Morning', dominantGenre: 'Lo-fi', percentage: 30 },
    { label: 'Afternoon', dominantGenre: 'Pop', percentage: 40 },
    { label: 'Evening', dominantGenre: 'Indie', percentage: 20 },
    { label: 'Night', dominantGenre: 'Phonk', percentage: 10 },
  ],
  deviceBehavior: [
    { type: 'Phone', topGenre: 'Phonk', avgVolume: 85, usagePercentage: 60 },
    { type: 'Computer', topGenre: 'Lo-fi', avgVolume: 40, usagePercentage: 30 },
    { type: 'Speaker', topGenre: 'Jazz', avgVolume: 65, usagePercentage: 10 },
  ],
  repeatedSongs: [
    { 
      track: { id: 't1', name: 'Do I Wanna Know?', artists: [{ name: 'Arctic Monkeys', id: 'a1' }], album: { name: 'AM', images: [{ url: 'https://picsum.photos/300', height: 300, width: 300 }], release_date: '2013', id: 'al1' }, duration_ms: 0 },
      count: 42 
    },
    { 
      track: { id: 't2', name: 'The Less I Know The Better', artists: [{ name: 'Tame Impala', id: 'a2' }], album: { name: 'Currents', images: [{ url: 'https://picsum.photos/301', height: 300, width: 300 }], release_date: '2015', id: 'al2' }, duration_ms: 0 },
      count: 28 
    },
    { 
      track: { id: 't3', name: 'Heat Waves', artists: [{ name: 'Glass Animals', id: 'a3' }], album: { name: 'Dreamland', images: [{ url: 'https://picsum.photos/302', height: 300, width: 300 }], release_date: '2020', id: 'al3' }, duration_ms: 0 },
      count: 15 
    }
  ]
};

const MOCK_FORTUNE: FortuneResult = {
  en: "Your nights spent with Indie Pop suggest a longing for something that hasn't happened yet. The repetition of 'Do I Wanna Know?' 42 times isn't just a habit; it's a question you're afraid to answer in real life. Your high volume on mobile shows you're trying to drown out the world. A major shift is coming.",
  tr: "Indie Pop ile geçirdiğin geceler, henüz gerçekleşmemiş bir şeye duyduğun özlemi gösteriyor. 'Do I Wanna Know?' şarkısını 42 kez dinlemen sadece bir alışkanlık değil; gerçek hayatta cevaplamaktan korktuğun bir soru. Telefondaki yüksek ses seviyen, dünyayı susturmaya çalıştığını gösteriyor. Büyük bir değişim yaklaşıyor.",
  de: "Deine Nächte mit Indie Pop deuten auf eine Sehnsucht nach etwas hin, das noch nicht geschehen ist. Die 42-malige Wiederholung von 'Do I Wanna Know?' ist nicht nur eine Gewohnheit; es ist eine Frage, die du im echten Leben zu beantworten fürchtest. Deine hohe Lautstärke am Handy zeigt, dass du die Welt übertönen willst. Ein großer Wandel steht bevor.",
  ru: "Твои ночи, проведенные с инди-попом, говорят о тоске по чему-то, что еще не случилось. Повторение 'Do I Wanna Know?' 42 раза — это не просто привычка; это вопрос, на который ты боишься ответить в реальной жизни. Высокая громкость на телефоне показывает, что ты пытаешься заглушить мир. Грядут большие перемены."
};

export default function Analyze() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const provider = searchParams.get('provider') || 'spotify';
  const STEPS = provider === 'youtube' ? YOUTUBE_STEPS : SPOTIFY_STEPS;
  
  // Check for token in URL (fallback from non-popup flow)
  const urlToken = searchParams.get('token');

  useEffect(() => {
    const startAnalysis = async (token?: string) => {
      try {
        // Start animation
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev < STEPS.length - 1) return prev + 1;
            clearInterval(stepInterval);
            return prev;
          });
        }, 800); // Faster for mock demo

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Use Mock Data
        localStorage.setItem('musicifal_analysis', JSON.stringify(MOCK_ANALYSIS));
        localStorage.setItem('musicifal_fortune', JSON.stringify(MOCK_FORTUNE));

        setCurrentStep(STEPS.length); // Complete
        
        setTimeout(() => {
          navigate('/wrapped');
        }, 1000);

      } catch (err) {
        console.error(err);
        setError("Failed to read your fortune. Please try again.");
      }
    };

    // Always start analysis immediately for demo purposes
    // In a real app, we'd wait for auth
    if (currentStep === 0) {
      startAnalysis();
    }

  }, [urlToken, navigate]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1A1535] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7C3AED] blur-xl opacity-50 animate-pulse" />
              <div className="relative w-16 h-16 bg-[#0D0B1E] rounded-full flex items-center justify-center border border-[#7C3AED]">
                <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">Reading your music...</h2>

          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <StepItem 
                key={index} 
                label={step} 
                status={index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'} 
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StepItem({ label, status }: { label: string, status: 'pending' | 'active' | 'completed' }) {
  return (
    <div className={`flex items-center gap-3 transition-colors duration-300 ${status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
      <div className="w-5 h-5 flex items-center justify-center">
        {status === 'completed' ? (
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
        ) : status === 'active' ? (
          <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-ping" />
        ) : (
          <div className="w-2 h-2 bg-gray-600 rounded-full" />
        )}
      </div>
      <span className={`text-sm font-medium ${status === 'active' ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
