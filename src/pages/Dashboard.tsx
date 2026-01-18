import { motion } from "framer-motion";
import { 
  FileText, 
  Mic2, 
  Video, 
  TrendingUp, 
  Play, 
  Sparkles,
  Wand2,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductionCapabilities from "@/components/dashboard/ProductionCapabilities";
import CastGrid from "@/components/dashboard/CastGrid";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-mayza-gold/10 via-transparent to-mayza-purple/10" />
        <div className="container relative py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 rounded-2xl gradient-gold glow-gold">
              <Sparkles className="w-8 h-8 text-background" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient-gold">MAYZA</h1>
              <p className="text-muted-foreground">God-Tier AI Production Engine</p>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mb-8"
          >
            Advanced script generation, voice cloning, video synthesis, and viral marketing — all running locally with zero external API costs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <Link to="/studio">
              <Button size="lg" className="gradient-gold text-background font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Launch Studio
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-mayza-purple/50 text-mayza-purple hover:bg-mayza-purple/10">
              <Wand2 className="w-5 h-5 mr-2" />
              Quick Generate
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="container py-12 space-y-12">
        {/* Production Capabilities */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold mb-6 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-mayza-purple/20">
              <Wand2 className="w-5 h-5 text-mayza-purple" />
            </div>
            Production Capabilities
          </motion.h2>
          <ProductionCapabilities />
        </section>

        {/* Cast Members */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold mb-6 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-mayza-rose/20">
              <Users className="w-5 h-5 text-mayza-rose" />
            </div>
            Say Wallahi Cast
          </motion.h2>
          <CastGrid />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: FileText, label: "Scripts Generated", value: "127", color: "mayza-gold" },
            { icon: Mic2, label: "Voice Models", value: "8", color: "mayza-purple" },
            { icon: Video, label: "Videos Rendered", value: "45", color: "mayza-cyan" },
            { icon: TrendingUp, label: "Viral Score", value: "94%", color: "mayza-rose" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="glass hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}/20`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
