
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplet, Rss } from "lucide-react";
import type { SensorData } from "@/services/sensorService";

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const formatLastUpdated = (dateStr: string): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const getStatusColor = (rssi: number): string => {
    if (rssi > -70) return 'bg-green-500';
    if (rssi > -90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-lora hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Capteur {sensor.id}</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                sensor.rssi
              )} animate-pulse-slow`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {sensor.rssi > -70 ? 'online' : sensor.rssi > -90 ? 'warning' : 'offline'}
            </span>
          </div>
        </div>
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
          Dernière mise à jour: {formatLastUpdated(sensor.last_updated)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorCard;
