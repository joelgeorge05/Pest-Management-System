import React, { useState, useEffect } from 'react';
import { Calculator, X, Droplets, Sprout, ArrowRight } from 'lucide-react';

export default function DosageCalculator({ isOpen, onClose, initialMetadata }) {
    if (!isOpen) return null;

    // Dosage parameters (from description)
    const [doseAmount, setDoseAmount] = useState(10);
    const [doseUnit, setDoseUnit] = useState('ml');
    const [baseAmount, setBaseAmount] = useState(1);
    const [baseUnit, setBaseUnit] = useState('L');

    // User input
    const [targetAmount, setTargetAmount] = useState('');

    // Results
    const [totalMed, setTotalMed] = useState(0);

    // Initialize with smart defaults from metadata
    useEffect(() => {
        if (initialMetadata) {
            console.log("Applying metadata:", initialMetadata);
            if (initialMetadata.amount) setDoseAmount(initialMetadata.amount);
            if (initialMetadata.unit) setDoseUnit(initialMetadata.unit);
            if (initialMetadata.baseAmount) setBaseAmount(initialMetadata.baseAmount);
            if (initialMetadata.baseUnit) setBaseUnit(initialMetadata.baseUnit);
        }
    }, [initialMetadata, isOpen]);

    useEffect(() => {
        calculate();
    }, [targetAmount, doseAmount, baseAmount]);

    const calculate = () => {
        if (!targetAmount || isNaN(targetAmount)) {
            setTotalMed(0);
            return;
        }

        const ratio = parseFloat(targetAmount) / parseFloat(baseAmount);

        // Medicine Calculation
        setTotalMed((parseFloat(doseAmount) * ratio).toFixed(2));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-slate-200">
                {/* Header */}
                <div className="bg-nature-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Dosage Calculator</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Medicine Description</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded font-bold text-slate-800 shadow-sm">{doseAmount} {doseUnit}</span>
                                <span>per</span>
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded font-bold text-blue-600 shadow-sm">{baseAmount} {baseUnit}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Total Area of Land in Cents
                            </label>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={e => setTargetAmount(e.target.value)}
                                placeholder={`e.g. 10, 50, 100`}
                                className="w-full text-lg font-bold p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nature-500 outline-none"
                                autoFocus
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Enter total area of your land in cents.
                            </p>
                        </div>
                    </div>

                    {/* Results */}
                    {totalMed > 0 && (
                        <div className="bg-nature-50 border border-nature-100 rounded-xl p-5 animate-slide-up">
                            <h4 className="text-center text-nature-800 font-bold mb-4 flex items-center justify-center gap-2">
                                <ArrowRight className="w-4 h-4" /> Medicine Required for {targetAmount} {baseUnit}
                            </h4>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-nature-700">
                                        {totalMed} <span className="text-base font-medium text-nature-600">{doseUnit}</span>
                                    </div>
                                    <div className="text-xs text-nature-500 uppercase mt-1 font-bold">Medicine / Fertilizer</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
