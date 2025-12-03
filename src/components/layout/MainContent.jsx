import React, { useState } from 'react';
import { Gift, Calendar, Plus, Trash, Pencil, Lightbulb, RefreshCw, Search, Calculator, Link as LinkIcon, ExternalLink, ShoppingBag, Euro, Clock, Users, Camera, X } from 'lucide-react';
import { AdUnit, GiftImage } from '../ui/Shared';
import HomeScreen from './HomeScreen';
import { truncateText } from '../../utils/helpers';

const MainContent = (props) => {
    const {
        activePerson,
        openEditPersonModal,
        openNewPersonModal,
        openNewGiftModal,
        themeStyles,
        headerInfo,
        handleSelectUid,
        currentTheme,
        handleArchive,
        setShowModalStats,
        updateSuggestions,
        activeTab,
        suggerimenti,
        handleTabChange,
        setShowAddEventModal,
        searchTerm,
        setSearchTerm,
        getFilteredGifts,
        calcolaOccorrenza,
        openEditGiftModal,
        handleDeleteSingleGift,
        formatFixedDate,
        handleDeleteEventFromTab
    } = props;

    const [showParticipantsTooltip, setShowParticipantsTooltip] = useState(false);
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    if (!activePerson) {
        return <HomeScreen {...props} />;
    }

    return (
        <main className="flex-1 bg-slate-50 h-2/3 md:h-full overflow-y-scroll p-6 relative custom-scroll">
            {showParticipantsTooltip && (
                <div
                    className="fixed bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg z-50 max-w-xs"
                    style={{ left: tooltipPosition.x, top: tooltipPosition.y, transform: 'translateY(-100%)' }}
                >
                    {tooltipContent}
                </div>
            )}
            <div className="max-w-4xl mx-auto pb-20 fade-in">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        {activePerson.foto ? (
                            <img 
                                src={activePerson.foto}
                                alt={activePerson.nome} 
                                className="w-16 h-16 rounded-full object-cover border-4"
                                style={{ borderColor: currentTheme.primary }}
                            />
                        ) : (
                            <div 
                                className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-4"
                                style={{ borderColor: currentTheme.primary }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold">{truncateText(activePerson.nome, 30)}</h2>
                                <button onClick={openEditPersonModal} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition" title="Modifica">
                                    <Pencil size={20} />
                                </button>
                                <span className="text-xs px-2 py-1 rounded font-bold uppercase" style={themeStyles.accentBg}>
                                    {activePerson.relazione}
                                </span>
                            </div>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <Calendar size={16} />
                                <span>
                                    {headerInfo.date ? (headerInfo.isFixed ? formatFixedDate(headerInfo.date) : new Date(headerInfo.date).toLocaleDateString()) : "--"} ({headerInfo.type})
                                </span>
                            </p>
                            <div className="min-h-[2.5rem]">
                                {headerInfo.partnerUid && (
                                    <button onClick={() => handleSelectUid(headerInfo.partnerUid, headerInfo.partnerType)} className="flex items-center gap-1 text-sm hover:underline font-medium" style={{ color: currentTheme.secondary }}>
                                        <LinkIcon size={14} /> Partner: {headerInfo.partnerName}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-4 mb-6">
                    <div className="flex-grow sm:w-4/5 sm:flex-grow-0">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <button onClick={openNewPersonModal} className="bg-white text-center p-4 rounded-xl shadow-sm border border-gray-300 hover:bg-gray-100 transition w-full h-full">
                                <Users className="mx-auto mb-2 text-indigo-500" size={24} />
                                <span className="font-bold text-sm text-gray-700">Nuova Persona</span>
                            </button>
                            <button onClick={openNewGiftModal} className="bg-white text-center p-4 rounded-xl shadow-sm border border-gray-300 hover:bg-gray-100 transition w-full h-full">
                                <Gift className="mx-auto mb-2 text-amber-500" size={24} />
                                <span className="font-bold text-sm text-gray-700">Nuovo Regalo</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-shrink-0 sm:w-1/5">
                        <div className="flex flex-col gap-2 h-full">
                            <button onClick={() => setShowModalStats(true)} className="bg-white border border-gray-300 px-4 rounded-lg font-bold shadow-sm flex items-center gap-2 justify-center hover:bg-gray-100 transition flex-1">
                                <Calculator size={18} />
                            </button>
                            <button onClick={handleArchive} className="bg-white border border-gray-300 text-gray-400 hover:text-red-600 px-3 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center justify-center flex-1">
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-500 text-white text-center p-2 mb-4 rounded-lg shadow-md font-bold">
                    È la settimana del Black Friday! Offerte imperdibili su Amazon.
                </div>
                <div className="border border-gray-200 rounded-xl p-5 mb-8" style={{ backgroundColor: currentTheme.accent }}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold flex items-center gap-2" style={{ color: currentTheme.textAccent }}>
                            <Lightbulb size={18} /> Ti consiglio di regalare: <span className="underline">{activeTab}</span>
                        </h3>
                        <button onClick={() => updateSuggestions(activeTab)} className="flex-shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded hover:opacity-70 transition" style={{ color: currentTheme.textAccent }}>
                            <RefreshCw size={12} /> Rinnova
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggerimenti.slice(0, 4).map((s, i) => (
                            <a
                                key={i}
                                href={s.link}
                                target="_blank" rel="noreferrer"
                                className="bg-white border border-gray-200 p-2 rounded-lg hover:shadow-md transition flex items-center gap-3"
                                style={s.link && s.link.includes('amazon.it') ? { backgroundColor: '#fe6100ff', color: 'white' } : {}}
                            >
                                <div className="w-16 h-16 rounded-md flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {s.img ? (
                                        <img src={s.img} alt={s.nome} className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={24} className="text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-sm" style={s.link && s.link.includes('amazon.it') ? { color: 'white' } : { color: currentTheme.primary }}>{truncateText(s.nome, 50)}</span>
                                </div>
                                <ExternalLink size={16} className="text-gray-400" style={s.link && s.link.includes('amazon.it') ? { color: 'white' } : {}} />
                            </a>
                        ))}
                    </div>
                </div>

                <AdUnit />

                <div className="flex items-center gap-2 mb-4 pt-2 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => handleTabChange("Tutti")} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${activeTab === "Tutti" ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}`} style={activeTab === "Tutti" ? { backgroundColor: currentTheme.primary } : {}}>
                        Tutti
                    </button>
                    {activePerson.eventi.filter(e => !e.archived).map((e, eIdx) => (
                        <div key={e.tipo} className="relative group">
                            <button onClick={() => handleTabChange(e.tipo)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${activeTab === e.tipo ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}`} style={activeTab === e.tipo ? { backgroundColor: currentTheme.primary } : {}}>
                                {e.tipo}
                            </button>
                            {!e.is_fixed && (
                                <button
                                    onClick={(evt) => {
                                        evt.stopPropagation();
                                        handleDeleteEventFromTab(activePerson.id, eIdx);
                                    }}
                                    className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 transition-opacity z-10 ${activeTab === e.tipo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    title={`Elimina ${e.tipo}`}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={() => setShowAddEventModal(true)} className="px-3 py-2 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:bg-gray-100 transition">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: currentTheme.primary }}>
                            <Gift /> {activeTab === "Tutti" ? "Tutti i Regali" : `Regali per ${activeTab}`}
                        </h3>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none w-48" placeholder="Cerca regalo..." />
                        </div>
                    </div>
                    {getFilteredGifts().length > 0 ? (
                        getFilteredGifts().map((r, i) => {
                            const occ = calcolaOccorrenza(r._evtData, r.anno, r._evtTipo);
                            return (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-row gap-4 group relative min-h-[100px]">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                                        <GiftImage src={r.img} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg">{r.oggetto}</h4>
                                                {activeTab === "Tutti" && <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.secondary }}>{r._evtTipo}</span>}
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ml-auto">
                                                    <Clock size={12} /> {r.anno}
                                                </span>
                                                {occ && <span className="block text-[10px] mt-1" style={{ color: currentTheme.secondary }}>Per {occ}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                            {(r.negozio || r.link) && (
                                                <span className="flex items-center gap-1">
                                                    <ShoppingBag size={14} /> {r.link ? (<a href={r.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5 font-medium" style={{ color: currentTheme.secondary }}>{r.negozio || "Link"} <ExternalLink size={10} /></a>) : r.negozio}
                                                </span>
                                            )}
                                            {r.prezzo > 0 && <span className="flex items-center gap-1 font-bold text-green-600"><Euro size={14} /> {r.prezzo.toFixed(2)}</span>}
                                            {r.partecipanti && (
                                                <span 
                                                    className="flex items-center gap-1 text-gray-600 cursor-pointer relative"
                                                    onClick={(e) => {
                                                        setTooltipContent(r.partecipanti);
                                                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                                                        setShowParticipantsTooltip(true);
                                                    }}
                                                    onMouseLeave={() => setShowParticipantsTooltip(false)}
                                                >
                                                    <Users size={14} /> 
                                                    {truncateText(r.partecipanti, 45)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 flex justify-end gap-2 bg-white/90 p-1 rounded-lg shadow-sm sm:absolute sm:bottom-3 sm:right-3 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                            <button onClick={() => openEditGiftModal(r, r._rIdx, r._eIdx, r._evtTipo)} className="p-1.5 bg-gray-100 rounded hover:bg-gray-100 transition">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteSingleGift(r._rIdx, r._eIdx)} className="p-1.5 bg-gray-100 text-red-600 rounded hover:bg-red-100">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-500">
                            Nessun regalo trovato per {activeTab === "Tutti" ? "questa persona" : activeTab}.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MainContent;