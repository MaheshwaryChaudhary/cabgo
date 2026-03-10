import React, { useEffect, useRef } from 'react';

interface MapProps {
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
  nearbyDrivers?: { lat: number; lng: number }[];
  showRoute?: boolean;
}

export default function Map({ pickup, dropoff, driverLocation, nearbyDrivers = [], showRoute }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Mock map for now if API key is missing
    if (!(window as any).google) {
      mapRef.current.innerHTML = `
        <div class="w-full h-full bg-zinc-100 flex items-center justify-center border border-zinc-200 rounded-2xl overflow-hidden relative">
          <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
          <div class="relative w-full h-full p-6 flex flex-col items-center justify-center">
            <div class="text-center z-10 mb-8">
              <p class="text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-2">Interactive Map Viewport</p>
              <p class="text-zinc-500 text-xs">Google Maps API Key Required for Real Map</p>
            </div>
            
            <div class="flex gap-8 flex-wrap justify-center">
              ${pickup ? `
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Pickup</p>
                </div>
              ` : ''}
              ${dropoff ? `
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Dropoff</p>
                </div>
              ` : ''}
              ${driverLocation ? `
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Driver</p>
                </div>
              ` : ''}
              ${nearbyDrivers.length > 0 ? `
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">${nearbyDrivers.length} Nearby</p>
                </div>
              ` : ''}
            </div>
            
            ${showRoute ? `
              <div class="mt-8 px-4 py-2 bg-zinc-800 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Route Visualization Active
              </div>
              <div class="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" class="opacity-20">
                  <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="black" stroke-width="4" stroke-dasharray="8,8" />
                </svg>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      return;
    }

    const map = new google.maps.Map(mapRef.current, {
      center: pickup || driverLocation || { lat: 37.7749, lng: -122.4194 },
      zoom: 13,
      styles: [
        {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#141414" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#e4e3e0" }]
        }
      ]
    });
    googleMapRef.current = map;

    if (pickup) new google.maps.Marker({ 
      position: pickup, 
      map, 
      title: 'Pickup',
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new google.maps.Point(12, 22)
      }
    });
    if (dropoff) new google.maps.Marker({ 
      position: dropoff, 
      map, 
      title: 'Dropoff',
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#f43f5e',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new google.maps.Point(12, 22)
      }
    });
    if (driverLocation) new google.maps.Marker({ 
      position: driverLocation, 
      map, 
      title: 'Driver',
      icon: {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42.99L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: '#000',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 1,
        scale: 1.2,
        anchor: new google.maps.Point(12, 12)
      }
    });

    nearbyDrivers.forEach(driver => {
      new google.maps.Marker({ 
        position: driver, 
        map, 
        title: 'Nearby Driver',
        icon: {
          path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42.99L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
          fillColor: '#71717a',
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 1,
          scale: 1.0,
          anchor: new google.maps.Point(12, 12)
        }
      });
    });

    const directionsService = new google.maps.DirectionsService();

    if (showRoute && pickup) {
      const destination = dropoff || pickup;
      const origin = (dropoff && pickup) ? pickup : (driverLocation || pickup);

      if (dropoff && pickup) {
        // Pickup to Dropoff (In Progress)
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#000',
            strokeWeight: 5,
            strokeOpacity: 0.9
          }
        });
        directionsRendererRef.current = directionsRenderer;

        directionsService.route({
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        });
      } else if (driverLocation && pickup) {
        // Driver to Pickup (Accepted)
        const driverToPickupRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 4,
            strokeOpacity: 0.6,
            lineDashOffset: '10',
            strokeDasharray: '1, 2'
          } as any
        });

        directionsService.route({
          origin: driverLocation,
          destination: pickup,
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            driverToPickupRenderer.setDirections(result);
          }
        });
      }
    }

  }, [pickup, dropoff, driverLocation, showRoute]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-sm border border-black/5" />;
}
