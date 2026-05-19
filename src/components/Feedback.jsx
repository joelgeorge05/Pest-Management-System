import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Feedback({ user }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [myFeedback, setMyFeedback] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchMyFeedback();
        }
    }, [user]);

    const fetchMyFeedback = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/feedback/my?user_id=${user.id || user._id}`); // Handle both id formats if inconsistent
            if (response.ok) {
                const data = await response.json();
                setMyFeedback(data);
            }
        } catch (err) {
            console.error("Error fetching feedback:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }
        if (!feedbackText.trim()) {
            setError("Please provide some feedback text");
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id || user._id,
                    username: user.username,
                    role: user.role,
                    rating: rating,
                    feedback: feedbackText
                })
            });

            if (response.ok) {
                setSuccess('Thank you for your feedback!');
                setRating(0);
                setFeedbackText('');
                fetchMyFeedback(); // Refresh list
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to submit feedback');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-nature-100">
                <h2 className="text-2xl font-bold text-nature-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Share Your Feedback
                </h2>
                <p className="text-nature-600 mb-6">
                    We value your input! Rate your experience and let us know how we can improve.
                </p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-nature-700 mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-nature-700 mb-2">Feedback</label>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows="4"
                            className="w-full rounded-lg border-nature-200 focus:border-nature-500 focus:ring-nature-500 bg-white/50"
                            placeholder="Tell us about your experience..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-nature-600 hover:bg-nature-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-nature-800">My Previous Feedback</h3>
                {loading ? (
                    <p className="text-center text-nature-600">Loading history...</p>
                ) : myFeedback.length === 0 ? (
                    <p className="text-center text-nature-500 italic bg-white/50 p-6 rounded-lg">No feedback submitted yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {myFeedback.map((item) => (
                            <div key={item._id} className="bg-white rounded-lg p-5 shadow-sm border border-nature-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-nature-400">{item.timestamp}</span>
                                </div>
                                <p className="text-nature-800 mb-3">{item.feedback}</p>

                                {item.admin_reply && (
                                    <div className="bg-nature-50 border-l-4 border-nature-500 p-3 rounded-r-lg mt-3">
                                        <p className="text-xs font-bold text-nature-600 mb-1">Admin Reply ({item.reply_timestamp})</p>
                                        <p className="text-sm text-nature-700">{item.admin_reply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
