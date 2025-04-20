import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SensorCard from "@/components/SensorCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getSensorData } from "@/services/sensorService";
import type { SensorData } from "@/services/sensorService";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Redirection si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fonction pour rafraîchir les données des capteurs
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await getSensorData();
      setSensors(data);
      setLastRefreshed(new Date());
      
      toast({
        title: "Données actualisées",
        description: "Les données des capteurs ont été mises à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial et rafraîchissement automatique
  useEffect(() => {
    if (isAuthenticated) {
      handleRefresh();
      const interval = setInterval(handleRefresh, 2 * 60 * 1000); // 2 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Format de date pour afficher le moment du dernier rafraîchissement
  const formatLastRefreshed = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec la barre de navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-lora">LoRa Sensor View</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-500">Bonjour, <span className="font-medium text-gray-900">{user?.firstName}</span></p>
              </div>
              <Button variant="outline" onClick={logout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tableau de bord</h2>
            <p className="text-sm text-gray-500">
              Dernière actualisation : {formatLastRefreshed(lastRefreshed)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Actualisation..." : "Actualiser"}
          </Button>
        </div>

        {/* Grille des capteurs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
