import React, { useState, useEffect, useRef } from 'react';
import { Mail, MessageSquare, Send, PhoneCall, Clock, User, X, Search, ChevronRight, MoreVertical, Shield } from 'lucide-react';

export default function Messaging({ user, initialContact = null }) {
    // Shared State
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [history, setHistory] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null); // The user we are chatting with
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    // Search State
    // Search State
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Role Filter State
    const [filterRole, setFilterRole] = useState('All');
    const scrollRef = useRef(null);

    // Initial Contact Effect
    useEffect(() => {
        if (initialContact) {
            setSelectedContact({
                username: initialContact.username,
                role: initialContact.role || 'user',
                last_message: '',
                last_timestamp: null
            });
        }
    }, [initialContact]);

    // Poll Contacts & Messages
    useEffect(() => {
        fetchContacts();
        const interval = setInterval(fetchContacts, 10000); // 10s poll for new contacts
        return () => clearInterval(interval);
    }, [user, filterRole]); // Re-fetch when filter changes

    // Search Users Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            performSearch();
        }, 300); // Reduced delay for faster response

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);


    const performSearch = async () => {
        // If query is empty, don't search (unless we are trying to list all experts, handled elsewhere)
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            // Pass requester_role to enforce restrictions
            const res = await fetch(`http://localhost:5000/api/chat/search?q=${searchQuery}&requester_role=${user.role}`);
            if (res.ok) {
                const data = await res.json();
                // Filter out self
                setSearchResults(data.filter(u => u.username !== user.username));
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const startNewChat = (contact) => {
        setSelectedContact({
            username: contact.username,
            role: contact.role,
            last_message: '',
            last_timestamp: null
        });
        setShowSearch(false);
        setSearchQuery('');
    };

    // Poll messages for selected contact
    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, selectedContact]);

    const fetchContacts = async () => {
        try {
            // 1. Fetch Chat History (Existing contacts)
            const resHistory = await fetch(`http://localhost:5000/api/chat/users?username=${user.username}&role=${user.role}`);
            let historyContacts = [];
            if (resHistory.ok) {
                historyContacts = await resHistory.json();
            }

            // 2. If 'Expert' filter is active, fetch ALL experts
            let allExperts = [];
            if (filterRole === 'Expert') {
                const resExperts = await fetch(`http://localhost:5000/api/chat/search?role=expert&requester_role=${user.role}`);
                if (resExperts.ok) {
                    allExperts = await resExperts.json();
                }
            }

            // 3. Merge Lists
            // Start with history
            let mergedList = [...historyContacts];

            // If we fetched experts, add any that aren't already in history
            if (filterRole === 'Expert') {
                const existingUsernames = new Set(historyContacts.map(c => c.username));
                allExperts.forEach(expert => {
                    if (!existingUsernames.has(expert.username) && expert.username !== user.username) {
                        mergedList.push({
                            username: expert.username,
                            role: 'expert',
                            specialization: expert.specialization, // Pass specialization
                            profile_image: expert.profile_image, // Pass profile image
                            last_message: 'Start a conversation', // Placeholder
                            last_timestamp: null, // No timestamp means it will sort to bottom or be handled
                            unread_count: 0
                        });
                    }
                });
            }

            // Sort: Users with timestamps (recent) first, then others
            mergedList.sort((a, b) => {
                const timeA = a.last_timestamp ? new Date(a.last_timestamp).getTime() : 0;
                const timeB = b.last_timestamp ? new Date(b.last_timestamp).getTime() : 0;
                return timeB - timeA;
            });

            setContactList(mergedList);

            // 4. If 'Farmer' filter is active, fetch ALL farmers (users/farmers)
            if (filterRole === 'Farmer') {
                const resFarmers = await fetch(`http://localhost:5000/api/chat/search?role=farmer&requester_role=${user.role}`);
                if (resFarmers.ok) {
                    const allFarmers = await resFarmers.json();
                    const existingUsernames = new Set(mergedList.map(c => c.username));

                    const farmersToAdd = [];
                    allFarmers.forEach(farmer => {
                        if (!existingUsernames.has(farmer.username) && farmer.username !== user.username) {
                            farmersToAdd.push({
                                username: farmer.username,
                                role: farmer.role || 'user', // Ensure role is set
                                profile_image: farmer.profile_image,
                                last_message: 'Start a conversation',
                                last_timestamp: null,
                                unread_count: 0
                            });
                        }
                    });

                    setContactList([...mergedList, ...farmersToAdd]);
                } else {
                    setContactList(mergedList);
                }
            } else {
                setContactList(mergedList);
            }

        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            let url = `http://localhost:5000/messages?username=${user.username}&role=${user.role}`;

            if (selectedContact) {
                url += `&contact=${selectedContact.username}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const myMessages = await res.json();
                setHistory(myMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedContact) return;

        try {
            let body = {
                sender: user.username,
                content: message,
                recipient: selectedContact.username,
                recipient_type: selectedContact.role === 'admin' ? 'admin' : (selectedContact.role === 'expert' ? 'official' : 'user')
            };

            const res = await fetch('http://localhost:5000/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setSent(true);
                setMessage('');
                fetchMessages();
                fetchContacts(); // Update last message preview
                setTimeout(() => setSent(false), 3000);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const markAsRead = async (contact) => {
        if (!contact) return;
        try {
            await fetch('http://localhost:5000/api/chat/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    role: user.role,
                    sender: contact.username
                })
            });
            // Update local state to remove badge immediately
            setContactList(prev => prev.map(c =>
                c.username === contact.username ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    // Trigger mark read when selecting a contact
    useEffect(() => {
        if (selectedContact) {
            markAsRead(selectedContact);
        }
    }, [selectedContact]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-80px)]">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white overflow-hidden h-full flex flex-col md:flex-row relative z-10">
                {/* Decorative background blurs inside the container */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

                {/* LEFT PANEL: Contact List */}
                <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-slate-100 bg-white/50 backdrop-blur-xl relative z-10`}>
                    {/* Header with Persistent Search */}
                    <div className="p-5 bg-white border-b border-slate-100 flex flex-col gap-4 sticky top-0 z-20 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-extrabold flex items-center gap-3 text-slate-800 tracking-tight">
                                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl shadow-inner text-emerald-600">
                                    <MessageSquare className="w-6 h-6 outline-none" />
                                </div>
                                {user.role === 'admin' ? 'Messages' : user.role === 'expert' ? 'Consultations' : 'My Chats'}
                            </h2>
                        </div>

                        {/* Persistent Search and New Chat Input */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.length === 0) setSearchResults([]);
                                }}
                                placeholder="Search or type new username..."
                                className="relative w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-inner"
                                onFocus={() => {
                                    if (!searchQuery) performSearch();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        startNewChat({ username: searchQuery.trim(), role: 'user' });
                                    }
                                }}
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />

                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Role Filter Buttons */}
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                            {['All', 'Farmer', 'Expert', 'Admin']
                                .filter(r => {
                                    // Remove 'Admin' from tabs (handled by button)
                                    if (r === 'Admin') return false;
                                    // Remove 'Farmer' tab for Farmers (cannot chat with other farmers)
                                    if (r === 'Farmer') return user.role === 'admin' || user.role === 'expert';
                                    // Remove 'Expert' tab for Experts (cannot chat with other experts)
                                    if (r === 'Expert') return user.role === 'admin' || user.role !== 'expert';
                                    return true;
                                })
                                .map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setFilterRole(role)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${filterRole === role
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                        </div>

                        {/* Direct Contact Admin Button (For Farmers/Experts) */}
                        {user.role !== 'admin' && (
                            <button
                                onClick={() => startNewChat({ username: 'admin', role: 'admin' })}
                                className="mt-1 w-full py-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-emerald-200 shadow-sm group hover:shadow-md hover:-translate-y-0.5"
                            >
                                <Shield className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                Contact Admin
                            </button>
                        )}

                        {/* Search Results Dropdown (if searching) */}
                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-20 max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => startNewChat({ username: searchQuery.trim(), role: 'user' })}
                                    className="w-full text-left p-3 hover:bg-nature-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                                >
                                    <div className="w-8 h-8 rounded-full bg-nature-100 flex items-center justify-center text-nature-600">
                                        <Send className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-800">Message "{searchQuery}"</div>
                                        <div className="text-xs text-nature-600">Start new chat</div>
                                    </div>
                                </button>

                                {isSearching ? (
                                    <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
                                ) : searchResults.map(u => (
                                    <button
                                        key={u.username}
                                        onClick={() => startNewChat(u)}
                                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        {u.profile_image ? (
                                            <img
                                                src={`http://localhost:5000/uploads/${u.profile_image}`}
                                                alt={u.username}
                                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{u.username}</div>
                                            <div className="text-xs text-slate-500 capitalize">{u.role}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {contactList.filter(c => {
                            if (filterRole === 'All') return true;
                            if (filterRole === 'Farmer') return c.role === 'user' || c.role === 'farmer';
                            const roleMap = { 'Expert': 'expert', 'Admin': 'admin' };
                            return c.role === roleMap[filterRole];
                        }).length > 0 ? (
                            contactList
                                .filter(c => {
                                    if (filterRole === 'All') return true;
                                    if (filterRole === 'Farmer') return c.role === 'user' || c.role === 'farmer';
                                    const roleMap = { 'Expert': 'expert', 'Admin': 'admin' };
                                    return c.role === roleMap[filterRole];
                                })
                                .map((contact) => {
                                    const isSelected = selectedContact?.username === contact.username;
                                    return (
                                        <button
                                            key={contact.username}
                                            onClick={() => setSelectedContact(contact)}
                                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border group relative overflow-hidden flex items-start gap-4 ${isSelected
                                                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-transparent shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 scale-[1.02]'
                                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                {contact.profile_image ? (
                                                    <img
                                                        src={`http://localhost:5000/uploads/${contact.profile_image}`}
                                                        alt={contact.username}
                                                        className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${isSelected ? 'border-white/50 shadow-inner' : 'border-slate-100 group-hover:border-emerald-200'}`}
                                                    />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-inner border-2 transition-all duration-300 ${isSelected ? 'bg-white/20 text-white border-white/50' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 border-slate-100 group-hover:border-emerald-200 group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:text-emerald-700'}`}>
                                                        {contact.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <span className={`font-bold text-base truncate pr-2 ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-emerald-700'} transition-colors`}>
                                                        {contact.username}
                                                    </span>
                                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                        {contact.last_timestamp && (
                                                            <span className={`text-[11px] font-semibold tracking-wide ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                                {new Date(contact.last_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                        {contact.unread_count > 0 && !isSelected && (
                                                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/30 animate-pulse">
                                                                {contact.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-1">
                                                    {contact.role === 'expert' && contact.specialization && (
                                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm truncate max-w-[120px] transition-colors ${isSelected ? 'bg-white/20 text-white border border-white/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                                                            {contact.specialization}
                                                        </span>
                                                    )}
                                                    <p className={`text-sm truncate flex-1 font-medium ${isSelected ? 'text-emerald-50/90' : (!isSelected && contact.unread_count > 0) ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                                        {contact.last_message || 'Start a conversation...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No active conversations.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Chat Window */}
                <div className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full bg-slate-50/30 relative z-10`}>
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm flex items-center justify-between z-20 sticky top-0">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedContact(null)}
                                        className="md:hidden p-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow rounded-full text-slate-600 transition-all active:scale-95"
                                    >
                                        <ChevronRight className="w-6 h-6 rotate-180" />
                                    </button>

                                    <div className="relative">
                                        {selectedContact.profile_image ? (
                                            <img
                                                src={`http://localhost:5000/uploads/${selectedContact.profile_image}`}
                                                alt={selectedContact.username}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-100"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 border-2 border-white shadow-md ring-1 ring-slate-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                                                {selectedContact.username[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg text-slate-900 leading-tight">{selectedContact.username}</h3>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="capitalize">{selectedContact.role || 'User'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm hover:shadow rounded-full transition-all">
                                        <PhoneCall className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 shadow-sm hover:shadow rounded-full transition-all">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
                                {history.length > 0 ? (
                                    history.map((msg, i) => {
                                        const isMe = msg.sender === user.username;
                                        return (
                                            <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`} style={{ animationDuration: '0.3s' }}>
                                                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-5 py-3.5 rounded-3xl shadow-sm text-[15px] leading-relaxed break-words relative group transition-all hover:shadow-md ${isMe
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm shadow-emerald-500/20'
                                                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-slate-200/50'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${isMe ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <span className="text-emerald-500">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 relative z-10">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl ring-8 ring-slate-50/50 relative">
                                                <MessageSquare className="w-10 h-10 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">It's quiet here...</h3>
                                        <p className="text-sm text-slate-500 font-medium">Send a message to break the ice!</p>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 md:px-6 md:py-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-20">
                                <form onSubmit={handleSend} className="flex gap-3 items-end">
                                    <div className="flex-1 relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="relative w-full pl-6 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all shadow-inner text-slate-700 placeholder:text-slate-400 font-medium text-[15px]"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="relative bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-400 disabled:opacity-70 disabled:cursor-not-allowed text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0.5 border border-white/20"
                                    >
                                        <Send className={`w-5 h-5 transition-transform ${message.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-50/50 relative overflow-hidden">
                            {/* Decorative background blurs */}
                            <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                            <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-70 animate-pulse"></div>
                                    <div className="w-28 h-28 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/10 ring-8 ring-white/50 border border-emerald-100">
                                        <Mail className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce pointer-events-none">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Welcome, {user.username}!</h3>
                                <p className="max-w-sm text-slate-500 text-base leading-relaxed font-medium">
                                    Select a conversation from the left sidebar to start chatting, or discover new people to connect with.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
