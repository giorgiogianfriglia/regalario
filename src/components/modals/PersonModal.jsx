import React from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { ImageEditor } from '../ui/ImageEditor';
import { getCroppedImg, formatFixedDate } from '../../utils/helpers';
import { fixedEvents } from '../../utils/fixedEvents';



export const PersonModal = ({ 
    onClose,
    editingPersonId,
    handleSavePerson,
    newPersonName,
    setNewPersonName,
    newPersonPhoto,
    setNewPersonPhoto,
    handlePhotoUpload,
    newRelation,
    setNewRelation,
    relazioniList,
    customRelation,
    setCustomRelation,
    saveCustomRelation,
    newPartnerId,
    setNewPartnerId,
    persone,
    editingEvents,
    handleEditEventChange,
    handleDeleteEventFromModal,
    handleAddFixedEvents,
    newEventType,
    setNewEventType,
    eventTypesList,
    customEventType,
    setCustomEventType,
    saveCustomEventType,
    newEventDate,
    setNewEventDate,
    currentTheme
}) => { 
    const [imageToEdit, setImageToEdit] = React.useState(null);
    const fileInputRefCamera = React.useRef(null);
    const fileInputRefGallery = React.useRef(null);
    const [isNewEventFixed, setIsNewEventFixed] = React.useState(false);
    const [showPhotoChoice, setShowPhotoChoice] = React.useState(false);

    React.useEffect(() => {
        const fixed = fixedEvents.find(fe => fe.type === newEventType);
        if (fixed) {
            setIsNewEventFixed(true);
            setNewEventDate(fixed.date); 
        } else {
            setIsNewEventFixed(false);
            if (!editingPersonId) {
              setNewEventDate('');
            }
        }
    }, [newEventType, setNewEventDate, editingPersonId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageToEdit(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = () => {
        setNewPersonPhoto('');
        if (fileInputRefCamera.current) {
            fileInputRefCamera.current.value = null;
        }
        if (fileInputRefGallery.current) {
            fileInputRefGallery.current.value = null;
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
                                className="w-full text-white p-3 rounded-lg font-semibold"
                                style={{ backgroundColor: currentTheme.primary }}
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
                        if (croppedAndCompressedImage && handlePhotoUpload) {
                            await handlePhotoUpload(croppedAndCompressedImage);
                        }
                        setImageToEdit(null);
                    }}
                />
            )}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">{editingPersonId ? "Modifica" : "Nuova"} Scheda</h3>
                        <button onClick={onClose}><X /></button>
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                        <form onSubmit={handleSavePerson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Nome Persona</label>
                                <input className="w-full border border-gray-200 rounded-lg p-2" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} autoFocus required />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Foto</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-24 h-24 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border cursor-pointer"
                                        onClick={() => setShowPhotoChoice(true)}
                                        title="Clicca per caricare un'immagine"
                                    >
                                        {newPersonPhoto ? (
                                            <img src={newPersonPhoto} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-2">Carica un file cliccando sull'immagine.</p>
                                        <div className="flex gap-2 items-center">
                                            <button type="button" onClick={handleDeletePhoto} title="Rimuovi immagine" className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>
                                        <input type="file" ref={fileInputRefCamera} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
                                        <input type="file" ref={fileInputRefGallery} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Relazione</label>
                                    <select className="w-full border border-gray-200 rounded-lg p-2" value={newRelation} onChange={e => setNewRelation(e.target.value)}>
                                        {relazioniList.map(r => <option key={r} value={r}>{r}</option>)}
                                        <option value="Altro">Altro...</option>
                                    </select>
                                    {newRelation === "Altro" && (
                                        <div className="flex gap-2 mt-2">
                                            <input className="w-full border rounded-lg p-2 bg-gray-50" placeholder="Specifica..." value={customRelation} onChange={e => setCustomRelation(e.target.value)} required />
                                            <button type="button" onClick={saveCustomRelation} className="bg-green-100 text-green-600 p-2 rounded"><Check size={18} /></button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Partner</label>
                                    <select className="w-full border border-gray-200 rounded-lg p-2" value={newPartnerId} onChange={e => setNewPartnerId(e.target.value)}>
                                        <option value="">Nessuno</option>
                                        {persone.filter(p => p.id !== editingPersonId).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </select>
                                </div>
                            </div>
                            {!editingPersonId && (
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                    <h4 className="text-sm font-bold mb-2 text-gray-600">Prima Ricorrenza</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Tipo Evento</label>
                                            <select className="w-full border border-gray-200 rounded-lg p-2" value={newEventType} onChange={e => setNewEventType(e.target.value)}>
                                                {eventTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                                                <option value="Altro">Altro...</option>
                                            </select>
                                            {newEventType === "Altro" && (
                                                <div className="flex gap-2 mt-2">
                                                    <input className="w-full border rounded-lg p-2 bg-gray-50" placeholder="Specifica..." value={customEventType} onChange={e => setCustomEventType(e.target.value)} required />
                                                    <button type="button" onClick={saveCustomEventType} className="bg-green-100 text-green-600 p-2 rounded"><Check size={18} /></button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Data</label>
                                            {isNewEventFixed ? (
                                                <div className="w-full border border-gray-200 rounded-lg p-2 bg-gray-200 text-gray-600">
                                                    {formatFixedDate(newEventDate)}
                                                </div>
                                            ) : (
                                                <input type="date" className="w-full border border-gray-200 rounded-lg p-2" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {editingPersonId && (
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold mb-2">Eventi</h4>
                                    </div>
                                    {editingEvents.map((evt, idx) => {
                                        const isFixed = fixedEvents.some(fe => fe.type === evt.tipo);
                                        return (
                                            <div key={idx} className="flex gap-2 items-center p-2 rounded-lg bg-gray-50 mb-2">
                                                <div className="flex-1 font-semibold border border-gray-200 p-2 rounded-lg bg-gray-100 text-gray-700 text-center">
                                                    {evt.tipo}
                                                </div>
                                                <div className="flex-1">
                                                    {isFixed ? (
                                                        <div className="w-full text-center border border-gray-200 p-2 rounded-lg bg-gray-200 text-gray-600">
                                                            {formatFixedDate(evt.data)}
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="date" 
                                                            value={evt.data} 
                                                            onChange={(e) => handleEditEventChange(idx, 'data', e.target.value)} 
                                                            className="w-full border border-gray-200 p-2 rounded-lg" 
                                                        />
                                                    )}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteEventFromModal(idx)} 
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="pt-4 border-t flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 font-bold rounded-lg">Annulla</button>
                                <button type="submit" className="px-4 py-2 text-white font-bold rounded-lg" style={{ backgroundColor: currentTheme.primary }}>Salva</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
