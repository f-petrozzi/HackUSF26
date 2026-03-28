import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      navigate(user.onboarded ? "/dashboard" : "/onboarding");
    } catch {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-sidebar-primary" />
          <span className="text-2xl font-bold text-sidebar-primary-foreground tracking-tight">CareMesh</span>
        </div>
        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-sidebar-primary-foreground leading-tight mb-4"
          >
            Adaptive care,
            <br />
            <span className="text-sidebar-primary">powered by empathy.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-sidebar-foreground/70 text-lg leading-relaxed"
          >
            Multi-agent AI that turns your wearable signals into personalized, compassionate support plans.
          </motion.p>
        </div>
        <p className="text-xs text-sidebar-foreground/40">© 2026 CareMesh · HackUSF</p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">CareMesh</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your care dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@caremesh.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign in
              {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 p-3 rounded-lg bg-secondary text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo accounts:</p>
            <p>student@caremesh.demo / demo1234</p>
            <p>admin@caremesh.demo / admin1234</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
