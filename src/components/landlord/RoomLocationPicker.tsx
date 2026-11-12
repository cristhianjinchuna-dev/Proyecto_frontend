import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';

declare global {
  interface Window { __muvuPlaceReady?: () => void; gm_authFailure?: () => void }
}

const googleMaps = () => (window as any).google;
let mapsPromise: Promise<any> | undefined;

function loadPlaces(apiKey: string): Promise<any> {
  if (googleMaps()?.maps?.importLibrary) {
    return googleMaps().maps.importLibrary('places');
  }
  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      let settled = false;
      let timeout: number;
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(error);
      };
      timeout = window.setTimeout(() => fail(new Error('MAPS_SCRIPT_TIMEOUT')), 15000);
      const previousAuthFailure = window.gm_authFailure;
      window.gm_authFailure = () => {
        previousAuthFailure?.();
        window.dispatchEvent(new CustomEvent('muvu-google-auth-failure'));
        fail(new Error('GOOGLE_AUTH_FAILURE'));
      };
      window.__muvuPlaceReady = () => {
        const maps = googleMaps()?.maps;
        if (maps) {
          void maps.importLibrary('places').then((library: any) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            resolve(library);
          }, fail);
        } else fail(new Error('Google Maps no pudo inicializarse.'));
      };
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=__muvuPlaceReady&v=weekly`;
      script.async = true;
      script.onerror = () => fail(new Error('NETWORK_ERROR'));
      document.head.append(script);
    });
  }
  return mapsPromise;
}

function explainGoogleError(error: unknown): string {
  const details = error && typeof error === 'object'
    ? `${(error as any).name ?? ''} ${(error as any).message ?? ''} ${(error as any).endpoint ?? ''} ${(error as any).code ?? ''} ${(error as any).status ?? ''}`
    : String(error ?? '');
  const code = details.toLowerCase();
  const diagnostic = details.trim().replace(/\s+/g, ' ').slice(0, 320);
  if (code.includes('invalidkey') || code.includes('invalid key') || code.includes('missingkey')) return 'La clave de Google Maps no es válida. Revisa VITE_GOOGLE_MAPS_API_KEY en .env.local y reinicia Vite.';
  if (code.includes('referernotallowed') || code.includes('referer') || code.includes('referrer')) return 'Google rechazó el dominio de esta web. Añade el dominio actual, incluido localhost y su puerto, a las restricciones HTTP referrer de la clave.';
  if (code.includes('apinotactivated') || code.includes('apitargetblocked') || code.includes('not authorized') || code.includes('api not')) return 'La clave no tiene acceso a una API necesaria. Habilita Maps JavaScript API y Places API (New) en el mismo proyecto de Google Cloud y permite ambas en las restricciones de la clave.';
  if (code.includes('billing')) return 'El proyecto de Google Cloud no tiene facturación activa. Activa la facturación del proyecto vinculado a esta clave.';
  if (code.includes('quota') || code.includes('over_query_limit') || code.includes('resource_exhausted')) return 'Se alcanzó la cuota de Google Places. Revisa las cuotas y la facturación del proyecto en Google Cloud.';
  if (code.includes('permission_denied') || code.includes('api_target_blocked')) return `Google denegó la solicitud (${diagnostic}). Revisa las restricciones de APIs de la clave y permite Places API (New) y Maps JavaScript API.`;
  if (code.includes('failed_precondition') || code.includes('api_not_activated')) return `Google indica que falta habilitar o configurar el servicio (${diagnostic}). Activa Places API (New), vincula facturación y espera unos minutos.`;
  if (code.includes('network_error') || code.includes('failed to fetch') || code.includes('network')) return 'No se pudo conectar con Google Maps. Revisa la conexión, los bloqueadores del navegador y que maps.googleapis.com no esté bloqueado.';
  if (code.includes('timeout')) return 'Google Maps tardó demasiado en responder. Revisa la clave, las restricciones HTTP referrer y la consola del navegador.';
  if (code.includes('google_auth_failure')) return 'Google rechazó la clave. Comprueba que sea válida, que el dominio actual esté autorizado y que Maps JavaScript API y Places API (New) estén habilitadas con facturación activa.';
  return `Google Places no pudo completar la búsqueda. Detalle devuelto por Google: ${diagnostic || 'sin código ni mensaje'}.`;
}

interface Props {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  onAddressChange: (address: string) => void;
  onCoordinatesChange: (coordinates: { lat: number; lng: number } | null) => void;
}

export function RoomLocationPicker({ address, coordinates, onAddressChange, onCoordinatesChange }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [places, setPlaces] = useState<any>(null);
  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(Boolean(coordinates));
  const [draftCoordinates, setDraftCoordinates] = useState<{ lat: number; lng: number } | null>(coordinates);
  const [pinChanged, setPinChanged] = useState(false);
  const [confirmingPin, setConfirmingPin] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const requestId = useRef(0);
  const sessionToken = useRef<any>(null);
  const skipNextSearch = useRef(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setQuery(address);
  }, [address]);

  useEffect(() => {
    if (!apiKey) {
      setError('Falta configurar VITE_GOOGLE_MAPS_API_KEY para buscar direcciones.');
      return;
    }
    let cancelled = false;
    const onGoogleAuthFailure = () => {
      if (!cancelled) setError('Google rechazó la clave. Verifica APIs habilitadas, facturación y restricciones HTTP referrer para este dominio.');
    };
    window.addEventListener('muvu-google-auth-failure', onGoogleAuthFailure);
    loadPlaces(apiKey)
      .then((library) => { if (!cancelled) setPlaces(library); })
      .catch((cause) => {
        if (!cancelled) setError(explainGoogleError(cause));
      });
    return () => {
      cancelled = true;
      window.removeEventListener('muvu-google-auth-failure', onGoogleAuthFailure);
    };
  }, [apiKey]);

  useEffect(() => {
    if (!coordinates) return;
    setDraftCoordinates(coordinates);
    setShowMap(true);
  }, [coordinates]);

  useEffect(() => {
    if (!showMap || !apiKey || !mapElement.current) return;
    let cancelled = false;
    const initialize = async () => {
      try {
        await loadPlaces(apiKey);
        const { Map } = await googleMaps().maps.importLibrary('maps');
        if (cancelled || !mapElement.current) return;
        const center = draftCoordinates ?? { lat: -12.0464, lng: -77.0428 };
        const map = new Map(mapElement.current, {
          center,
          zoom: 17,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
        });
        mapRef.current = map;
        const marker = new (googleMaps().maps.Marker)({
          map,
          position: center,
          draggable: true,
          title: 'Ubicación exacta de la habitación',
        });
        markerRef.current = marker;
        const changePin = (point: { lat: number; lng: number }) => {
          marker.setPosition(point);
          setDraftCoordinates(point);
          setPinChanged(true);
          onCoordinatesChange(null);
          setError('');
        };
        marker.addListener('dragend', (event: any) => {
          if (event.latLng) changePin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
        map.addListener('click', (event: any) => {
          if (event.latLng) changePin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
      } catch (cause) {
        if (!cancelled) setError(`No se pudo cargar el mapa para ajustar el punto. ${explainGoogleError(cause)}`);
      }
    };
    void initialize();
    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [apiKey, showMap]);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      setSuggestions([]);
      return;
    }
    const normalizedQuery = query.trim();
    if (!places || normalizedQuery.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        sessionToken.current ??= new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: normalizedQuery,
          includedRegionCodes: ['pe'],
          language: 'es',
          region: 'pe',
          sessionToken: sessionToken.current,
        });
        if (currentRequest === requestId.current) {
          setSuggestions((response.suggestions ?? []).filter((item: any) => item.placePrediction));
        }
      } catch (cause) {
        if (currentRequest === requestId.current) {
          console.error('[Google Places] Falló la búsqueda de sugerencias:', cause);
          setSuggestions([]);
          setError(explainGoogleError(cause));
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [places, query]);

  async function selectSuggestion(prediction: any) {
    requestId.current += 1;
    setLoading(true);
    setError('');
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress', 'location'] });
      if (!place.location) throw new Error('La sugerencia no tiene coordenadas');
      const selectedAddress = place.formattedAddress || prediction.text.toString();
      onAddressChange(selectedAddress);
      const point = { lat: place.location.lat(), lng: place.location.lng() };
      setDraftCoordinates(point);
      setPinChanged(false);
      setShowMap(true);
      onCoordinatesChange(point);
      skipNextSearch.current = true;
      setQuery(selectedAddress);
      setSuggestions([]);
      sessionToken.current = null;
      setFocused(false);
    } catch (cause) {
      console.error('[Google Places] Falló la carga de coordenadas de la sugerencia:', cause);
      setError(explainGoogleError(cause));
    } finally {
      setLoading(false);
    }
  }

  function handleInput(value: string) {
    requestId.current += 1;
    setQuery(value);
    onAddressChange(value);
    onCoordinatesChange(null);
    setDraftCoordinates(null);
    setPinChanged(false);
    setShowMap(false);
    setError('');
    sessionToken.current ??= places ? new places.AutocompleteSessionToken() : null;
  }

  function useCurrentLocation() {
    setError('');
    if (!navigator.geolocation) {
      setError('Este navegador no permite obtener la ubicación. Busca la dirección manualmente.');
      return;
    }
    if (!window.isSecureContext) {
      setError('El navegador solo permite compartir la ubicación en HTTPS o en localhost.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const maps = googleMaps()?.maps;
        if (!maps?.importLibrary) throw new Error('MAPS_LIBRARY_NOT_READY');
        const { Geocoder } = await maps.importLibrary('geocoding');
        const result = await new Geocoder().geocode({ location: { lat: coords.latitude, lng: coords.longitude } });
        const formattedAddress = result.results?.[0]?.formatted_address;
        if (!formattedAddress) throw new Error('REVERSE_GEOCODING_NO_RESULT');

        if (formattedAddress !== query) {
          skipNextSearch.current = true;
          setQuery(formattedAddress);
        }
        setDraftCoordinates({ lat: coords.latitude, lng: coords.longitude });
        setPinChanged(false);
        setShowMap(true);
        onAddressChange(formattedAddress);
        onCoordinatesChange({ lat: coords.latitude, lng: coords.longitude });
        setSuggestions([]);
        sessionToken.current = null;
        setFocused(false);
      } catch (cause) {
        console.error('[Google Geocoding] Falló la conversión de la ubicación actual:', cause);
        if (cause instanceof Error && cause.message === 'REVERSE_GEOCODING_NO_RESULT') {
          setError('Google no encontró una dirección cercana a tu ubicación. Busca la dirección manualmente.');
        } else if (cause instanceof Error && cause.message === 'MAPS_LIBRARY_NOT_READY') {
          setError('Google Maps todavía está cargando. Espera un momento y vuelve a intentarlo.');
        } else {
          setError(`No se pudo convertir tu ubicación en dirección. ${explainGoogleError(cause)} Comprueba que Geocoding API esté habilitada y permitida para esta clave.`);
        }
      } finally {
        setLocating(false);
      }
    }, (geoError) => {
      const message = geoError.code === geoError.PERMISSION_DENIED
        ? 'No se concedió el permiso de ubicación. Permítelo en el navegador o busca la dirección manualmente.'
        : geoError.code === geoError.TIMEOUT
          ? 'El navegador tardó demasiado en obtener tu ubicación. Inténtalo otra vez o busca la dirección.'
          : 'No se pudo determinar tu ubicación. Activa la ubicación del dispositivo o busca la dirección manualmente.';
      setError(message);
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }

  async function confirmMapPoint() {
    if (!draftCoordinates) return;
    setConfirmingPin(true);
    setError('');
    try {
      const maps = googleMaps()?.maps;
      if (!maps?.importLibrary) throw new Error('MAPS_LIBRARY_NOT_READY');
      const { Geocoder } = await maps.importLibrary('geocoding');
      const result = await new Geocoder().geocode({ location: draftCoordinates });
      const formattedAddress = result.results?.[0]?.formatted_address;
      if (!formattedAddress) throw new Error('REVERSE_GEOCODING_NO_RESULT');
      onAddressChange(formattedAddress);
      onCoordinatesChange(draftCoordinates);
      if (formattedAddress !== query) skipNextSearch.current = true;
      setQuery(formattedAddress);
      setPinChanged(false);
      setFocused(false);
    } catch (cause) {
      console.error('[Google Geocoding] Falló la confirmación del punto:', cause);
      setError(cause instanceof Error && cause.message === 'REVERSE_GEOCODING_NO_RESULT'
        ? 'Google no encontró una dirección para ese punto. Mueve el marcador a una calle cercana e inténtalo otra vez.'
        : `No se pudo confirmar esa ubicación. ${explainGoogleError(cause)} Verifica también que Geocoding API esté habilitada y permitida.`);
    } finally {
      setConfirmingPin(false);
    }
  }

  return (
    <section className="space-y-2">
      <label htmlFor="room-address-search" className="block text-sm font-medium text-gray-700">Dirección de la habitación</label>
      <div className="relative">
        <Search aria-hidden size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id="room-address-search"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(event) => handleInput(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Escribe una dirección en Perú"
          aria-autocomplete="list"
          aria-expanded={focused && suggestions.length > 0}
          aria-controls="room-address-suggestions"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {loading && <LoaderCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600" aria-label="Buscando" />}
        {focused && suggestions.length > 0 && (
          <ul id="room-address-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {suggestions.map((suggestion, index) => {
              const prediction = suggestion.placePrediction;
              return (
                <li key={`${prediction.placeId ?? prediction.text}-${index}`} role="option" aria-selected="false">
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void selectSuggestion(prediction)} className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" />
                    <span className="text-sm text-gray-800">{prediction.text.toString()}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500">Selecciona una sugerencia o usa tu ubicación actual para guardar la dirección y sus coordenadas.</p>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
      >
        {locating ? <LoaderCircle size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
      </button>
      {showMap && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center justify-between gap-2 bg-gray-50 px-3 py-2">
            <span className="text-sm font-medium text-gray-700">Ajusta el punto exacto</span>
            <span className="text-xs text-gray-500">Arrastra el pin o toca el mapa</span>
          </div>
          <div ref={mapElement} className="h-64 w-full bg-gray-100" aria-label="Mapa para ajustar la ubicación de la habitación" />
          {pinChanged && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
              <p className="text-xs text-amber-700">Confirma el nuevo punto para actualizar la dirección y guardar sus coordenadas.</p>
              <button type="button" onClick={() => void confirmMapPoint()} disabled={confirmingPin} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {confirmingPin && <LoaderCircle size={15} className="animate-spin" />}
                {confirmingPin ? 'Confirmando…' : 'Usar este punto'}
              </button>
            </div>
          )}
        </div>
      )}
      {focused && query.trim().length >= 3 && !loading && !error && suggestions.length === 0 && (
        <p className="text-sm text-amber-700" role="status">Google Places respondió sin sugerencias. Prueba incluir calle, distrito y ciudad; si ocurre con todas las búsquedas, revisa Maps JavaScript API, Places API (New), facturación y restricciones de la clave.</p>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </section>
  );
}
