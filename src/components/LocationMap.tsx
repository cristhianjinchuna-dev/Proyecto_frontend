import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPinned } from 'lucide-react';
import { getRoomImages } from '../api/rooms';
import { buildRoomPath } from '../routes/paths';
import type { Room } from '../types/room';
import { formatPrice } from '../utils/format';

declare global {
  interface Window { google?: { maps: GoogleMapsApi } }
}
interface GoogleMapsApi {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  Geocoder: new () => GoogleGeocoder;
  LatLngBounds: new () => GoogleBounds;
  Circle: new (options: Record<string, unknown>) => GoogleOverlay;
  InfoWindow: new () => GoogleInfoWindow;
  SymbolPath: { CIRCLE: unknown };
  importLibrary(name: string): Promise<unknown>;
}
interface GoogleMap {
  setCenter(center: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleBounds, padding?: number): void;
  panTo(point: { lat: number; lng: number }): void;
}
interface GoogleMarker {
  setMap(map: GoogleMap | null): void;
  addListener(event: string, callback: () => void): void;
  setIcon(icon: Record<string, unknown>): void;
  setZIndex(zIndex: number): void;
}
interface GoogleBounds { extend(point: { lat: number; lng: number }): void }
interface GoogleOverlay { setMap(map: GoogleMap | null): void; getBounds(): GoogleBounds; setRadius(radius: number): void }
interface GoogleInfoWindow {
  setContent(content: HTMLElement): void;
  open(options: { map: GoogleMap; anchor: GoogleMarker }): void;
  close(): void;
}
interface GoogleGeocoder { geocode(request: { address: string }): Promise<{ results: Array<{ geometry: { location: { lat(): number; lng(): number } } }> }> }
interface GooglePolyline { setMap(map: GoogleMap | null): void }
interface GoogleRoute {
  localizedValues?: { duration?: string };
  createPolylines(): GooglePolyline[];
}
export type RouteTravelMode = 'DRIVING' | 'TRANSIT' | 'WALKING';
const ROUTE_MODES: Array<{ value: RouteTravelMode; label: string }> = [
  { value: 'DRIVING', label: 'Automóvil' },
  { value: 'TRANSIT', label: 'Transporte público' },
  { value: 'WALKING', label: 'A pie' },
];
interface RouteTime { loading: boolean; duration?: string; unavailable?: boolean }
interface RouteUniversityOption { id: number; name: string; lat: number; lng: number; distanceKm: number }
interface GoogleRoutesLibrary {
  Route: {
    computeRoutes(request: {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      travelMode: RouteTravelMode;
      fields: ['path', 'localizedValues'];
    }): Promise<{ routes?: GoogleRoute[] }>;
  };
}

let mapsLoader: Promise<GoogleMapsApi> | undefined;
function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (!mapsLoader) {
    mapsLoader = new Promise((resolve, reject) => {
      const callbackName = '__muvuGoogleMapsReady';
      Object.assign(window, { [callbackName]: () => window.google?.maps && resolve(window.google.maps) });
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps.'));
      document.head.append(script);
    });
  }
  return mapsLoader;
}

