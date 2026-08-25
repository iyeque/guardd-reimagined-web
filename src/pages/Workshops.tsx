import { motion } from "framer-motion";
import { workshops } from "@/data/workshops";
import { WorkshopCard } from "@/components/workshops/WorkshopCard";

export const Workshops = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span>🧠</span>
            <span>Interactive Learning</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-800 dark:text-white">
            Family <span className="gradient-text">Workshops</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: "Workshops", value: String(workshops.length), icon: "🎯" },
            { label: "Modules", value: "15+", icon: "📚" },
            { label: "Minutes", value: "75", icon: "⏱️" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
          ))}
        </div>

        <motion.div
          className="mt-20 text-center p-8 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
            Complete all workshops to earn your badge!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Track your family's progress and celebrate milestones together.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
