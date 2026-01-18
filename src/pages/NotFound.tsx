import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gradient-gold">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <Link to="/">
          <Button className="gradient-gold text-background">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
