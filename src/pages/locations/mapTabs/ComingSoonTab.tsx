import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonTabProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function ComingSoonTab({ icon: Icon, title, description }: ComingSoonTabProps) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{description}</p>
      <Button variant="outline" size="sm" className="mt-5 gap-1.5">
        Request Feature
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}