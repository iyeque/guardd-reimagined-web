import { motion, AnimatePresence } from 'framer-motion';
import { useState, FC, memo } from 'react';
import { Scroll, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FamilySignatureProps {
  familyName: string;
  onComplete: (signatures: { parent: string; child: string }) => void;
  onDownload: () => void;
}

export const FamilySignature: FC<FamilySignatureProps> = memo(({ familyName, onComplete, onDownload }) => {
  const [signatures, setSignatures] = useState({ parent: '', child: '' });
  const [isSealed, setIsSealed] = useState(false);

  const handleSeal = () => {
    setIsSealed(true);
    // Give it a moment for the animation before finalizing
    setTimeout(() => {
      onComplete(signatures);
    }, 2000);
  };

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-32 h-32 mx-auto mb-8 rounded-[2.5rem] bg-gradient-to-br from-teal-400 to-rose-400 flex items-center justify-center text-6xl shadow-2xl relative"
      >
        <Scroll className="w-16 h-16 text-white" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      <h2 className="text-4xl font-black mb-4 text-foreground tracking-tight">
        Make It Official
      </h2>
      <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto font-medium">
        Sign your family agreement to activate your digital wellness commitment for <strong>{familyName || 'the family'}</strong>.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
        {[
          { id: 'parent', label: 'Parent/Caregiver', placeholder: 'Parent name...' },
          { id: 'child', label: 'Child', placeholder: 'Child name...' }
        ].map((role) => (
          <motion.div
            key={role.id}
            className="p-8 rounded-[2rem] bg-white/40 dark:bg-black/40 backdrop-blur-md border-2 border-dashed border-slate-300 dark:border-slate-700 transition-colors hover:border-teal-400 dark:hover:border-teal-500 group"
            whileHover={{ y: -5 }}
          >
            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 group-hover:text-teal-500 transition-colors text-left ml-1">
              {role.label} Signature
            </label>
            <input
              type="text"
              placeholder={role.placeholder}
              value={signatures[role.id as keyof typeof signatures]}
              className="w-full bg-transparent text-3xl font-black border-b-4 border-slate-200 dark:border-slate-800 focus:border-teal-400 dark:focus:border-teal-500 outline-none py-3 text-foreground transition-all italic tracking-tighter"
              onChange={(e) => setSignatures(prev => ({
                ...prev,
                [role.id]: e.target.value
              }))}
            />
          </motion.div>
        ))}
      </div>

      <motion.button
        className="px-16 py-6 bg-gradient-to-r from-teal-500 to-rose-500 text-white font-black rounded-3xl text-xl shadow-2xl disabled:opacity-30 disabled:grayscale transition-all"
        disabled={!signatures.parent || !signatures.child || isSealed}
        whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(20, 184, 166, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSeal}
      >
        {isSealed ? 'SEALING AGREEMENT...' : 'Seal Our Agreement ✨'}
      </motion.button>

      {/* Celebration animation when sealed */}
      <AnimatePresence>
        {isSealed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Confetti burst simplified */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#4FD1C5', '#FF9A8B', '#B794F4', '#F6E05E'][i % 4],
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 1000,
                  y: (Math.random() - 0.5) * 800,
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 2, ease: "circOut" }}
              />
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] max-w-md text-center shadow-[0_0_100px_rgba(0,0,0,0.2)] border-4 border-teal-400 pointer-events-auto"
            >
              <div className="text-8xl mb-6">🤝</div>
              <h3 className="text-4xl font-black mb-4 text-foreground tracking-tighter uppercase">
                Agreement Sealed!
              </h3>
              <p className="text-muted-foreground text-lg mb-10 font-medium leading-relaxed">
                Congratulations! Your family is now committed to digital wellness together.
              </p>
              <Button 
                onClick={onDownload}
                className="w-full h-16 bg-teal-500 hover:bg-teal-600 text-white font-black text-xl rounded-2xl gap-3"
              >
                <Download className="w-6 h-6" /> Export & Save as PDF
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

FamilySignature.displayName = 'FamilySignature';
