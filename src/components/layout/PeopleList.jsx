import React from 'react';
import { AdUnit } from '../ui/Shared';

const PeopleList = ({
    sidebarList,
    handleSidebarClick,
    selectedUid,
    currentTheme
}) => {
    return (
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {sidebarList.map((item, idx) => (
                <React.Fragment key={item.id}>
                    {idx === 3 && <AdUnit />}
                    <div
                        onClick={() => handleSidebarClick(item)}
                        className={`p-3 rounded-xl cursor-pointer border transition relative group ${selectedUid === item.uidToSelect ? 'bg-white shadow-md' : 'border-transparent hover:bg-white hover:shadow-sm'}`}
                        style={selectedUid === item.uidToSelect ? { borderColor: currentTheme.primary } : {}}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                {item.foto ? (
                                    <img
                                        src={item.foto}
                                        alt={item.nome}
                                        className="w-14 h-14 rounded-full object-cover border-2"
                                        style={{ borderColor: selectedUid === item.uidToSelect ? currentTheme.primary : 'transparent' }}
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2"
                                        style={{ borderColor: selectedUid === item.uidToSelect ? currentTheme.primary : 'transparent' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-sm" style={selectedUid === item.uidToSelect ? { color: currentTheme.primary } : {}}>{item.nome}</p>
                                    <p className="text-[11px] text-gray-500 uppercase mt-0.5">{item.relazione}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg block w-fit ml-auto ${item.nextEvent.days < 14 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {item.nextEvent.days === 0 ? 'OGGI!' : `-${item.nextEvent.days}gg`}
                                </span>
                                <span className="text-[10px] text-gray-400 block mt-1">{item.nextEvent.tipo} {item.occorrenza && `• ${item.occorrenza}`}</span>
                            </div>
                        </div>
                        {selectedUid === item.uidToSelect && <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r" style={{ backgroundColor: currentTheme.primary }}></div>}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default PeopleList;
