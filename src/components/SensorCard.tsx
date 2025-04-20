
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/utils/mockData";
import { Thermometer, Droplet, Rss } from "lucide-react";

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const formatLastUpdated = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: 'online' | 'offline' | 'warning'): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-lora hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{sensor.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                sensor.status
              )} animate-pulse-slow`}
            ></div>
            <span className="text-xs text-muted-foreground capitalize">
              {sensor.status}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{sensor.location}</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex flex-col items-center p-2 rounded-md bg-sensor-temp bg-opacity-10">
            <Thermometer className="h-5 w-5 text-sensor-temp mb-1" />
            <span className="text-lg font-medium">{sensor.temperature}°C</span>
            <span className="text-xs text-muted-foreground">Température</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-md bg-sensor-humidity bg-opacity-10">
            <Droplet className="h-5 w-5 text-sensor-humidity mb-1" />
            <span className="text-lg font-medium">{sensor.humidity}%</span>
            <span className="text-xs text-muted-foreground">Humidité</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-md bg-sensor-rssi bg-opacity-10">
            <Rss className="h-5 w-5 text-sensor-rssi mb-1" />
            <span className="text-lg font-medium">{sensor.rssi} dBm</span>
            <span className="text-xs text-muted-foreground">RSSI</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-right text-muted-foreground">
          Dernière mise à jour: {formatLastUpdated(sensor.lastUpdated)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorCard;
