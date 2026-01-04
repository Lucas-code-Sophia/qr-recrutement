import React, { useState, useRef } from 'react';
import { generateFlyerBackground } from '../services/geminiService';
import { FlyerConfig } from '../types';
import { Loader2, Download, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const FlyerGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('Un intérieur de restaurant italien confortable et chaleureux avec des lumières bokeh');
  const [config, setConfig] = useState<FlyerConfig>({
    headline: "NOUS RECRUTONS",
    subtext: "Rejoignez notre équipe passionnée. Scannez pour postuler !",
    accentColor: "#145A8B", // Primary Blue
    backgroundImage: "https://picsum.photos/800/800"
  });
  
  const flyerRef = useRef<HTMLDivElement>(null);

  // Use current window URL for QR code, pointing to the application form
  const applicationUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}#/apply`;
  // Correction: Utilisation de codes HEX valides (FFFFFF pour blanc, 000000 pour noir)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(applicationUrl)}&bgcolor=FFFFFF&color=000000&margin=10`;

  const handleGenerateBackground = async () => {
    setLoading(true);
    const bgImage = await generateFlyerBackground(prompt);
    if (bgImage) {
      setConfig(prev => ({ ...prev, backgroundImage: bgImage }));
    }
    setLoading(false);
  };

  const downloadFlyer = async () => {
    if (!flyerRef.current) return;
    try {
      const canvas = await html2canvas(flyerRef.current, { useCORS: true });
      const link = document.createElement('a');
      link.download = 'affiche-recrutement.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Failed to download flyer", err);
      alert("Impossible de télécharger l'image. Essayez de faire un clic droit et d'enregistrer.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls */}
      <div className="w-full lg:w-1/3 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-[#145A8B]/20 h-fit">
        <div>
          <h2 className="text-xl font-bold text-[#061E3E] mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Créez votre Flyer
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Personnalisez le texte et générez un arrière-plan IA unique pour votre affiche de recrutement.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#061E3E] mb-1">Titre</label>
            <input 
              type="text" 
              value={config.headline}
              onChange={(e) => setConfig({...config, headline: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A8B] focus:border-[#145A8B] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#061E3E] mb-1">Sous-texte</label>
            <textarea 
              value={config.subtext}
              onChange={(e) => setConfig({...config, subtext: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A8B] focus:border-[#145A8B] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#061E3E] mb-1">Couleur d'accent</label>
            <div className="flex gap-2">
              {['#145A8B', '#061E3E', '#f97316', '#ef4444', '#10b981', '#000000'].map(color => (
                <button
                  key={color}
                  onClick={() => setConfig({...config, accentColor: color})}
                  className={`w-8 h-8 rounded-full border-2 ${config.accentColor === color ? 'border-[#061E3E] scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-[#061E3E] mb-2">Générateur d'arrière-plan IA</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A8B] outline-none"
                placeholder="Décrivez l'arrière-plan..."
              />
            </div>
            <button 
              onClick={handleGenerateBackground}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#145A8B] hover:bg-[#061E3E] text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Générer un nouveau fond
            </button>
          </div>
        </div>

        <button 
          onClick={downloadFlyer}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#061E3E] hover:bg-[#145A8B] text-white py-3 rounded-lg transition-colors font-medium shadow-lg"
        >
          <Download className="w-4 h-4" />
          Télécharger l'affiche
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex justify-center items-start p-4 bg-[#DAF6FC] rounded-xl border border-[#145A8B]/20 overflow-hidden">
        <div 
          ref={flyerRef}
          className="relative w-[500px] h-[700px] bg-white shadow-2xl flex flex-col items-center text-center overflow-hidden flex-shrink-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {config.backgroundImage && (
              <img 
                src={config.backgroundImage} 
                alt="Background" 
                className="w-full h-full object-cover opacity-90"
                crossOrigin="anonymous"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col h-full w-full p-10 justify-between">
            <div className="mt-8 space-y-2">
              <h1 
                className="text-6xl font-black text-white drop-shadow-lg tracking-tight uppercase leading-none"
                style={{ textShadow: `4px 4px 0px ${config.accentColor}` }}
              >
                {config.headline}
              </h1>
              <div className="w-24 h-2 mx-auto rounded-full" style={{ backgroundColor: config.accentColor }}></div>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <p className="text-xl text-white font-medium drop-shadow-md max-w-sm">
                {config.subtext}
              </p>
              
              <div className="p-4 bg-white rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                <p className="text-xs text-gray-500 font-mono mt-2 uppercase tracking-widest">Scannez pour postuler</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerGenerator;