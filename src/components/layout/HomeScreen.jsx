import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Plus, Users, Star, RefreshCw, Camera } from 'lucide-react';
import PeopleList from './PeopleList';

const HomeScreen = ({
    sidebarList,
    persone,
    getLastGift,
    amazonSuggestions,
    openNewPersonModal,
    openNewGiftModal,
    handleSidebarClick,
    handleRefreshAmazonSuggestions,
    selectedUid,
    setShowPeopleList
}) => {
    const soonestDay = sidebarList.length > 0 ? Math.min(...sidebarList.map(p => p.nextEvent.days)) : null;
    const soonestPeopleRaw = sidebarList.filter(p => p.nextEvent.days === soonestDay);
    const soonestPeople = soonestPeopleRaw.slice(0, 5);
    const displayCount = soonestPeople.length;
    const totalSoonestCount = soonestPeopleRaw.length;

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (soonestPeople.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % soonestPeople.length);
            }, 2000);
            return () => clearInterval(timer);
        }
    }, [soonestPeople]);

    if (sidebarList.length === 0) {
        return (
            <div className="p-6 bg-slate-50 h-full flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold mb-2">Benvenuto in Regalario!</h1>
                <p className="text-gray-600 mb-8">Sembra che tu non abbia ancora aggiunto nessuno. Inizia creando una scheda persona.</p>
                <button
                    onClick={openNewPersonModal}
                    className="px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 hover:opacity-90 transition bg-indigo-600 text-white"
                >
                    <Plus size={18} />
                    <span>Crea la tua prima scheda</span>
                </button>
            </div>
        );
    } 

    const nextEvent = soonestPeople.length > 0 ? {
        ...soonestPeople[currentSlide], // Use the current slide person for initial display
        lastGift: getLastGift(soonestPeople[currentSlide].id, soonestPeople[currentSlide].nextEvent.tipo),
    } : null;
    
    const remainingSoonest = soonestPeopleRaw.slice(5);
    const otherUpcoming = sidebarList.filter(p => p.nextEvent.days !== soonestDay);
    const upcomingEvents = [...remainingSoonest, ...otherUpcoming].slice(0, 3);
    const visibleInUpcomingFromSoonest = upcomingEvents.filter(p => p.nextEvent.days === soonestDay).length;
    const hiddenSoonestCount = totalSoonestCount - soonestPeople.length - visibleInUpcomingFromSoonest;

    return (
        <div className="p-6 bg-slate-50 h-full overflow-y-auto flex-1 custom-scroll">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-6 mb-6">
                    {/* Left Column: Action Buttons */}
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                        <button onClick={openNewPersonModal} className="bg-white text-center p-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 transition">
                            <Users className="mx-auto mb-2 text-indigo-500" size={24} />
                            <span className="font-bold text-sm text-gray-700">Nuova Persona</span>
                        </button>
                        <button onClick={openNewGiftModal} className="bg-white text-center p-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 transition">
                            <Gift className="mx-auto mb-2 text-amber-500" size={24} />
                            <span className="font-bold text-sm text-gray-700">Nuovo Regalo</span>
                        </button>
                        <button onClick={() => setShowPeopleList(true)} className="bg-white text-center p-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 transition lg:hidden">
                            <Users className="mx-auto mb-2 text-green-500" size={24} />
                            <span className="font-bold text-sm text-gray-700">Persone</span>
                        </button>
                    </div>

                    {/* Right Column: In Scadenza & Prossimi Eventi */}
                    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 min-h-[230px]">
                        {/* Left: Next Event Details - In Scadenza */}
                        {soonestPeople.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[230px]">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    In Scadenza {totalSoonestCount > 1 && `(${totalSoonestCount})`}
                                </h2>
                                <div className="flex items-start sm:items-start gap-6">
                                    <div className="flex flex-col items-center flex-shrink-0 w-24">
                                        <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                            {nextEvent.foto ? (
                                                <img
                                                    src={nextEvent.foto}
                                                    alt={nextEvent.nome}
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 scale-110"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-indigo-600 scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center" onClick={() => handleSidebarClick(nextEvent)}>
                                            <div className={`${nextEvent.nextEvent.days === 0 ? 'text-3xl' : 'text-5xl'} font-bold`} style={{ color: nextEvent.nextEvent.days < 14 ? '#E53E3E' : '#38A169' }}>
                                                {nextEvent.nextEvent.days === 0 ? 'OGGI!' : nextEvent.nextEvent.days}
                                            </div>
                                            {nextEvent.nextEvent.days !== 0 && (
                                                <div className="text-sm font-bold text-gray-500">Giorni</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-px bg-gray-200 self-stretch hidden sm:block"></div>
                                    <div className="flex-grow cursor-pointer" onClick={() => handleSidebarClick(soonestPeople[currentSlide])}>
                                        <div className="mb-4">
                                            {displayCount > 1 ? (
                                                <>
                                                    <div className="relative h-7 overflow-hidden leading-tight mb-1">
                                                        {soonestPeople.map((person, index) => (
                                                            <p
                                                                key={person.id}
                                                                className={`absolute w-full text-xl font-bold transition-all duration-500 ease-in-out
                                                                    ${index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                                                                style={{ left: `${(index - currentSlide) * 100}%` }}
                                                            >
                                                                {person.nome}
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-0">{soonestPeople[currentSlide].relazione}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xl font-bold leading-tight mb-1">{nextEvent.nome}</p>
                                                    <p className="text-sm text-gray-500 mb-0">{nextEvent.relazione}</p>
                                                </>
                                            )}
                                            {displayCount > 1 && (
                                                <div className="flex justify-center gap-2 mt-2">
                                                    {soonestPeople.map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`block w-2 h-2 rounded-full cursor-pointer transition-colors
                                                                ${idx === currentSlide ? 'bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                                                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); handleSidebarClick(soonestPeople[idx]); }}
                                                        ></span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                                            <span className="flex items-center gap-1.5 bg-indigo-100 text-indigo-600 font-bold px-3 py-1 rounded-full">
                                                <Calendar size={14} />
                                                {nextEvent.nextEvent.tipo}
                                            </span>
                                            {nextEvent.lastGift && nextEvent.occorrenza && <span className="font-medium text-gray-600">{nextEvent.occorrenza}</span>}
                                        </div>
                                        {nextEvent.lastGift ? (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-xs text-gray-400 font-semibold">Ultimo regalo ({nextEvent.lastGift.anno}):</p>
                                                <p className="font-semibold text-gray-700">{nextEvent.lastGift.oggetto}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="font-semibold text-sm mb-1">Nessun regalo per l'occasione.</p>
                                                <p className="text-xs text-gray-400 font-semibold">Fatti ispirare dai consigli qui sotto!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right: Upcoming Events - Prossimi Eventi */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Prossimi Eventi</h2>
                            <div className="space-y-2">
                                {upcomingEvents.map((event, i) => (
                                    <div key={i} className="flex items-center justify-between cursor-pointer group" onClick={() => handleSidebarClick(event)}>
                                        <div className="w-3/4">
                                            <p className="font-bold group-hover:text-indigo-600 transition truncate">{event.nome}</p>
                                            <p className="text-sm text-gray-500">{event.nextEvent.tipo}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className={`font-bold text-lg ${event.nextEvent.days < 14 ? 'text-red-600' : 'text-green-600'}`}>
                                                {event.nextEvent.days}gg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hiddenSoonestCount > 0 && (
                                <div className="mt-3 text-center text-sm text-gray-500 font-bold">
                                    + {hiddenSoonestCount} {hiddenSoonestCount > 1 ? 'altre persone' : 'altra persona'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="my-6 text-center">
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client="ca-pub-YOUR_ADSENSE_CLIENT_ID"
                         data-ad-slot="YOUR_ADSENSE_SLOT_ID"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                </div>

                {amazonSuggestions && amazonSuggestions.length > 0 && (
                    <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{ backgroundColor: '#FE6100' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-5 invert" />
                               <span>I più desiderati al Black Friday</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefreshAmazonSuggestions}
                                    className="text-sm font-bold text-white hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw size={14} /> Rinnova
                                </button>
                                <a href="https://www.amazon.it/most-wished-for?tag=lideo-21" target="_blank" rel="noreferrer" className="text-sm font-bold text-white hover:underline">Vedi tutti</a>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {amazonSuggestions.map((item, i) => (
                                <a key={i} href={item.link} target="_blank" rel="noreferrer" className="group bg-white/20 p-2 rounded-lg flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-md flex-shrink-0 bg-white flex items-center justify-center p-1 overflow-hidden">
                                        {item.img ? (
                                            <img src={item.img} alt={item.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white group-hover:text-gray-200 transition">{item.nome}</p>
                                        <div className="flex items-center text-xs text-white mt-1">
                                            <Star size={12} fill="currentColor" />
                                            <Star size={12} fill="currentColor" />
                                            <Star size={12} fill="currentColor" />
                                            <Star size={12} fill="currentColor" />
                                            <Star size={12} className="text-gray-300" fill="currentColor" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;