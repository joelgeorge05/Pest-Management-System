import React, { useEffect, useState } from 'react';
import { Store, MapPin, Phone } from 'lucide-react';

export default function ShopList() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/shops')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setShops(data);
                } else {
                    console.error("Invalid data format for shops:", data);
                    setShops([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching shops:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center py-8">Loading shops...</div>;

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-black tracking-widest uppercase border border-amber-200/50 mb-4 shadow-sm">
                        <Store className="w-4 h-4 text-amber-500" />
                        <span>Verified Sellers</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Pesticide Shops</span>
                    </h2>
                </div>
                <p className="text-slate-500 font-medium max-w-sm">
                    Discover verified local and online stores to buy authentic crop protection medicines and fertilizers.
                </p>
            </div>

            {shops.length === 0 ? (
                <p className="text-slate-600">No shops listed yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shops.map((shop, index) => (
                        <div key={shop._id} className="glass-card overflow-hidden group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            {shop.photo && (
                                <div className="h-56 overflow-hidden bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent z-10" />
                                    <img
                                        src={shop.photo.startsWith('http') ? shop.photo : `http://localhost:5000/uploads/${shop.photo}`}
                                        alt={shop.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute bottom-4 left-5 z-20">
                                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-amber-800 text-xs font-black tracking-widest uppercase rounded-lg shadow-sm border border-amber-100">Verified Agent</span>
                                    </div>
                                </div>
                            )}
                            <div className="p-7">
                                <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{shop.name}</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-4 text-slate-600">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-inner">
                                            <MapPin className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="mt-1">
                                            <p className="font-bold text-slate-800 text-base">{shop.address}</p>
                                            <p className="text-slate-500 font-medium">{shop.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
                                            <Phone className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-base">{shop.contact}</span>
                                    </div>

                                    {shop.map_link && (
                                        <div className="pt-5 mt-4 border-t border-slate-100">
                                            <a
                                                href={shop.map_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-bold text-sm w-full py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                View on Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
