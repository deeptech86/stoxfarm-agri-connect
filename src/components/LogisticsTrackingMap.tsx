import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DeliveryTracking } from '@/types/logistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Package,
  Navigation,
  Star,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface LogisticsTrackingMapProps {
  delivery: DeliveryTracking;
  onClose?: () => void;
}

const LogisticsTrackingMap: React.FC<LogisticsTrackingMapProps> = ({ delivery, onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox_token') || ''
  );
  const [isTokenSet, setIsTokenSet] = useState<boolean>(!!localStorage.getItem('mapbox_token'));
  const [mapError, setMapError] = useState<string | null>(null);

  const handleSetToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setIsTokenSet(true);
      setMapError(null);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [delivery.currentLocation.lng, delivery.currentLocation.lat],
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Origin marker (green)
      const originEl = document.createElement('div');
      originEl.className = 'origin-marker';
      originEl.innerHTML = `
        <div style="background: #22c55e; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>
        </div>
      `;
      new mapboxgl.Marker(originEl)
        .setLngLat([delivery.origin.lng, delivery.origin.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup:</strong><br/>${delivery.origin.address}`))
        .addTo(map.current);

      // Destination marker (red)
      const destEl = document.createElement('div');
      destEl.className = 'dest-marker';
      destEl.innerHTML = `
        <div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="12,2 22,22 12,17 2,22"/></svg>
        </div>
      `;
      new mapboxgl.Marker(destEl)
        .setLngLat([delivery.destination.lng, delivery.destination.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Delivery:</strong><br/>${delivery.destination.address}`))
        .addTo(map.current);

      // Current location marker (truck/driver - blue pulsing)
      const currentEl = document.createElement('div');
      currentEl.className = 'current-marker';
      currentEl.innerHTML = `
        <div style="position: relative;">
          <div style="background: #3b82f6; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 2px 10px rgba(59,130,246,0.5); animation: pulse 2s infinite;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M1 3h15v8H1zM16 8h4l3 4v5h-2a3 3 0 0 1-6 0h-2V8zM5.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        </div>
      `;
      new mapboxgl.Marker(currentEl)
        .setLngLat([delivery.currentLocation.lng, delivery.currentLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${delivery.driver.name}</strong><br/>${delivery.driver.vehicleNumber}`))
        .addTo(map.current);

      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([delivery.origin.lng, delivery.origin.lat]);
      bounds.extend([delivery.destination.lng, delivery.destination.lat]);
      bounds.extend([delivery.currentLocation.lng, delivery.currentLocation.lat]);
      map.current.fitBounds(bounds, { padding: 60 });

      // Draw route line
      map.current.on('load', () => {
        if (!map.current) return;
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [delivery.origin.lng, delivery.origin.lat],
                [delivery.currentLocation.lng, delivery.currentLocation.lat],
                [delivery.destination.lng, delivery.destination.lat],
              ],
            },
          },
        });

        // Completed route (solid)
        map.current.addLayer({
          id: 'route-completed',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
          },
        });
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map. Please check your Mapbox token.');
    }

    return () => {
      map.current?.remove();
    };
  }, [delivery, isTokenSet, mapboxToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Pickup';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (!isTokenSet) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Mapbox Token Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To view the tracking map, please enter your Mapbox public token. 
            You can get one for free at{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1Ijo..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <Button onClick={handleSetToken} className="w-full">
            Save Token & Load Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border shadow-lg">
        {mapError ? (
          <div className="h-[300px] flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">{mapError}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('mapbox_token');
                  setIsTokenSet(false);
                  setMapError(null);
                }}
              >
                Reset Token
              </Button>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="h-[300px] w-full" />
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(delivery.status)} px-3 py-1 font-medium`}>
            {getStatusLabel(delivery.status)}
          </Badge>
        </div>
      </div>

      {/* Driver Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Driver Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{delivery.driver.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{delivery.driver.rating}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Vehicle Number</p>
                <p className="font-medium">{delivery.driver.vehicleNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Vehicle Type</p>
                <p className="font-medium capitalize">{delivery.driver.vehicleType.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ETA */}
          <div className="bg-primary/5 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Estimated Arrival</span>
            </div>
            <span className="font-bold text-primary">
              {format(delivery.estimatedArrival, 'h:mm a, MMM d')}
            </span>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="w-0.5 h-12 bg-border" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Pickup Location</p>
                <p className="font-medium">{delivery.origin.address}</p>
                <p className="text-sm text-muted-foreground">Seller: {delivery.sellerName}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Delivery Location</p>
                <p className="font-medium">{delivery.destination.address}</p>
                <p className="text-sm text-muted-foreground">Buyer: {delivery.buyerName}</p>
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Cargo</span>
              </div>
              <span className="font-medium">{delivery.produceName} - {delivery.quantity} kg</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsTrackingMap;
