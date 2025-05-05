import { MapPinIcon, TicketIcon, CompassIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export interface TravelInsight {
  id: number;
  title: string;
  description: string;
  type: 'destination' | 'tour' | 'tip';
  category: string;
  relevanceScore: number;
  imageUrl: string;
}

interface TravelInsightCardProps {
  insight: TravelInsight;
  onClick?: () => void;
}

export function TravelInsightCard({ insight, onClick }: TravelInsightCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex space-x-4">
      <div className="relative w-32 h-24 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={insight.imageUrl} 
          alt={insight.title} 
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
          }}
        />
        <Badge 
          className="absolute top-2 left-2" 
          variant={insight.type === 'tip' ? 'outline' : 'default'}
        >
          {insight.type === 'destination' ? (
            <MapPinIcon className="h-3 w-3 mr-1" />
          ) : insight.type === 'tour' ? (
            <TicketIcon className="h-3 w-3 mr-1" />
          ) : (
            <CompassIcon className="h-3 w-3 mr-1" />
          )}
          {insight.type}
        </Badge>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{insight.title}</h3>
          <Badge variant="outline" className="text-xs">
            {insight.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {insight.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-sm">
            <TrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-600">{insight.relevanceScore}% {t("userDashboard.relevance")}</span>
          </div>
          <Button variant="link" size="sm" className="p-0" onClick={onClick}>
            {t("userDashboard.learnMore")} →
          </Button>
        </div>
      </div>
    </div>
  );
}