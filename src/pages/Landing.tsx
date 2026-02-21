import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Music, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TRANSLATIONS = {
  en: {
    badge: "AI-Powered Music Fortune Telling",
    titlePart1: "Your Music",
    titlePart2: "Speaks",
    titlePart3: "We Listen.",
    description: "Connect your Spotify to discover your \"Music Fortune\" (Müzik Falı) and visualize your listening DNA with our AI-powered analysis.",
    ctaConnect: "Connect Spotify",
    ctaSample: "View Sample",
    features: {
      fortune: {
        title: "Mystic Fortune",
        desc: "Our AI reads your listening habits like coffee grounds to predict your emotional future."
      },
      analysis: {
        title: "Deep Analysis",
        desc: "Visualize your genre distribution, time-of-day patterns, and device habits."
      },
      share: {
        title: "Shareable Stories",
        desc: "Generate beautiful Instagram Stories and WhatsApp cards to share your vibe."
      }
    }
  },
  tr: {
    badge: "Yapay Zeka Destekli Müzik Falı",
    titlePart1: "Müziğin",
    titlePart2: "Konuşuyor",
    titlePart3: "Biz Dinliyoruz.",
    description: "Spotify hesabını bağla, kişisel \"Müzik Falını\" öğren ve yapay zeka destekli analizlerle müzik DNA'nı keşfet.",
    ctaConnect: "Spotify ile Bağlan",
    ctaSample: "Örnek Gör",
    features: {
      fortune: {
        title: "Mistik Fal",
        desc: "Yapay zekamız dinleme alışkanlıklarını kahve telvesi gibi okuyarak duygusal geleceğini tahmin eder."
      },
      analysis: {
        title: "Derin Analiz",
        desc: "Tür dağılımını, günün saatlerine göre dinleme alışkanlıklarını ve cihaz kullanımını görselleştir."
      },
      share: {
        title: "Paylaşılabilir Hikayeler",
        desc: "Vibe'ını paylaşmak için harika Instagram Hikayeleri ve WhatsApp kartları oluştur."
      }
    }
  },
  de: {
    badge: "KI-gestützte Musik-Wahrsagerei",
    titlePart1: "Deine Musik",
    titlePart2: "Spricht",
    titlePart3: "Wir hören zu.",
    description: "Verbinde dein Spotify, um dein \"Musik-Orakel\" zu entdecken und deine Hör-DNA mit unserer KI-Analyse zu visualisieren.",
    ctaConnect: "Spotify Verbinden",
    ctaSample: "Beispiel Ansehen",
    features: {
      fortune: {
        title: "Mystisches Orakel",
        desc: "Unsere KI liest deine Hörgewohnheiten wie Kaffeesatz, um deine emotionale Zukunft vorherzusagen."
      },
      analysis: {
        title: "Tiefe Analyse",
        desc: "Visualisiere deine Genre-Verteilung, Tageszeit-Muster und Gerätegewohnheiten."
      },
      share: {
        title: "Teilbare Stories",
        desc: "Erstelle wunderschöne Instagram Stories und WhatsApp-Karten, um deinen Vibe zu teilen."
      }
    }
  },
  ru: {
    badge: "Музыкальное гадание на ИИ",
    titlePart1: "Твоя музыка",
    titlePart2: "Говорит",
    titlePart3: "Мы слушаем.",
    description: "Подключи Spotify, чтобы узнать свое «Музыкальное предсказание» и визуализировать свою музыкальную ДНК с помощью нашего ИИ.",
    ctaConnect: "Подключить Spotify",
    ctaSample: "Посмотреть пример",
    features: {
      fortune: {
        title: "Мистическое гадание",
        desc: "Наш ИИ читает твои музыкальные привычки, как кофейную гущу, предсказывая твое эмоциональное будущее."
      },
      analysis: {
        title: "Глубокий анализ",
        desc: "Визуализируй распределение жанров, паттерны прослушивания по времени суток и использование устройств."
      },
      share: {
        title: "Истории для соцсетей",
        desc: "Создавай красивые истории для Instagram и карточки для WhatsApp, чтобы поделиться своим вайбом."
      }
    }
  }
};

export default function Landing() {
  const [lang, setLang] = useState<'en' | 'tr' | 'de' | 'ru'>('tr'); // Default to TR as requested implicitly by context
  const t = TRANSLATIONS[lang];

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#7C3AED] opacity-20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Language Switcher */}
      <div className="absolute top-24 right-4 z-10 flex gap-2">
        {(['tr', 'en', 'de', 'ru'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              lang === l 
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-[#A855F7] mb-6">
            <Sparkles className="w-3 h-3" />
            <span>{t.badge}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            {t.titlePart1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]">{t.titlePart2}</span>.
            <br />
            {t.titlePart3}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="musicifal" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" asChild>
              <Link to="/analyze?provider=spotify">
                {t.ctaConnect} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto bg-transparent border-white/20 hover:bg-white/5 text-white" asChild>
              <Link to="/analyze?provider=youtube">
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-red-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                  YouTube Music
                </span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white/5 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-[#D97706]" />}
              title={t.features.fortune.title}
              description={t.features.fortune.desc}
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-[#7C3AED]" />}
              title={t.features.analysis.title}
              description={t.features.analysis.desc}
            />
            <FeatureCard 
              icon={<Music className="w-8 h-8 text-[#10B981]" />}
              title={t.features.share.title}
              description={t.features.share.desc}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-[#1A1535] border border-white/5 hover:border-[#7C3AED]/30 transition-colors"
    >
      <div className="mb-6 p-3 bg-white/5 rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
