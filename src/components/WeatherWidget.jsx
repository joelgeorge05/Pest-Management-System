import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Droplets, Wind, MapPin } from 'lucide-react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Default to New Delhi coordinates or detect user location
        // user location detection can be blocked, so we'll fallback to a generic agricultural region in India if needed
        // or just fetch for "detected" location.

        const fetchWeather = async (lat, lon) => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
                );
                const data = await response.json();
                setWeather(data.current);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching weather:", error);
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (_) => {
                    console.log("Location denied, using default (Delhi)");
                    fetchWeather(28.61, 77.20);
                }
            );
        } else {
            fetchWeather(28.61, 77.20);
        }
    }, []);

    const getWeatherIcon = (code) => {
        if (code <= 3) return <Sun className="w-8 h-8 text-yellow-500 drop-shadow-sm" />;
        if (code <= 60) return <Cloud className="w-8 h-8 text-slate-100 drop-shadow-sm" />;
        return <CloudRain className="w-8 h-8 text-blue-200 drop-shadow-sm" />;
    };

    if (loading) return (
        <div className="bg-emerald-900/90 backdrop-blur-xl rounded-[2rem] p-6 animate-pulse w-72 h-32 border border-emerald-700/50 shadow-lg">
            <div className="h-4 bg-emerald-800 rounded w-1/2 mb-3"></div>
            <div className="h-10 bg-emerald-800 rounded w-1/3"></div>
        </div>
    );

    if (!weather) return (
        <div className="bg-emerald-900/90 backdrop-blur-xl border border-emerald-700/50 rounded-[2rem] p-6 text-white shadow-lg w-72">
            <p className="font-medium text-emerald-100">Weather data unavailable</p>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 backdrop-blur-xl border border-emerald-700/50 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20 w-72 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-colors pointer-events-none"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
                    <MapPin className="w-4 h-4" />
                    <span>Farm Conditions</span>
                </div>
                {getWeatherIcon(weather.weather_code)}
            </div>

            <div className="flex items-end gap-1 mb-5 relative z-10">
                <span className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-50 drop-shadow-sm">
                    {Math.round(weather.temperature_2m)}
                </span>
                <span className="text-2xl font-bold text-emerald-100/90 pb-1 tracking-tighter">°C</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-700/60 relative z-10">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm font-medium text-emerald-50">{weather.relative_humidity_2m}% Humidity</span>
                </div>
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm font-medium text-emerald-50">{weather.wind_speed_10m} km/h</span>
                </div>
            </div>
        </div>
    );
}
