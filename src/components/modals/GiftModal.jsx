import React, { useState, useRef } from 'react';
import { X, Camera, Trash2 } from 'lucide-react';
import { ImageEditor } from '../ui/ImageEditor';
import { getCroppedImg, formatCurrency } from '../../utils/helpers';

export const GiftModal = (props) => {
    const { currentTheme } = props;
    const [imageToEdit, setImageToEdit] = useState(null);
    const fileInputRefCamera = useRef(null);
    const fileInputRefGallery = useRef(null);
    const [showPhotoChoice, setShowPhotoChoice] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageToEdit(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = () => {
        props.setGiftImg('');
        if (fileInputRefCamera.current) {
            fileInputRefCamera.current.value = null;
        }
        if (fileInputRefGallery.current) {
            fileInputRefGallery.current.value = null;
        }
    };
    const selectedEvent = props.activePerson?.eventi.find(e => e.tipo === props.giftTargetEvent);
    const isFixedEvent = selectedEvent?.is_fixed;

    const handlePersonChange = (personId) => {
        if (!personId) return;
        const person = props.persone.find(p => p.id.toString() === personId);
        if (person && person.eventi.length > 0) {
            const firstEventIndex = 0; // Or find a default/next event
            props.handleSelectUid(`${personId}-${firstEventIndex}`);
        } else {
             props.handleSelectUid(`${personId}-0`); // fallback
        }
    };
    
    return (
        <>
            {showPhotoChoice && (
                <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" onClick={() => setShowPhotoChoice(false)}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold mb-4 text-center">Scegli un'opzione</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    fileInputRefCamera.current.click();
                                    setShowPhotoChoice(false);
                                }}
                                style={{ backgroundColor: currentTheme.primary }}
                                className="w-full text-white p-3 rounded-lg font-semibold"
                            >
                                Scatta una foto
                            </button>
                            <button
                                onClick={() => {
                                    fileInputRefGallery.current.click();
                                    setShowPhotoChoice(false);
                                }}
                                className="w-full bg-gray-100 p-3 rounded-lg font-semibold"
                            >
                                Scegli dalla galleria
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {imageToEdit && (
                <ImageEditor
                    imageSrc={imageToEdit}
                    onCancel={() => setImageToEdit(null)}
                    onConfirm={async (image, crop) => {
                        const croppedAndCompressedImage = await getCroppedImg(image, crop);
                        if (croppedAndCompressedImage && props.handleGiftImageUpload) {
                            await props.handleGiftImageUpload(croppedAndCompressedImage);
                        }
                        setImageToEdit(null);
                    }}
                />
            )}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto flex flex-col">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Regalo</h3>
                        <button onClick={props.onClose}><X /></button>
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            {props.editingGiftIndex === null && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Persona</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-3"
                                        value={props.activePerson?.id || ''}
                                        onChange={e => handlePersonChange(e.target.value)}
                                    >
                                        <option value="" disabled>Seleziona una persona</option>
                                        {props.persone.filter(p => p.eventi && p.eventi.some(e => !e.archived)).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className={props.editingGiftIndex !== null ? "col-span-2" : ""}>
                                <label className="block text-sm font-bold mb-1">Occasione</label>
                                <div className="flex gap-2">
                                    <select className="w-full border border-gray-200 rounded-lg p-3" value={props.giftTargetEvent} onChange={e => { props.setGiftTargetEvent(e.target.value); props.updateSuggestions(e.target.value); }} disabled={!props.activePerson}>
                                        {props.activePerson && props.activePerson.eventi && [...new Set(props.activePerson.eventi.filter(e => !e.archived).map(e => e.tipo))].map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                        {props.pendingNewEventData && <option key={props.pendingNewEventData.tipo} value={props.pendingNewEventData.tipo}>{props.pendingNewEventData.tipo}</option>}
                                        {(!props.activePerson || !props.activePerson.eventi || (props.activePerson.eventi.filter(e => !e.archived).length === 0 && !props.pendingNewEventData)) && <option value="" disabled>Nessun evento</option>}
                                    </select>
                                    <button onClick={() => { props.setIsAddingEventFromGiftModal(true); props.setShowAddEventModal(true); }} className="bg-gray-100 px-3 rounded-lg font-bold" disabled={!props.activePerson}>+</button>
                                </div>
                            </div>
                        </div>
                        {props.editingGiftIndex === null && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-amber-800">💡 Consigli Rapidi {props.giftTargetEvent ? `(${props.giftTargetEvent})` : '(Generici)'}</h4>
                                    <button onClick={() => props.updateSuggestions(props.giftTargetEvent)} className="text-[10px] text-amber-600 hover:underline">Rinnova</button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {props.suggerimenti.slice(0, 3).map((s, i) => (
                                        <a key={i} href={s.link} target="_blank" rel="noreferrer" className="bg-white border border-amber-200 rounded-lg text-center hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                            <div className="w-full h-20 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {s.img ? (
                                                    <img src={s.img} alt={s.nome} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera size={32} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="p-2 flex-1 flex flex-col justify-center">
                                                <span className="text-xs font-bold text-gray-800 block truncate">{s.nome}</span>
                                                <span className="text-[10px] text-amber-500">Amazon &rarr;</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold mb-1">Oggetto</label>
                            <input className="w-full border border-gray-200 rounded-lg p-3" value={props.giftObj} onChange={e => props.setGiftObj(e.target.value)} required />
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-4"> {/* Container for Year and Price */}
                                {!isFixedEvent && (
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Anno</label>
                                        <input type="number" className="w-full border border-gray-200 rounded-lg p-3" value={props.giftYear} onChange={e => props.setGiftYear(e.target.value)} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold mb-1">Prezzo (€)</label>
                                    <input type="text" inputMode="decimal" className="w-full border border-gray-200 rounded-lg p-3" value={typeof props.giftPrice === 'number' ? formatCurrency(props.giftPrice) : props.giftPrice} onChange={e => props.setGiftPrice(e.target.value)} placeholder="Es. 49,99" />
                                </div>
                            </div>
                            <div className="flex-shrink-0"> {/* Outer container for image label and box */}
                                <label className="block text-sm font-bold mb-1">Immagine</label>
                                <div
                                    className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer"
                                    onClick={() => setShowPhotoChoice(true)}
                                    title="Clicca per caricare un'immagine"
                                >
                                    {props.giftImg ? (
                                        <img src={props.giftImg} alt="Anteprima regalo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-400" size={32} />
                                    )}
                                </div>
                                <div className='flex justify-center mt-2'>
                                    <button type="button" onClick={handleDeletePhoto} title="Rimuovi immagine" className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                                </div>
                                <input type="file" ref={fileInputRefCamera} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
                                <input type="file" ref={fileInputRefGallery} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Link Prodotto</label>
                            <input className="w-full border border-gray-200 rounded-lg p-3" value={props.giftLink} onChange={e => props.setGiftLink(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Negozio</label>
                                <input className="w-full border border-gray-200 rounded-lg p-3" value={props.giftShop} onChange={e => props.setGiftShop(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Partecipanti</label>
                                <input className="w-full border border-gray-200 rounded-lg p-3" value={props.giftParticipants} onChange={e => props.setGiftParticipants(e.target.value)} />
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-end gap-3">
                            <button type="button" onClick={props.onClose} className="px-4 py-2 bg-gray-100 font-bold rounded-lg">Annulla</button>
                            <button onClick={props.handleSaveRegalo} className="px-4 py-2 text-white font-bold rounded-lg" style={{ backgroundColor: currentTheme.primary }}>Salva Regalo</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
