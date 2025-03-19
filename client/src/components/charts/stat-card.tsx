import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  changeType?: "increase" | "decrease" | "neutral";
  changeValue?: string;
  changeText?: string;
  className?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  changeType = "neutral",
  changeValue,
  changeText,
  className
}: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <span className="text-primary">{icon}</span>
        </div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        {(changeValue || changeText) && (
          <div className="flex items-center mt-2 text-sm">
            {changeValue && (
              <span
                className={cn(
                  "font-medium flex items-center",
                  changeType === "increase" && "text-green-600",
                  changeType === "decrease" && "text-red-600",
                  changeType === "neutral" && "text-gray-600"
                )}
              >
                {changeType === "increase" && <ArrowUp className="mr-1 h-3 w-3" />}
                {changeType === "decrease" && <ArrowDown className="mr-1 h-3 w-3" />}
                {changeValue}
              </span>
            )}
            {changeText && <span className="text-gray-500 ml-2">{changeText}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