interface LocationMapProps {
  title: string;
  rooms: Room[];
  address?: string;
  coordinates?: { lat: number; lng: number };
  circleCenter?: { lat: number; lng: number };
  radiusKm?: number;
  circleCenterTitle?: string;
  routeDestination?: { lat: number; lng: number; title?: string };
  routeUniversities?: RouteUniversityOption[];
  selectedUniversityId?: number | null;
  onSelectUniversity?: (universityId: number) => void;
  universitiesLoading?: boolean;
  universitiesError?: boolean;
}
export function LocationMap({ title, rooms, address, coordinates, circleCenter, radiusKm, circleCenterTitle = 'Universidad', routeDestination, routeUniversities, selectedUniversityId, onSelectUniversity, universitiesLoading = false, universitiesError = false }: LocationMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;
  const radiusValueRef = useRef(radiusKm);
  radiusValueRef.current = radiusKm;
  const selectRoomRef = useRef<(roomId: number) => void>(() => undefined);
  const refreshRoomMarkersRef = useRef<(nextRooms: Room[]) => void>(() => undefined);
  const mapRef = useRef<GoogleMap | null>(null);
  const routeDestinationRef = useRef(routeDestination);
  routeDestinationRef.current = routeDestination;
  const updateRouteRef = useRef<(origin?: { lat: number; lng: number }, destination?: { lat: number; lng: number; title?: string }) => void>(() => undefined);
  const selectRouteModeRef = useRef<(mode: RouteTravelMode) => void>(() => undefined);
  const universityRouteMarkerRef = useRef<GoogleMarker | null>(null);
  const radiusCircleRef = useRef<GoogleOverlay | null>(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [selectedRouteMode, setSelectedRouteMode] = useState<RouteTravelMode>('DRIVING');
  const [routeTimes, setRouteTimes] = useState<Record<RouteTravelMode, RouteTime>>({
    DRIVING: { loading: false }, TRANSIT: { loading: false }, WALKING: { loading: false },
  });
  const selectedRouteModeRef = useRef(selectedRouteMode);
  selectedRouteModeRef.current = selectedRouteMode;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapElement.current) return;
    let cancelled = false;
    let map: GoogleMap;
    const markers: GoogleMarker[] = [];
    const roomMarkers: Array<{ room: Room; marker: GoogleMarker; position: { lat: number; lng: number }; index: number }> = [];
    let radiusCircle: GoogleOverlay | undefined;
    let infoWindow: GoogleInfoWindow | undefined;
    let activeRoomId: number | null = null;
    let routePolylines: GooglePolyline[] = [];
    let routeRequestId = 0;
    let routeResults: Partial<Record<RouteTravelMode, GoogleRoute>> = {};
    async function initialize() {
      try {
        const maps = await loadGoogleMaps(apiKey);
        if (cancelled || !mapElement.current) return;
        const points = rooms.map((room) => ({ lat: room.latitud, lng: room.longitud }));
        let point = coordinates ?? circleCenter ?? points[0];
        if (!point && address) {
          // Add the country/city to avoid ambiguous addresses entered without a district.
          const fullAddress = /per[uú]/i.test(address) ? address : `${address}, Lima, Perú`;
          const response = await new maps.Geocoder().geocode({ address: fullAddress });
          const location = response.results[0]?.geometry.location;
          if (location) point = { lat: location.lat(), lng: location.lng() };
        }
        if (cancelled || !mapElement.current) return;
        if (!point) { setError('No se pudo determinar la ubicación.'); return; }
        map = new maps.Map(mapElement.current, {
          center: point,
          zoom: points.length > 1 ? 13 : 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          backgroundColor: '#eef3f1',
          styles: [
            { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
            { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#f3f6f2' }] },
            { featureType: 'poi', elementType: 'geometry.fill', stylers: [{ color: '#dcebdc' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#66806b' }] },
            { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e3e9e6' }] },
            { featureType: 'transit', elementType: 'geometry.fill', stylers: [{ color: '#e4e8f3' }] },
            { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#cfe6f3' }] },
          ],
        });
        mapRef.current = map;
        infoWindow = new maps.InfoWindow();
        function roomInfoContent(room: Room, imageUrl?: string) {
          const content = document.createElement('div');
          content.className = 'min-w-52 space-y-2 p-1';
          if (imageUrl) {
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = `Habitación en ${room.direccion}`;
            image.className = 'h-28 w-full rounded-lg object-cover';
            image.onerror = () => image.remove();
            content.append(image);
          }
          const heading = document.createElement('h3');
          heading.className = 'font-semibold text-gray-900';
          heading.textContent = room.direccion;
          const price = document.createElement('p');
          price.className = 'text-sm font-medium text-blue-700';
          price.textContent = `${formatPrice(room.precio)} / mes`;
          const viewButton = document.createElement('button');
          viewButton.type = 'button';
          viewButton.className = 'mt-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700';
          viewButton.textContent = 'Ver';
          viewButton.addEventListener('click', () => navigate(buildRoomPath(room.id)));
          content.append(heading, price, viewButton);
          return content;
        }
        function selectRoom(room: Room, marker: GoogleMarker, position: { lat: number; lng: number }) {
          activeRoomId = room.id;
          roomMarkers.forEach(({ marker: item, index }) => {
            item.setIcon({ path: maps.SymbolPath.CIRCLE, scale: points.length > 1 ? 9 : 11, fillColor: '#2563eb', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 });
            item.setZIndex(index + 1);
          });
          marker.setIcon({ path: maps.SymbolPath.CIRCLE, scale: points.length > 1 ? 13 : 15, fillColor: '#f59e0b', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 4 });
          marker.setZIndex(2000);
          map.panTo(position);
          map.setZoom(16);
          infoWindow?.setContent(roomInfoContent(room));
          infoWindow?.open({ map, anchor: marker });
          const destination = routeDestinationRef.current;
          if (destination) updateRouteRef.current(position, destination);
          void getRoomImages(room.id).then((images) => {
            const cover = images[0]?.url;
            if (!cancelled && activeRoomId === room.id && cover) {
              infoWindow?.setContent(roomInfoContent(room, cover));
              infoWindow?.open({ map, anchor: marker });
            }
          }).catch(() => undefined);
        }
        function showRouteMode(mode: RouteTravelMode) {
          selectedRouteModeRef.current = mode;
          routePolylines.forEach((polyline) => polyline.setMap(null));
          routePolylines = [];
          const route = routeResults[mode];
          if (!route) return;
          routePolylines = route.createPolylines();
          routePolylines.forEach((polyline) => polyline.setMap(map));
        }
        selectRouteModeRef.current = showRouteMode;
        async function calculateRoutes(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
          const requestId = ++routeRequestId;
          routePolylines.forEach((polyline) => polyline.setMap(null));
          routePolylines = [];
          routeResults = {};
          setRouteTimes({
            DRIVING: { loading: true }, TRANSIT: { loading: true }, WALKING: { loading: true },
          });
          setError('');
          try {
            const { Route } = await maps.importLibrary('routes') as GoogleRoutesLibrary;
            const results = await Promise.all(ROUTE_MODES.map(async ({ value }) => {
              try {
                const response = await Route.computeRoutes({ origin, destination, travelMode: value, fields: ['path', 'localizedValues'] });
                return { mode: value, route: response.routes?.[0] };
              } catch {
                return { mode: value, route: undefined };
              }
            }));
            if (cancelled || requestId !== routeRequestId) return;
            const nextTimes = {} as Record<RouteTravelMode, RouteTime>;
            results.forEach(({ mode, route }) => {
              if (route) routeResults[mode] = route;
              nextTimes[mode] = route
                ? { loading: false, duration: route.localizedValues?.duration }
                : { loading: false, unavailable: true };
            });
            setRouteTimes(nextTimes);
            showRouteMode(selectedRouteModeRef.current);
          } catch {
            if (!cancelled && requestId === routeRequestId) {
              setError('No se pudieron calcular las rutas. Verifica que Routes API est? habilitada en Google Cloud.');
              setRouteTimes({
                DRIVING: { loading: false, unavailable: true }, TRANSIT: { loading: false, unavailable: true },
                WALKING: { loading: false, unavailable: true },
              });
            }
          }
        }
        updateRouteRef.current = (origin, destination) => {
          universityRouteMarkerRef.current?.setMap(null);
          universityRouteMarkerRef.current = null;
          if (!origin || !destination) {
            routeRequestId += 1;
            routePolylines.forEach((polyline) => polyline.setMap(null));
            routePolylines = [];
            routeResults = {};
            setRouteTimes({
              DRIVING: { loading: false }, TRANSIT: { loading: false }, WALKING: { loading: false },
            });
            return;
          }
          universityRouteMarkerRef.current = new maps.Marker({
            map,
            position: destination,
            title: destination.title ?? 'Universidad',
            label: { text: 'U', color: '#ffffff', fontWeight: '700' },
            icon: { path: maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#7c3aed', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 },
            zIndex: 1000,
          });
          const routeBounds = new maps.LatLngBounds();
          routeBounds.extend(origin);
          routeBounds.extend(destination);
          map.fitBounds(routeBounds, 56);
          void calculateRoutes(origin, destination);
        };
        function refreshRoomMarkers(nextRooms: Room[]) {
          roomMarkers.forEach(({ marker }) => {
            marker.setMap(null);
            const markerIndex = markers.indexOf(marker);
            if (markerIndex !== -1) markers.splice(markerIndex, 1);
          });
          roomMarkers.length = 0;
          activeRoomId = null;
          infoWindow?.close();
          const nextPoints = nextRooms.map((room) => ({ lat: room.latitud, lng: room.longitud }));
          const locations = nextPoints.length ? nextPoints : [point!];
          const bounds = new maps.LatLngBounds();
          locations.forEach((position, index) => {
            bounds.extend(position);
            const room = nextRooms[index];
            const marker = new maps.Marker({
              map,
              position,
              title: room?.direccion ?? address ?? 'Habitación',
              label: { text: nextPoints.length > 1 ? String(index + 1) : 'H', color: '#ffffff', fontWeight: '700' },
              icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: nextPoints.length > 1 ? 9 : 11,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              },
              zIndex: index + 1,
            });
            markers.push(marker);
            if (room) {
              roomMarkers.push({ room, marker, position, index });
              marker.addListener('click', () => selectRoom(room, marker, position));
            }
          });
          selectRoomRef.current = (roomId) => {
            const selected = roomMarkers.find(({ room }) => room.id === roomId);
            if (selected) selectRoom(selected.room, selected.marker, selected.position);
          };
          if (!circleCenter && locations.length > 1) map.fitBounds(bounds);
        }
        refreshRoomMarkersRef.current = refreshRoomMarkers;
        if (circleCenter && radiusKm) {
          radiusCircle = new maps.Circle({
            map,
            center: circleCenter,
          radius: (radiusValueRef.current ?? radiusKm) * 1000,
            fillColor: '#2563eb',
            fillOpacity: 0.12,
            strokeColor: '#2563eb',
            strokeOpacity: 0.75,
            strokeWeight: 2,
            clickable: false,
          });
          radiusCircleRef.current = radiusCircle;
          map.setCenter(circleCenter);
          map.fitBounds(radiusCircle.getBounds());
          markers.push(new maps.Marker({
            map,
            position: circleCenter,
            title: circleCenterTitle,
            label: { text: 'U', color: '#ffffff', fontWeight: '700' },
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#7c3aed',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            zIndex: 1000,
          }));
        }
        refreshRoomMarkers(roomsRef.current);
        if (routeDestinationRef.current && coordinates) updateRouteRef.current(coordinates, routeDestinationRef.current);
      } catch {
        if (!cancelled) setError('No se pudo cargar el mapa de Google. Revisa la clave y las APIs habilitadas.');
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      selectRoomRef.current = () => undefined;
      refreshRoomMarkersRef.current = () => undefined;
      updateRouteRef.current = () => undefined;
      infoWindow?.close();
      routeRequestId += 1;
      routePolylines.forEach((polyline) => polyline.setMap(null));
      markers.forEach((marker) => marker.setMap(null));
      radiusCircle?.setMap(null);
      mapRef.current = null;
      universityRouteMarkerRef.current?.setMap(null);
      universityRouteMarkerRef.current = null;
      radiusCircleRef.current = null;
    };
  }, [apiKey, address, coordinates, circleCenter, circleCenterTitle, navigate]);

  useEffect(() => {
    refreshRoomMarkersRef.current(rooms);
  }, [rooms]);

  useEffect(() => {
    const circle = radiusCircleRef.current;
    const map = mapRef.current;
    if (!circle || !map || !radiusKm) return;
    circle.setRadius(radiusKm * 1000);
    map.fitBounds(circle.getBounds());
  }, [radiusKm]);

  useEffect(() => {
    updateRouteRef.current(coordinates, routeDestination);
  }, [coordinates?.lat, coordinates?.lng, routeDestination?.lat, routeDestination?.lng, routeDestination?.title]);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900"><MapPinned className="h-5 w-5 text-blue-600" aria-hidden />{title}</h2>
        {address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-700 hover:underline">Abrir mapa <ExternalLink className="h-4 w-4" aria-hidden /></a>}
      </div>
      <div className={rooms.length > 0 ? 'grid md:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)]' : routeUniversities ? 'grid lg:grid-cols-[minmax(0,1fr)_320px]' : routeDestination ? 'grid lg:grid-cols-[minmax(0,1fr)_280px]' : ''}>
        {apiKey ? <div ref={mapElement} className="h-[360px] w-full lg:h-[420px]" aria-label={title} /> : <div className="flex h-48 items-center justify-center bg-gray-50 px-6 text-center text-sm text-amber-800">Configura VITE_GOOGLE_MAPS_API_KEY para mostrar el mapa interactivo.</div>}
        {rooms.length > 0 && <aside className="border-t border-gray-100 md:max-h-[420px] md:overflow-y-auto md:border-l md:border-t-0">
          <h3 className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800">Habitaciones ({rooms.length})</h3>
          <ol className="space-y-1 p-3 text-sm text-gray-700">{rooms.map((room, index) => <li key={room.id}><button type="button" onClick={() => selectRoomRef.current(room.id)} className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{index + 1}</span><span className="line-clamp-2">{room.direccion}</span></button></li>)}</ol>
        </aside>}
        {routeUniversities && <aside className="space-y-5 border-t border-gray-100 p-4 lg:max-h-[420px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Universidades cercanas</h3>
            <p className="mt-1 text-xs text-gray-500">Selecciona el destino para ajustar el mapa y calcular las rutas.</p>
            {universitiesLoading ? <p className="mt-3 text-sm text-gray-500">Cargando universidades…</p>
              : universitiesError ? <p role="status" className="mt-3 text-sm text-red-700">No se pudieron cargar las universidades.</p>
                : <select
                    aria-label="Universidad de destino"
                    value={selectedUniversityId ?? ''}
                    onChange={(event) => { if (event.target.value) onSelectUniversity?.(Number(event.target.value)); }}
                    disabled={routeUniversities.length === 0}
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50"
                  >
                    {routeUniversities.length === 0 && <option value="">No hay universidades disponibles</option>}
                    {routeUniversities.map((university) => <option key={university.id} value={university.id}>{university.name} · {university.distanceKm.toFixed(1)} km</option>)}
                  </select>}
          </section>
          {routeDestination && <section className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">Tiempo por transporte</h3>
            <p className="mt-1 text-xs text-gray-500">Selecciona un medio para mostrar su ruta.</p>
            <ul className="mt-3 space-y-2">
              {ROUTE_MODES.map(({ value, label }) => {
                const time = routeTimes[value];
                const selected = selectedRouteMode === value;
                return <li key={value}>
                  <button
                    type="button"
                    disabled={time.loading || time.unavailable || !time.duration}
                    onClick={() => { setSelectedRouteMode(value); selectRouteModeRef.current(value); }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${selected ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'} disabled:cursor-default disabled:opacity-70`}
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm font-semibold">{time.loading ? 'Calculando…' : time.duration ?? 'No disponible'}</span>
                  </button>
                </li>;
              })}
            </ul>
            <p className="mt-3 text-xs text-amber-800">Las rutas a pie pueden tener caminos incompletos.</p>
          </section>}
        </aside>}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 px-5 py-3 text-sm text-gray-700" aria-label="Leyenda del mapa">
        {circleCenter && <span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">U</span>{circleCenterTitle}</span>}
        <span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{rooms.length > 1 ? '1' : 'H'}</span>{rooms.length > 1 ? 'Habitaciones' : 'Habitación'}</span>
        {circleCenter && radiusKm && <span className="inline-flex items-center gap-2"><span className="h-3 w-5 rounded-full border-2 border-blue-500 bg-blue-100/70" />Radio de búsqueda: {radiusKm} km</span>}
      </div>
      {error && <p role="status" className="px-5 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
