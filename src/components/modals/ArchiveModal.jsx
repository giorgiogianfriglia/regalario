import React from 'react';
import { X, Archive, Undo } from 'lucide-react';

export const ArchiveModal = ({ onClose, personeArchiviate, handleRestore, handlePermanentDelete }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden h-[80vh] flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><Archive size={20} /> Archivio</h3>
                <button onClick={onClose}><X /></button>
            </div>
            <div className="overflow-y-auto p-4 flex-1 space-y-2">
                {personeArchiviate.map(p => (
                    <div key={p.uid} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <p className="font-bold text-sm">{p.nome}</p>
                            <p className="text-xs text-gray-400">{p.eventi}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleRestore(p.uid)} className="p-1.5 bg-green-100 text-green-600 rounded" title="Ripristina"><Undo size={16} /></button>
                            <button onClick={() => handlePermanentDelete(p.uid)} className="p-1.5 bg-red-100 text-red-600 rounded" title="Elimina Definitivamente"><X size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
