import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MusicAnalysis, FortuneResult } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Share2, Lock, Unlock, Sparkles, Sun, Moon, Smartphone, Laptop, Speaker, Volume2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureGating } from '@/hooks/useFeatureGating';

const COLORS = ['#7C3AED', '#A855F7', '#C084FC', '#E9D5FF', '#F3E8FF'];

export default function Wrapped() {
  const [data, setData] = useState<MusicAnalysis | null>(null);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const navigate = useNavigate();
  const { canSeeFullFortune, isFree } = useFeatureGating();

  const [language, setLanguage] = useState<'tr' | 'en' | 'de' | 'ru'>('en');

  useEffect(() => {
    const storedData = localStorage.getItem('musicifal_analysis');
    const storedFortune = localStorage.getItem('musicifal_fortune');

    if (storedData && storedFortune) {
      setData(JSON.parse(storedData));
      setFortune(JSON.parse(storedFortune));
    } else {
      // If no data, redirect to analyze
      navigate('/analyze');
    }
  }, [navigate]);

  if (!data || !fortune) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] p-1 shrink-0">
            <img src={data.topArtists[0]?.images?.[0]?.url || "https://picsum.photos/200"} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[#0D0B1E]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Music DNA</h1>
            <p className="text-gray-400 text-sm md:text-base">Last 14 Days • {data.dominantMood} Vibe</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto justify-center">
           <Button variant="outline" className="gap-2 w-full md:w-auto">
            <Share2 className="w-4 h-4" /> Share Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Genre Chart */}
        <Card className="bg-[#1A1535] border-white/10 col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topGenres}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                  >
                    {data.topGenres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D0B1E', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {data.topGenres.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {g.name} ({g.percentage}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Artists */}
        <Card className="bg-[#1A1535] border-white/10 col-span-1 md:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle>Top Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.topArtists.slice(0, 8).map((artist, i) => (
                <div key={artist.id} className="flex flex-col items-center text-center group">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mb-3 shrink-0">
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center text-xs font-bold text-white z-10 border border-[#0D0B1E]">
                      #{i + 1}
                    </div>
                    <img 
                      src={artist.images?.[0]?.url} 
                      alt={artist.name} 
                      className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300 border-2 border-white/5 group-hover:border-[#7C3AED]" 
                    />
                  </div>
                  <span className="font-medium text-sm truncate w-full px-2">{artist.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time of Day Analysis */}
        <Card className="bg-[#1A1535] border-white/10 col-span-1 md:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>Rhythm of Your Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.timePatterns.map((time) => (
                <div key={time.label} className="bg-white/5 rounded-xl p-4 flex flex-col items-center text-center border border-white/5">
                  <div className="mb-3 p-2 bg-white/5 rounded-full">
                    {time.label === 'Morning' && <Sun className="w-5 h-5 text-yellow-400" />}
                    {time.label === 'Afternoon' && <Sun className="w-5 h-5 text-orange-500" />}
                    {time.label === 'Evening' && <Moon className="w-5 h-5 text-indigo-400" />}
                    {time.label === 'Night' && <Moon className="w-5 h-5 text-purple-500" />}
                  </div>
                  <span className="text-sm font-medium text-gray-400">{time.label}</span>
                  <span className="text-lg font-bold text-white mt-1">{time.dominantGenre}</span>
                  <span className="text-xs text-gray-500 mt-1">{time.percentage}% of listening</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device & Volume Analysis */}
        <Card className="bg-[#1A1535] border-white/10 col-span-1 md:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>How You Listen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Device Usage Bar Chart */}
              <div className="h-[250px] w-full">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Device Usage</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.deviceBehavior} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="type" type="category" width={70} tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0D0B1E', borderColor: '#333', borderRadius: '8px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="usagePercentage" radius={[0, 4, 4, 0]}>
                      {data.deviceBehavior.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Volume & Genre Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Volume Intensity</h4>
                {data.deviceBehavior.map((device) => (
                  <div key={device.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      {device.type === 'Phone' && <Smartphone className="w-5 h-5 text-gray-400" />}
                      {device.type === 'Computer' && <Laptop className="w-5 h-5 text-gray-400" />}
                      {device.type === 'Speaker' && <Speaker className="w-5 h-5 text-gray-400" />}
                      <div>
                        <div className="font-medium text-sm">{device.type}</div>
                        <div className="text-xs text-gray-500">Top: {device.topGenre}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${device.avgVolume > 80 ? 'text-red-400' : device.avgVolume > 50 ? 'text-yellow-400' : 'text-green-400'}`} />
                      <div className="w-16 md:w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${device.avgVolume > 80 ? 'bg-red-500' : device.avgVolume > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                          style={{ width: `${device.avgVolume}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{device.avgVolume}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repeated Songs */}
        <div className="col-span-1 md:col-span-3">
          <h2 className="text-2xl font-bold mb-6">On Repeat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.repeatedSongs.map((song, i) => (
              <motion.div 
                key={song.track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4] w-full"
              >
                <img 
                  src={song.track.album.images[0].url} 
                  alt={song.track.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1E] via-[#0D0B1E]/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[#7C3AED] font-bold text-lg mb-1">{song.count} Repeats</div>
                  <h3 className="text-xl font-bold leading-tight mb-1 line-clamp-2">{song.track.name}</h3>
                  <p className="text-gray-300 text-sm line-clamp-1">{song.track.artists[0].name}</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400 italic">"This song gives you away..."</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fortune Card */}
        <Card className="bg-gradient-to-br from-[#1A1535] to-[#2D2455] border-[#7C3AED]/30 col-span-1 md:col-span-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-[#7C3AED] opacity-10 blur-[100px] rounded-full pointer-events-none" />
          <CardContent className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-sm text-[#A855F7] mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Music Fortune</span>
            </div>
            
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {(['tr', 'en', 'de', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    language === lang 
                      ? 'bg-[#7C3AED] text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className={`text-left max-w-3xl mx-auto space-y-4 mb-8 ${!canSeeFullFortune ? 'mask-image-gradient' : ''}`}>
              <p className="text-lg md:text-xl font-serif italic text-gray-200 leading-relaxed whitespace-pre-line">
                {fortune[language]}
              </p>
              
              {!canSeeFullFortune && (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#2D2455] to-transparent flex items-end justify-center pb-8">
                  {/* Blur overlay handled by gradient */}
                </div>
              )}
            </div>

            {!canSeeFullFortune ? (
              <div className="relative z-10">
                 <Button variant="musicifal" size="lg" className="gap-2 w-full sm:w-auto" asChild>
                  <Link to="/pricing">
                    <Lock className="w-4 h-4" /> Unlock Full Reading
                  </Link>
                </Button>
                <p className="mt-4 text-xs text-gray-500">Available with Starter Plan</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Share2 className="w-4 h-4" /> Share Fortune
                </Button>
                 <Button variant="ghost" className="gap-2 text-[#7C3AED] w-full sm:w-auto">
                  <Unlock className="w-4 h-4" /> Full Reading Unlocked
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
