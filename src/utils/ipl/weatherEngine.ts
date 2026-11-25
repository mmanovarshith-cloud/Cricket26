
export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "overcast"
  | "light-rain"
  | "heavy-rain"
  | "fog"
  | "windy";

export interface WeatherProfile {
  condition: WeatherCondition;
  temperatureCelsius: number;
  humidity: number;
  windSpeedKph: number;
  cloudCover: number;
  visibilityKm: number;
  rainProbability: number;
}

export interface MatchWeatherEffects {
  swingFactor: number;
  spinFactor: number;
  visibilityFactor: number;
  outfieldFactor: number;
  interruptionRisk: number;
  dewRisk: number;
  playable: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function validateWeather(
  weather: WeatherProfile,
): void {
  if (
    !Number.isFinite(weather.temperatureCelsius) ||
    weather.temperatureCelsius < -10 ||
    weather.temperatureCelsius > 55
  ) {
    throw new Error("Temperature must be between -10°C and 55°C.");
  }

  const percentages = [
    weather.humidity,
    weather.cloudCover,
    weather.rainProbability,
  ];

  if (
    percentages.some(
      (value) => !Number.isFinite(value) || value < 0 || value > 100,
    )
  ) {
    throw new Error("Humidity, cloud cover, and rain probability must be 0–100.");
  }

  if (
    !Number.isFinite(weather.windSpeedKph) ||
    weather.windSpeedKph < 0 ||
    weather.windSpeedKph > 200
  ) {
    throw new Error("Wind speed must be between 0 and 200 km/h.");
  }

  if (
    !Number.isFinite(weather.visibilityKm) ||
    weather.visibilityKm < 0 ||
    weather.visibilityKm > 100
  ) {
    throw new Error("Visibility must be between 0 and 100 km.");
  }
}

export function calculateWeatherEffects(
  weather: WeatherProfile,
): MatchWeatherEffects {
  validateWeather(weather);

  const cloudSwing = weather.cloudCover / 100;
  const humiditySwing = weather.humidity / 100;

  const swingFactor = clamp(
    1 + cloudSwing * 0.2 + humiditySwing * 0.15,
    0.8,
    1.4,
  );

  const spinFactor = clamp(
    1 + (50 - weather.humidity) / 250,
    0.8,
    1.2,
  );

  const visibilityFactor = clamp(
    weather.visibilityKm / 10,
    0.1,
    1,
  );

  const outfieldFactor = clamp(
    1 - weather.rainProbability / 200,
    0.5,
    1,
  );

  const interruptionRisk = clamp(
    weather.rainProbability * 0.7 +
      (weather.condition === "heavy-rain" ? 30 : 0),
    0,
    100,
  );

  const dewRisk = clamp(
    (weather.humidity * 0.55) +
      (weather.temperatureCelsius > 24 ? 20 : 0),
    0,
    100,
  );

  const playable =
    weather.condition !== "heavy-rain" &&
    weather.condition !== "fog" &&
    weather.visibilityKm >= 0.5;

  return {
    swingFactor: Number(swingFactor.toFixed(2)),
    spinFactor: Number(spinFactor.toFixed(2)),
    visibilityFactor: Number(visibilityFactor.toFixed(2)),
    outfieldFactor: Number(outfieldFactor.toFixed(2)),
    interruptionRisk: Number(interruptionRisk.toFixed(1)),
    dewRisk: Number(dewRisk.toFixed(1)),
    playable,
  };
}

export function createDefaultWeather(): WeatherProfile {
  return {
    condition: "clear",
    temperatureCelsius: 28,
    humidity: 55,
    windSpeedKph: 10,
    cloudCover: 20,
    visibilityKm: 10,
    rainProbability: 5,
  };
}

export function getWeatherDescription(
  weather: WeatherProfile,
): string {
  validateWeather(weather);

  const temperature = `${weather.temperatureCelsius}°C`;

  switch (weather.condition) {
    case "clear":
      return `Clear conditions, ${temperature}.`;
    case "cloudy":
      return `Cloudy skies, ${temperature}.`;
    case "overcast":
      return `Overcast conditions, ${temperature}.`;
    case "light-rain":
      return `Light rain reported, ${temperature}.`;
    case "heavy-rain":
      return `Heavy rain conditions, ${temperature}.`;
    case "fog":
      return `Foggy conditions, ${temperature}.`;
    case "windy":
      return `Windy conditions, ${temperature}.`;
    default:
      return `Weather conditions, ${temperature}.`;
  }
}
