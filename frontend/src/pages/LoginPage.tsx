import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/api";
import { appConfig } from "@/lib/config";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  if (appConfig.clerkPublishableKey) {
    return (
      <AuthShell
        title="Welcome back"
        description="Sign in to your care dashboard"
        footer={(
          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        )}
      >
        <ClerkLoading>
          <div className="h-[520px] animate-pulse rounded-xl bg-secondary" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignIn path="/login" routing="path" signUpUrl="/register" fallbackRedirectUrl="/dashboard" />
        </ClerkLoaded>
      </AuthShell>
    );
  }

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
    <AuthShell
      title="Welcome back"
      description="Sign in to your care dashboard"
      footer={(
        <>
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
        </>
      )}
    >
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
    </AuthShell>
  );
}
