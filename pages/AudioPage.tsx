import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, BookOpen, Play, ChevronLeft, Crown, Headphones } from 'lucide-react';
import { ApiService } from '../services/apiService';

interface AudioItem {
    _id?: string;
    title: string;
    author: string;
    coverImage?: string;
    audioUrl: string;
    duration?: number;
    order: number;
}

interface Playlist {
    _id: string;
    title: string;
    author: string;
    description?: string;
    coverImage?: string;
    category: 'Music' | 'Stories' | 'Devotionals' | 'Other';
    type: 'Song' | 'Audiobook';
    items: AudioItem[];
    status: 'draft' | 'published';
    playCount: number;
}

const AudioPage: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/playlists');
            const data = await response.json();
            // Only show published playlists
            setPlaylists(data.filter((p: Playlist) => p.status === 'published'));
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Music', 'Stories', 'Devotionals', 'Other'];

    const filteredPlaylists = selectedCategory === 'All'
        ? playlists
        : playlists.filter(p => p.category === selectedCategory);

    const handlePlaylistClick = (playlistId: string) => {
        navigate(`/audio/playlist/${playlistId}`);
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-[#fdf6e3]">
            {/* TOP SECTION - WOOD BACKGROUND */}
            <div className="relative pb-8 shadow-2xl z-10 overflow-hidden shrink-0 w-full">
                {/* Vertical Wood Plank Pattern */}
                <div className="absolute inset-0 bg-[#8B4513]" style={{
                    backgroundImage: `repeating-linear-gradient(
                        90deg, 
                        #a05f2c 0%, #a05f2c 14%, 
                        #3e1f07 14%, #3e1f07 15%, 
                        #c28246 15%, #c28246 29%, 
                        #3e1f07 29%, #3e1f07 30%, 
                        #945829 30%, #945829 49%, 
                        #3e1f07 49%, #3e1f07 50%, 
                        #b06d36 50%, #b06d36 74%, 
                        #3e1f07 74%, #3e1f07 75%,
                        #a05f2c 75%, #a05f2c 100%
                    )`
                }}></div>

                {/* Subtle Grain Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}>
                </div>

                {/* Header Icons */}
                <div className="relative z-20 flex justify-between items-center px-4 pt-6 pb-2">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/home')}
                        className="w-12 h-12 bg-[#90be6d] rounded-full border-4 border-[#f3e5ab] overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.3)] relative flex items-center justify-center transform transition-transform active:scale-95 group"
                    >
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent mr-1"></div>
                    </button>

                    {/* Crown Icon */}
                    <div className="bg-[#fdf6e3] px-4 py-1 rounded-full border-b-4 border-[#d4c5a0] shadow-lg flex items-center justify-center">
                        <Crown className="text-[#8B4513]" size={24} fill="#8B4513" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="relative z-20 px-6 pt-4 pb-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Headphones className="w-10 h-10 text-[#f3e5ab]" />
                        <h1 className="text-4xl font-black text-[#fdf6e3] drop-shadow-lg font-display">
                            Audio Library
                        </h1>
                    </div>
                    <p className="text-[#e2cba5] font-medium text-lg">
                        Songs, Stories & More
                    </p>
                </div>

                {/* Category Filter */}
                <div className="relative z-20 px-4 pb-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2 ${selectedCategory === category
                                        ? 'bg-[#fdf6e3] text-[#8B4513] border-[#d4c5a0] shadow-lg'
                                        : 'bg-[#5c2e0b]/50 text-[#e2cba5] border-[#3e1f07] hover:bg-[#5c2e0b]/70'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-1 w-full px-6 pt-8 pb-32">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B4513]"></div>
                    </div>
                ) : filteredPlaylists.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border-2 border-[#d4c5a0] text-center">
                        <Music className="w-16 h-16 text-[#8B4513] mx-auto mb-4 opacity-50" />
                        <p className="text-[#5c2e0b] text-lg font-bold mb-2">No playlists found</p>
                        <p className="text-[#8B4513]">Check back soon for new audio content!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {filteredPlaylists.map((playlist) => (
                            <div
                                key={playlist._id}
                                onClick={() => handlePlaylistClick(playlist._id)}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-[#d4c5a0] hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group"
                            >
                                {/* Cover Image */}
                                <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                    {playlist.coverImage ? (
                                        <img
                                            src={playlist.coverImage}
                                            alt={playlist.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {playlist.type === 'Song' ? (
                                                <Music className="w-24 h-24 text-white opacity-50" />
                                            ) : (
                                                <BookOpen className="w-24 h-24 text-white opacity-50" />
                                            )}
                                        </div>
                                    )}

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                                            <Play className="w-8 h-8 text-[#8B4513] ml-1" fill="#8B4513" />
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                                            {playlist.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-[#3E1F07] mb-1 truncate font-display">
                                        {playlist.title}
                                    </h3>
                                    <p className="text-sm text-[#8B4513] mb-2">{playlist.author}</p>
                                    <div className="flex items-center justify-between text-xs text-[#5c2e0b] opacity-75">
                                        <span>{playlist.items.length} {playlist.type === 'Song' ? 'songs' : 'episodes'}</span>
                                        <span>{playlist.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioPage;
