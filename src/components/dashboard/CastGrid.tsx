import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const cast = [
  {
    name: "Lucky",
    role: "The Architect",
    tagline: "Calm until it cuts like glass",
    voiceStyle: "Commanding, visionary",
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "Luul",
    role: "The Legacy Queen",
    tagline: "Fire wrapped in velvet",
    voiceStyle: "Regal, grounded",
    color: "from-purple-500 to-violet-600"
  },
  {
    name: "Amal",
    role: "The Glam Villain",
    tagline: "Stylish, mocking, unforgettable",
    voiceStyle: "Venomous, fast pivots",
    color: "from-rose-500 to-pink-600"
  },
  {
    name: "Zahra",
    role: "The Satirist",
    tagline: "Humor weaponized as law",
    voiceStyle: "Witty, courtroom-sharp",
    color: "from-emerald-500 to-teal-600"
  },
  {
    name: "Nasra",
    role: "The Emotional Magnet",
    tagline: "Fragile but magnetic",
    voiceStyle: "Soft, trembling",
    color: "from-blue-500 to-indigo-600"
  },
  {
    name: "Hani",
    role: "The Trauma Mapper",
    tagline: "Quiet, prophetic, foreshadowing",
    voiceStyle: "Haunting, empathetic",
    color: "from-slate-500 to-gray-600"
  },
  {
    name: "Ayaan",
    role: "The Schema Poet",
    tagline: "Meta, haunting, robotic poetry",
    voiceStyle: "Poetic, detached",
    color: "from-cyan-500 to-sky-600"
  }
];

const CastGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cast.map((member, index) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass overflow-hidden group hover:border-primary/30 transition-all">
            <div className={`h-2 bg-gradient-to-r ${member.color}`} />
            <CardContent className="pt-4">
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className={`text-sm font-medium bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                {member.role}
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                "{member.tagline}"
              </p>
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Voice:</span> {member.voiceStyle}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CastGrid;
