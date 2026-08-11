import React, { useState } from 'react';
import { X, Sparkles, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface AIHelperModalProps {
  isOpen: boolean;
  draftText: string;
  jenisSuratCode: string;
  destination: string;
  onClose: () => void;
  onApply: (suggested: string) => void;
}

export const AIHelperModal: React.FC<AIHelperModalProps> = ({
  isOpen,
  draftText,
  jenisSuratCode,
  destination,
  onClose,
  onApply
}) => {
  const [inputDraft, setInputDraft] = useState(draftText);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [formalSummary, setFormalSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!inputDraft.trim()) {
      setErrorMsg('Mohon isi draf perihal yang ingin disempurnakan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/suggest-perihal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftText: inputDraft,
          jenisSuratCode,
          destination
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuggestedTitle(data.suggestedTitle);
        setFormalSummary(data.formalSummary);
      } else {
        setErrorMsg(data.message || 'Gagal memproses draf perihal.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi ke layanan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Asisten AI Perihal Surat (Gemini)</h3>
              <p className="text-xs text-slate-400">Penyempurnaan Bahasa & Tata Format Resmi UGM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Draf Teks Utama Perihal:
            </label>
            <textarea
              rows={3}
              value={inputDraft}
              onChange={(e) => setInputDraft(e.target.value)}
              placeholder="Contoh: minta narasumber workshop mutu dan akreditasi rsud..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Konteks: <span className="font-bold text-slate-700">{jenisSuratCode}</span> | Kepada: <span className="font-bold text-slate-700">{destination || 'Mitra'}</span>
            </span>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Memproses AI...' : 'Proses Penyempurnaan'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Result Card */}
          {suggestedTitle && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Rekomendasi Perihal Baku UGM:</span>
              </div>

              <div className="text-sm font-bold text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                {suggestedTitle}
              </div>

              {formalSummary && (
                <div className="text-xs text-slate-600 italic">
                  "<span className="font-medium text-slate-700">{formalSummary}</span>"
                </div>
              )}

              <button
                onClick={() => {
                  onApply(suggestedTitle);
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Hasil AI Ini dalam Form</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
