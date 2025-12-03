import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Archive, Home, Users, Menu, LogOut, Gift, Search } from 'lucide-react';
import PeopleList from './PeopleList';

const logo = `${import.meta.env.BASE_URL}logo.png`;
const Sidebar = ({
    openNewPersonModal,
    openNewGiftModal,
    sidebarList,
    handleSidebarClick,
    handleHomeClick,
    selectedUid,
    setShowSettings,
    setShowArchive,
    showPeopleList,
    setShowPeopleList,
    handleLogout
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleMenuClick = (action) => {
        action();
        setMenuOpen(false);
    }

    const filteredPeople = sidebarList.filter(person => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesName = person.nome.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesRelation = person.relazione.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesEventType = person.eventi && person.eventi.some(event => event.tipo.toLowerCase().includes(lowerCaseSearchTerm));
        return matchesName || matchesRelation || matchesEventType;
    });

    return (
        <aside className="w-full md:w-90 bg-slate-50 border-r border-gray-200 flex flex-col h-auto md:h-full shadow-xl z-20">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                    <img src={logo} className="w-6 h-6 object-contain" alt="logo" /> Regalario
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={openNewPersonModal} className="p-1.5 rounded shadow hover:opacity-90 transition bg-indigo-600 text-white">
                        <Plus size={20} />
                    </button>
                    <button onClick={handleHomeClick} className="p-1.5 rounded shadow hover:opacity-90 transition bg-indigo-600 text-white">
                        <Home size={20} />
                    </button>
                    <div className="relative md:hidden" ref={menuRef}>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded shadow hover:opacity-90 transition bg-indigo-600 text-white">
                            <Menu size={20} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(() => setShowPeopleList(!showPeopleList)) }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden">
                                    <Users size={16} /> Persone
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(() => setShowArchive(true)) }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Archive size={16} /> Archivio
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(() => setShowSettings(true)) }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings size={16} /> Opzioni
                                </a>
                                <div className="border-t my-1"></div>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(handleLogout) }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <LogOut size={16} /> Esci
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`${showPeopleList ? 'fixed inset-0 bg-white z-20 h-screen overflow-y-auto custom-scroll' : 'hidden'} md:block md:static md:flex-1 md:overflow-y-auto custom-scroll`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-slate-50 md:hidden">
                    <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                        <img src={logo} className="w-6 h-6 object-contain" alt="logo" /> Regalario
                    </div>
                    <button onClick={() => setShowPeopleList(false)} className="p-1.5 rounded shadow hover:opacity-90 transition mr-2 bg-indigo-600 text-white">
                        <Home size={20} />
                    </button>
                </div>
                <div className="sticky top-0 bg-slate-50 z-10">
                    <div className="relative px-4 py-3 border-b border-gray-200">
                        <Search size={16} className="absolute left-7 top-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca persone o eventi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                        />
                    </div>
                    <div className="hidden md:flex justify-between px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-100">
                        <span>Persona</span>
                        <span>Prossima scadenza</span>
                    </div>
                </div>
                <PeopleList 
                    sidebarList={filteredPeople}
                    handleSidebarClick={handleSidebarClick}
                    selectedUid={selectedUid}
                />
            </div>
            <div className="hidden md:flex justify-between items-center p-2 border-t border-gray-200 bg-slate-50">
                <div>
                    <button onClick={() => setShowSettings(true)} className="p-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition">
                        <Settings size={18} />
                    </button>
                </div>
                <button onClick={() => setShowArchive(true)} className="p-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition">
                    <Archive size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

