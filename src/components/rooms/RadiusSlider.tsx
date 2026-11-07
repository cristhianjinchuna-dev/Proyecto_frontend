interface RadiusSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function RadiusSlider({ value, min, max, onChange }: RadiusSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="radius" className="text-sm font-medium text-gray-700">
          Radio de búsqueda
        </label>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
          {value} km
        </span>
      </div>
      <input
        id="radius"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  );
}