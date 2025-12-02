import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { fetchUserData, saveUserData, uploadAvatar, uploadGiftImage } from '../api/userData';
import { RELAZIONI_DEFAULT, EVENT_TYPES_DEFAULT, DB_SUGGERIMENTI } from '../utils/constants';
import { calcolaGiorni, calcolaOccorrenza, isValidUrl, isValidParticipants, formatCurrency } from '../utils/helpers';
import { fixedEvents } from '../utils/fixedEvents';

const defaultTheme = {
    primary: '#4f46e5',
    secondary: '#f59e0b',
    accent: '#e0e7ff',
    textAccent: '#3730a3'
};

export const useRegalario = () => {
    // --- STATI ---
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [persone, setPersone] = useState([]);
    const [dbRowId, setDbRowId] = useState(null);

    const [customRelazioni, setCustomRelazioni] = useState([]);
    const [customEventTypes, setCustomEventTypes] = useState([]);

    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        try {
            if (savedTheme) {
                const parsedTheme = JSON.parse(savedTheme);
                if (parsedTheme.primary) return parsedTheme;
            }
        } catch (e) {
            return defaultTheme;
        }
        return defaultTheme;
    });

    useEffect(() => {
        localStorage.setItem('appTheme', JSON.stringify(currentTheme));
        if (currentTheme.name === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [currentTheme]);
    const [showSettings, setShowSettings] = useState(false);
    const relazioniList = useMemo(() => [...RELAZIONI_DEFAULT, ...customRelazioni], [customRelazioni]);
    const eventTypesList = useMemo(() => [...new Set([...EVENT_TYPES_DEFAULT, ...customEventTypes])], [customEventTypes]);

    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [selectedUid, setSelectedUid] = useState(null);
    const [activeTab, setActiveTab] = useState("Tutti");
    const [searchTerm, setSearchTerm] = useState("");

    // Modali
    const [showModalPerson, setShowModalPerson] = useState(false);
    const [showModalGift, setShowModalGift] = useState(false);
    const [showModalStats, setShowModalStats] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    // State for managing the "Add Event" modal visibility
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: "", msg: "", action: null });
    const [isAddingEventFromGiftModal, setIsAddingEventFromGiftModal] = useState(false);
    const [pendingNewEventData, setPendingNewEventData] = useState(null); // <--- Added this line
    const [toastMsg, setToastMsg] = useState(null);
    const [suggerimenti, setSuggerimenti] = useState([]);
    const [refreshAmazonTrigger, setRefreshAmazonTrigger] = useState(0);

    const [showPeopleList, setShowPeopleList] = useState(false);

    // Edit States
    const [editingGiftIndex, setEditingGiftIndex] = useState(null);
    const [editingGiftEventIndex, setEditingGiftEventIndex] = useState(null);
    const [editingPersonId, setEditingPersonId] = useState(null);
    const [editingEvents, setEditingEvents] = useState([]);
    const [editingEventType, setEditingEventType] = useState(null); // State per l'evento in modifica
    const [editingRelationType, setEditingRelationType] = useState(null); // State per la relazione in modifica

    // Forms
    const [newPersonName, setNewPersonName] = useState("");
    const [newPersonPhoto, setNewPersonPhoto] = useState("");
    const [newRelation, setNewRelation] = useState("Amico/a");
    const [customRelation, setCustomRelation] = useState("");
    const [newPartnerId, setNewPartnerId] = useState("");
    const [newEventType, setNewEventType] = useState("Compleanno");
    const [customEventType, setCustomEventType] = useState("");
    const [newEventDate, setNewEventDate] = useState("");
    const [giftTargetEvent, setGiftTargetEvent] = useState("");
    const [giftObj, setGiftObj] = useState("");
    const [giftYear, setGiftYear] = useState(new Date().getFullYear());
    const [giftParticipants, setGiftParticipants] = useState("");
    const [giftShop, setGiftShop] = useState("");
    const [giftLink, setGiftLink] = useState("");
    const [giftImg, setGiftImg] = useState("");
    const [giftPrice, setGiftPrice] = useState("");
    const [addEventName, setAddEventName] = useState("Compleanno");
    const [customAddEventName, setCustomAddEventName] = useState("");
    const [addEventDate, setAddEventDate] = useState("");

    // INIT
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (session) fetchDati(session.user.id); else setLoading(false); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) fetchDati(session.user.id); else { setPersone([]); setLoading(false); } });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => { if (toastMsg) setTimeout(() => setToastMsg(null), 3000); }, [toastMsg]);

    const themeStyles = {
        primary: { backgroundColor: currentTheme.primary, color: 'white' },
        textPrimary: { color: currentTheme.primary },
        borderPrimary: { borderColor: currentTheme.primary },
        accentBg: { backgroundColor: currentTheme.accent, color: currentTheme.textAccent },
        iconColor: { color: currentTheme.secondary }
    };

    const fetchDati = async (userId) => {
        setLoading(true);
        try {
            const result = await fetchUserData(userId);
            
            if (result === 'USER_NOT_FOUND') {
                // First login, initialize with empty data
                setPersone([]);
                setCustomRelazioni([]);
                setCustomEventTypes([]);
                await salvaSuCloud({ 
                    persone: [], 
                    custom_relazioni: [], 
                    custom_event_types: [] 
                });
            } else if (result) {
                const data = result;
                setPersone(data.persone || []);
                setCustomRelazioni(data.custom_relazioni || []);
                setCustomEventTypes(data.custom_event_types || []);
                setDbRowId(data.id);
            } else {
                // result is null or undefined, but not 'USER_NOT_FOUND'
                // This is an unexpected state. Do not wipe data.
                setToastMsg('Errore inaspettato nel recupero dei dati.');
                // We could clear local state to avoid showing stale data.
                setPersone([]);
                setCustomRelazioni([]);
                setCustomEventTypes([]);
            }
        } catch (error) {
            setToastMsg('Si è verificato un errore nel recupero dei dati.');
        } finally {
            setLoading(false);
        }
    };

    const salvaSuCloud = async (updates) => {
        if (!session) return;
        try {
            const data = await saveUserData(session.user.id, dbRowId, updates);
            if (data) {
                setDbRowId(data.id); // Update dbRowId if it was a new insert
                // Optionally update local state only on successful save
                if (updates.persone) setPersone(updates.persone);
                if (updates.custom_relazioni) setCustomRelazioni(updates.custom_relazioni);
                if (updates.custom_event_types) setCustomEventTypes(updates.custom_event_types);
            }
        } catch (err) {
            setToastMsg("Errore during il salvataggio dei dati.");
        }
    };

    const handleEditCustomEventType = (oldName, newName) => {
        if (!newName || newName.trim() === "") {
            setToastMsg("Il nome dell'evento non può essere vuoto.");
            return;
        }
        if (oldName === newName) {
            setEditingEventType(null);
            return;
        }
    
        // Aggiorna la lista di customEventTypes
        const updatedEventTypes = customEventTypes.map(name => name === oldName ? newName : name);
        
        // Aggiorna tutte le persone che usano questo tipo di evento
        const updatedPersone = persone.map(p => {
            const newEventi = p.eventi.map(e => {
                if (e.tipo === oldName) {
                    return { ...e, tipo: newName };
                }
                return e;
            });
            return { ...p, eventi: newEventi };
        });
    
        salvaSuCloud({ persone: updatedPersone, custom_event_types: updatedEventTypes });
        setToastMsg("Tipo evento aggiornato con successo!");
        setEditingEventType(null); // Chiude la modale/interfaccia di modifica
    };
    
    const handleDeleteCustomEventType = (eventName) => {
        askConfirm("Elimina Tipo Evento", `Sei sicuro di voler eliminare "${eventName}"? Questa azione è irreversibile e cancellerà TUTTI gli eventi e i regali associati a questo tipo per OGNI persona.`, () => {
            const updatedEventTypes = customEventTypes.filter(name => name !== eventName);
            
            // Rimuovi l'evento da tutte le persone
            const updatedPersone = persone.map(p => {
                const newEventi = p.eventi.filter(e => e.tipo !== eventName);
                return { ...p, eventi: newEventi };
            });
    
            salvaSuCloud({ persone: updatedPersone, custom_event_types: updatedEventTypes });
            setToastMsg(`"${eventName}" è stato eliminato.`);
            if (activeTab === eventName) { // If the deleted event type was the active tab, reset it
                setActiveTab("Tutti");
            }
        });
    };

    const handleEditCustomRelationType = (oldName, newName) => {
        if (!newName || newName.trim() === "") {
            setToastMsg("Il nome della relazione non può essere vuoto.");
            return;
        }
        if (oldName === newName) {
            setEditingRelationType(null);
            return;
        }

        const updatedRelazioni = customRelazioni.map(name => name === oldName ? newName : name);
        const updatedPersone = persone.map(p => {
            if (p.relazione === oldName) {
                return { ...p, relazione: newName };
            }
            return p;
        });

        salvaSuCloud({ persone: updatedPersone, custom_relazioni: updatedRelazioni });
        setToastMsg("Tipo relazione aggiornato con successo!");
        setEditingRelationType(null);
    };

    const handleDeleteCustomRelationType = (relationName) => {
        askConfirm("Elimina Tipo Relazione", `Sei sicuro di voler eliminare "${relationName}"? Questa azione è irreversibile e imposterà la relazione a "Amico/a" per tutte le persone che la usano.`, () => {
            const updatedRelazioni = customRelazioni.filter(name => name !== relationName);
            const updatedPersone = persone.map(p => {
                if (p.relazione === relationName) {
                    return { ...p, relazione: "Amico/a" }; // Fallback to a default relation
                }
                return p;
            });

            salvaSuCloud({ persone: updatedPersone, custom_relazioni: updatedRelazioni });
            setToastMsg(`"${relationName}" è stato eliminato.`);
        });
    };
    

    const sidebarList = useMemo(() => {
        return persone.map(p => {
            const activeEvents = p.eventi.filter(e => !e.archived);
            if (activeEvents.length === 0) return null;
            const eventsWithDays = activeEvents.map((e, idx) => ({ ...e, days: calcolaGiorni(e.data), idx }));
            eventsWithDays.sort((a, b) => a.days - b.days);
            const nextEvent = eventsWithDays[0];
            const today = new Date();
            const evtDate = new Date(nextEvent.data);
            evtDate.setFullYear(today.getFullYear());
            let targetYear = today.getFullYear();
            if (evtDate < new Date(today.setHours(0, 0, 0, 0))) targetYear += 1;
            const occorrenza = calcolaOccorrenza(nextEvent.data, targetYear, nextEvent.tipo);
            return { id: p.id, nome: p.nome, foto: p.foto, relazione: p.relazione, nextEvent: nextEvent, occorrenza: occorrenza, uidToSelect: `${p.id}-${nextEvent.idx}`, eventi: p.eventi };
        }).filter(Boolean).sort((a, b) => a.nextEvent.days - b.nextEvent.days);
    }, [persone]);

    const personeArchiviate = useMemo(() => {
        return persone
            .filter(p => p.eventi.length > 0 && p.eventi.every(e => e.archived))
            .map(p => {
                const giftCount = p.eventi.reduce((acc, e) => acc + (e.storicoRegali?.length || 0), 0);
                return {
                    uid: p.id,
                    nome: p.nome,
                    eventi: p.eventi.map(e => e.tipo).join(', '),
                    giftCount: giftCount
                };
            });
    }, [persone]);

    // --- LOGICA SUGGERIMENTI FIXATA ---
    const updateSuggestions = (eventType) => {
        const key = eventType === "Tutti" ? "generici" : (DB_SUGGERIMENTI[eventType] ? eventType : "generici");
        let fullPool = [];
        if (eventType === "Tutti") {
            fullPool = Object.values(DB_SUGGERIMENTI).flat();
        } else {
            fullPool = [...(DB_SUGGERIMENTI[key] || []), ...DB_SUGGERIMENTI['generici']];
        }
        const uniqueNames = new Set();
        const uniquePool = [];
        for (const item of fullPool) {
            if (!uniqueNames.has(item.nome)) {
                uniqueNames.add(item.nome);
                uniquePool.push(item);
            }
        }
        const currentNames = suggerimenti.map(s => s.nome);
        let candidates = uniquePool.filter(item => !currentNames.includes(item.nome));
        if (candidates.length < 3) candidates = uniquePool;
        setSuggerimenti(candidates.sort(() => 0.5 - Math.random()).slice(0, 4));
    };

    const handleSidebarClick = (item) => { setSelectedUid(item.uidToSelect); setActiveTab("Tutti"); setSearchTerm(""); updateSuggestions("Tutti"); setShowPeopleList(false); };
    const handleHomeClick = () => { setSelectedUid(null); };
    const handleSelectUid = (uid, type) => { setSelectedUid(uid); setActiveTab("Tutti"); setSearchTerm(""); updateSuggestions("Tutti"); };
    const handleTabChange = (tabName) => { setActiveTab(tabName); updateSuggestions(tabName); };
    const getActivePerson = () => { if (!selectedUid) return null; const [pId] = selectedUid.split('-'); return persone.find(p => p.id.toString() === pId); };
    const activePerson = getActivePerson();

    const getHeaderInfo = () => {
        if (!activePerson) return { date: "", type: "", subtext: "" };
        const partner = activePerson.partnerId ? persone.find(p => p.id === activePerson.partnerId) : null;
        const partnerUid = partner && partner.eventi.length > 0 ? `${partner.id}-0` : null;
        const partnerType = partnerUid ? partner.eventi[0].tipo : "";
        let targetEvt = null;
        if (activeTab === "Tutti") { targetEvt = activePerson.eventi.filter(e => !e.archived).sort((a, b) => calcolaGiorni(a.data) - calcolaGiorni(b.data))[0]; }
        else { targetEvt = activePerson.eventi.find(e => e.tipo === activeTab); }
        if (!targetEvt) return { date: "", type: "", partnerName: partner?.nome, partnerUid, partnerType };
        const today = new Date(); const evtD = new Date(targetEvt.data); evtD.setFullYear(today.getFullYear()); let y = today.getFullYear();
        if (evtD < new Date(today.setHours(0, 0, 0, 0))) y += 1;
        const occ = calcolaOccorrenza(targetEvt.data, y, targetEvt.tipo);
        const typeText = activeTab === "Tutti" ? `Prossimo: ${targetEvt.tipo}` : targetEvt.tipo;
        const subtext = occ ? ` • ${occ}` : "";
        const isFixed = targetEvt.is_fixed || (targetEvt.data && targetEvt.data.length === 5 && targetEvt.data.includes('-'));
        return { date: targetEvt.data, type: typeText + subtext, partnerName: partner?.nome, partnerUid, partnerType, isFixed };
    };
    const headerInfo = getHeaderInfo();

    const getStatsBreakdown = () => {
        if (!activePerson) return { breakdown: [], total: "0.00" };
        const breakdownObj = {}; let totalSum = 0;
        activePerson.eventi.forEach(evt => {
            if (evt.storicoRegali) {
                const sumEvt = evt.storicoRegali.reduce((acc, r) => acc + (r.prezzo || 0), 0);
                if (sumEvt > 0) { breakdownObj[evt.tipo] = (breakdownObj[evt.tipo] || 0) + sumEvt; totalSum += sumEvt; }
            }
        });
        const breakdown = Object.entries(breakdownObj).map(([type, amount]) => ({ type, amount: amount.toFixed(2) }));
        return { breakdown, total: totalSum.toFixed(2) };
    };

    // --- ACTIONS ---
    const saveCustomRelation = () => {
        const val = customRelation.trim();
        if (val && !relazioniList.includes(val)) {
            const updatedRelazioni = [...customRelazioni, val];
            salvaSuCloud({ custom_relazioni: updatedRelazioni });
            setNewRelation(val);
            setCustomRelation("");
            setToastMsg("Nuova relazione salvata!");
        }
    };
    
    const saveCustomEventType = () => {
        const val = customEventType.trim();
        if (val && !eventTypesList.includes(val)) {
            const updatedEventTypes = [...customEventTypes, val];
            salvaSuCloud({ custom_event_types: updatedEventTypes });
            setNewEventType(val);
            setCustomEventType("");
            setToastMsg("Nuovo tipo evento salvato!");
        }
    };
    
    const saveCustomAddEventName = () => {
        const val = customAddEventName.trim();
        if (val && !eventTypesList.includes(val)) {
            const updatedEventTypes = [...customEventTypes, val];
            salvaSuCloud({ custom_event_types: updatedEventTypes });
            setAddEventName(val);
            setCustomAddEventName("");
            setToastMsg("Nuovo tipo evento salvato!");
        }
    };
    const openNewPersonModal = () => { setNewPersonName(""); setNewPersonPhoto(""); setNewRelation("Amico/a"); setCustomRelation(""); setNewPartnerId(""); setNewEventType("Compleanno"); setCustomEventType(""); setNewEventDate(""); setEditingPersonId(null); setEditingEvents([]); setShowModalPerson(true); };
    const openEditPersonModal = () => { if (!activePerson) return; setNewPersonName(activePerson.nome); setNewPersonPhoto(activePerson.foto || ""); if (relazioniList.includes(activePerson.relazione)) { setNewRelation(activePerson.relazione); setCustomRelation(""); } else { setNewRelation("Altro"); setCustomRelation(active.relazione); } setNewPartnerId(activePerson.partnerId || ""); setEditingEvents(JSON.parse(JSON.stringify(activePerson.eventi))); setEditingPersonId(activePerson.id); setShowModalPerson(true); };
    const handleEditEventChange = (idx, field, value) => {
        const updated = [...editingEvents];
        if (updated[idx]?.is_fixed) return; // Impedisce la modifica di eventi fissi
        updated[idx][field] = value;
        setEditingEvents(updated);
    };
    const handleDeleteEventFromTab = (personId, eventIndex) => {
        const person = persone.find(p => p.id === personId);
        if (!person) return;
        
        const eventToDelete = person.eventi[eventIndex];
        if (!eventToDelete) return;

        // Prevent deletion if it's the last event
        if (person.eventi.length === 1) {
            setToastMsg("Non puoi eliminare l'ultima ricorrenza. Puoi modificarla o archiviare la persona.");
            return;
        }

        askConfirm("Elimina Evento", `Sei sicuro di voler eliminare l'evento "${eventToDelete.tipo}" per ${person.nome}? L'azione è irreversibile.`, () => {
            const updatedPersone = persone.map(p => {
                if (p.id === personId) {
                    const newEventi = p.eventi.filter((_, idx) => idx !== eventIndex);
                    if (activeTab === eventToDelete.tipo) {
                        setActiveTab("Tutti");
                    }
                    return { ...p, eventi: newEventi };
                }
                return p;
            });
            salvaSuCloud({ persone: updatedPersone });
            setToastMsg("Evento eliminato.");
        });
    };

    const handleDeleteEventFromModal = (idx) => {
        if (editingEvents.length === 1) {
            askConfirm("Elimina Ultimo Evento", "Stai per eliminare l'ultimo evento. Se salvi, questo eliminerà anche la persona. Sei sicuro?", () => {
                const updated = editingEvents.filter((_, i) => i !== idx);
                setEditingEvents(updated);
            });
        } else {
            askConfirm("Elimina Evento", "Eliminare questo evento e il suo storico regali?", () => {
                const updated = editingEvents.filter((_, i) => i !== idx);
                setEditingEvents(updated);
            });
        }
    };

    const handleAddFixedEvents = () => {
        const existingFixedTypes = editingEvents.map(e => e.is_fixed ? e.type : null).filter(Boolean);
        const eventsToAdd = fixedEvents.filter(fe => !existingFixedTypes.includes(fe.type));
    
        if (eventsToAdd.length === 0) {
            setToastMsg("Tutti gli eventi fissi sono già presenti.");
            return;
        }
        setEditingEvents(prev => [...prev, ...eventsToAdd]);
        setToastMsg("Eventi fissi aggiunti!");
    };
    const handleSavePerson = (e) => {
        e.preventDefault();

        if (editingPersonId && editingEvents.length === 0) {
            askConfirm("Elimina Persona", `Stai per eliminare ${newPersonName} perchè non ha più eventi. Sei sicuro?`, () => {
                const updatedPersone = persone.filter(p => p.id !== editingPersonId);
                salvaSuCloud({ persone: updatedPersone });
                setToastMsg("Persona eliminata.");
                setShowModalPerson(false);
                setSelectedUid(null);
            });
            return;
        }
        
        const finalRelation = newRelation === "Altro" && customRelation.trim() ? customRelation.trim() : newRelation;
        let updatedPersone;
        if (editingPersonId) {
            updatedPersone = persone.map(p => {
                if (p.id === editingPersonId) {
                    return { ...p, nome: newPersonName, relazione: finalRelation, partnerId: newPartnerId ? parseInt(newPartnerId) : null, eventi: editingEvents, foto: newPersonPhoto };
                }
                return p;
            });
            setToastMsg("Dettagli aggiornati!");
        } else {
            if (new Date(newEventDate).getFullYear() > 2099) {
                alert("Data non valida (max 2099)");
                return;
            }
            let finalEventType = newEventType === "Altro" && customEventType.trim() ? customEventType.trim() : newEventType;
            if (finalEventType === "Altro" || !finalEventType) finalEventType = "Evento";
            const newId = Date.now();
            const newEntry = { id: newId, nome: newPersonName, relazione: finalRelation, foto: newPersonPhoto, partnerId: newPartnerId ? parseInt(newPartnerId) : null, eventi: [{ tipo: finalEventType, data: newEventDate, storicoRegali: [], archived: false }] };
            updatedPersone = [...persone, newEntry];
            setTimeout(() => handleSelectUid(`${newId}-0`, finalEventType), 100);
        }
        salvaSuCloud({ persone: updatedPersone });
        setShowModalPerson(false);
    };
    const resetGiftForm = () => { setGiftObj(""); setGiftYear(new Date().getFullYear()); setGiftParticipants(""); setGiftShop(""); setGiftLink(""); setGiftImg(""); setGiftPrice(""); const defaultEvt = activeTab !== 'Tutti' ? activeTab : (activePerson?.eventi[0]?.tipo || ""); setGiftTargetEvent(defaultEvt); setEditingGiftIndex(null); setEditingGiftEventIndex(null); updateSuggestions(defaultEvt); };
    const openNewGiftModal = () => { resetGiftForm(); setShowModalGift(true); };
    const openEditGiftModal = (regalo, giftIdx, eventIdx, eventType) => { resetGiftForm(); setGiftObj(regalo.oggetto); setGiftYear(regalo.anno); setGiftParticipants(regalo.partecipanti || ""); setGiftShop(regalo.negozio || ""); setGiftLink(regalo.link || ""); setGiftImg(regalo.img || ""); setGiftPrice(regalo.prezzo || ""); setGiftTargetEvent(eventType); setEditingGiftIndex(giftIdx); setEditingGiftEventIndex(eventIdx); setShowModalGift(true); };
    const handleSaveRegalo = () => {
        if (!giftObj || !activePerson) return;
        if (giftLink && !isValidUrl(giftLink)) {
            alert("Link prodotto non valido.");
            return;
        }
        if (giftParticipants.trim() && !isValidParticipants(giftParticipants)) {
            setToastMsg("I partecipanti contengono caratteri non ammessi (solo lettere, numeri, caratteri accentati, spazi, virgole e punti).");
            return;
        }

        let formattedPrice = 0;
        if (giftPrice) {
            let p = giftPrice.toString().replace(',', '.');
            if (!isNaN(p)) formattedPrice = parseFloat(parseFloat(p).toFixed(2));
        }

        let finalShop = giftShop.trim();
        const finalLink = giftLink.trim();
        if (!finalShop && finalLink) {
            try {
                const urlObj = new URL(finalLink.startsWith('http') ? finalLink : `https://${finalLink}`);
                finalShop = urlObj.hostname.replace('www.', '');
            } catch (e) { }
        }

        let updatedPersone = persone.map(p => {
            if (p.id === activePerson.id) {
                let newEventi = [...p.eventi];

                let targetIdx = newEventi.findIndex(e => e.tipo === giftTargetEvent);
                // Fallback to the first event if the target event isn't found (e.g., newly added event)
                // This is crucial if giftTargetEvent was set to a just-added event.
                if (targetIdx === -1) {
                    // Try to find the event that was just added from pendingNewEventData
                    if (pendingNewEventData && pendingNewEventData.activePersonId === p.id) {
                        targetIdx = newEventi.findIndex(e => e.tipo === pendingNewEventData.tipo);
                    }
                    if (targetIdx === -1 && newEventi.length > 0) { // If still not found, default to the first event
                        targetIdx = 0;
                    } else if (targetIdx === -1 && newEventi.length === 0) { // No events at all
                        // This case should ideally not happen if a gift is being added
                        setToastMsg("Nessun evento disponibile per aggiungere il regalo.");
                        return p; // Return original person if no event is found
                    }
                }
                
                const regaloData = {
                    anno: parseInt(giftYear),
                    oggetto: giftObj,
                    partecipanti: giftParticipants.trim(),
                    negozio: finalShop,
                    link: finalLink,
                    img: giftImg.trim(),
                    prezzo: formattedPrice
                };

                if (editingGiftIndex !== null) { // Modal was in "edit" mode
                    const oldEventIndex = editingGiftEventIndex;
                    const newEventIndex = targetIdx;

                    // If the event has changed, we need to move the gift
                    if (oldEventIndex !== null && newEventIndex !== -1 && oldEventIndex !== newEventIndex) {
                        // 1. Remove the gift from the old event's history
                        if (newEventi[oldEventIndex] && newEventi[oldEventIndex].storicoRegali) {
                            newEventi[oldEventIndex].storicoRegali.splice(editingGiftIndex, 1);
                        }
                        // 2. Add the updated gift to the new event's history
                        if (newEventi[newEventIndex]) {
                            if (!newEventi[newEventIndex].storicoRegali) {
                                newEventi[newEventIndex].storicoRegali = [];
                            }
                            newEventi[newEventIndex].storicoRegali.unshift(regaloData);
                        }
                    } else if (newEventIndex !== -1) {
                        // Event is the same, just update the gift in place
                        if (newEventi[newEventIndex] && newEventi[newEventIndex].storicoRegali && newEventi[newEventIndex].storicoRegali[editingGiftIndex]) {
                            newEventi[newEventIndex].storicoRegali[editingGiftIndex] = regaloData;
                        }
                    }
                } else if (targetIdx !== -1) { // Modal was in "add new" mode
                    newEventi[targetIdx].storicoRegali.unshift(regaloData);
                }
                
                newEventi.forEach(e => {
                    if (e.storicoRegali) {
                        e.storicoRegali.sort((a, b) => b.anno - a.anno)
                    }
                });
                return { ...p, eventi: newEventi };
            }
            return p;
        });

        salvaSuCloud({ persone: updatedPersone }); // Save all changes at once
        setPendingNewEventData(null); // Clear pending event data after saving

        setShowModalGift(false);
        setToastMsg(editingGiftIndex !== null ? "Aggiornato!" : "Regalo aggiunto!");
    };
    
    const handleGiftImageUpload = async (file) => {
        if (!session) return;
        if (!file) return;
        try {
            const publicUrl = await uploadGiftImage(session.user.id, file);
            setGiftImg(publicUrl);
            setToastMsg("Immagine caricata!");
        } catch (error) {
            setToastMsg("Errore during il caricamento dell'immagine.");
        }
    };
    
    const handleAddEventToPerson = () => {
        let finalEventName = addEventName === "Altro" && customAddEventName.trim() ? customAddEventName.trim() : addEventName;
        if (finalEventName === "Altro" || !finalEventName) return;
        if (!activePerson || !addEventDate) return;

        const eventExists = activePerson.eventi.some(evento => evento.tipo.toLowerCase() === finalEventName.toLowerCase());
        if (eventExists) {
            setToastMsg("La ricorrenza è già presente.");
            setShowAddEventModal(false);
            setAddEventName("Compleanno");
            setCustomAddEventName("");
            setAddEventDate("");
            setIsAddingEventFromGiftModal(false); // Reset this flag
            return;
        }

        if (new Date(addEventDate).getFullYear() > 2099) {
            alert("Data non valida");
            return;
        }

        const newEvent = { tipo: finalEventName, data: addEventDate, storicoRegali: [], archived: false };

        const updatedPersone = persone.map(p => {
            if (p.id === activePerson.id) {
                return { ...p, eventi: [...p.eventi, newEvent] };
            }
            return p;
        });
        salvaSuCloud({ persone: updatedPersone });
        setActiveTab(finalEventName);
        setToastMsg("Ricorrenza aggiunta!");
        setShowAddEventModal(false); 
        
        if (isAddingEventFromGiftModal) {
            setGiftTargetEvent(finalEventName); // Set gift target immediately for selection
        }
        setIsAddingEventFromGiftModal(false); // Reset this flag
        setAddEventName("Compleanno");
        setCustomAddEventName("");
        setAddEventDate("");
    };
    const askConfirm = (title, msg, action) => { setConfirmConfig({ show: true, title, msg, action }); };
    const executeConfirm = () => { if (confirmConfig.action) confirmConfig.action(); setConfirmConfig({ ...confirmConfig, show: false }); };
    const handleDeleteSingleGift = (giftIdx, eventIdx) => { askConfirm("Elimina Regalo", "Vuoi eliminare definitivamente questo regalo?", () => { const updated = persone.map(p => { if (p.id === activePerson.id) { const newEventi = [...p.eventi]; newEventi[eventIdx].storicoRegali.splice(giftIdx, 1); return { ...p, eventi: newEventi }; } return p; }); salvaSuCloud({ persone: updated }); setToastMsg("Regalo eliminato."); }); };
    const handleArchive = () => { askConfirm("Archivia", "Spostare nell'archivio?", () => { const updated = persone.map(p => { if (p.id === activePerson.id) { const newEventi = p.eventi.map(e => ({ ...e, archived: true })); return { ...p, eventi: newEventi }; } return p; }); salvaSuCloud({ persone: updated }); setSelectedUid(null); setToastMsg("Archiviato."); }); };
    const getFilteredGifts = () => { if (!activePerson) return []; let list = []; if (activeTab === "Tutti") { list = (activePerson.eventi || []).flatMap((evt, eIdx) => (evt.storicoRegali || []).map((regalo, rIdx) => ({ ...regalo, _evtTipo: evt.tipo, _evtData: evt.data, _eIdx: eIdx, _rIdx: rIdx }))); } else { const evt = (activePerson.eventi || []).find(e => e.tipo === activeTab); if (!evt) return []; const eIdx = activePerson.eventi.indexOf(evt); list = (evt.storicoRegali || []).map((regalo, rIdx) => ({ ...regalo, _evtTipo: evt.tipo, _evtData: evt.data, _eIdx: eIdx, _rIdx: rIdx })); } list.sort((a, b) => b.anno - a.anno); if (searchTerm.trim()) { const lower = searchTerm.toLowerCase(); list = list.filter(r => r.oggetto.toLowerCase().includes(lower) || (r.partecipanti && r.partecipanti.toLowerCase().includes(lower)) || (r.negozio && r.negozio.toLowerCase().includes(lower)) || r.anno.toString().includes(lower)); } return list; };
    const getTotaleSpeso = () => { const gifts = activePerson.eventi.flatMap(e => e.storicoRegali); return formatCurrency(gifts.reduce((acc, curr) => acc + (curr.prezzo || 0), 0)); };
    const handleEmailAuth = async (e) => { e.preventDefault(); setAuthLoading(true); if (authMode === 'signup') { const { error } = await supabase.auth.signUp({ email, password }); if (error) alert(error.message); else alert("Registrazione completata! Controlla la tua email per confermare il tuo account."); } else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) alert("Errore login."); } setAuthLoading(false); };
    const handleGoogleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }); };
    const handleLogout = async () => { await supabase.auth.signOut(); };
    const handleRestore = (personId) => {
        askConfirm("Ripristina Persona", "Sei sicuro di voler ripristinare questa persona?", () => {
            const updated = persone.map(p => {
                if (p.id === personId) {
                    const newEventi = p.eventi.map(e => ({ ...e, archived: false }));
                    return { ...p, eventi: newEventi };
                }
                return p;
            });
            salvaSuCloud({ persone: updated });
            setToastMsg("Persona ripristinata!");
        });
    };
    const handlePermanentDelete = (personId) => {
        askConfirm("Eliminazione Definitiva", "Questa azione eliminerà la persona e tutto il suo storico. L'azione è irreversibile.", () => {
            const updated = persone.filter(p => p.id !== personId);
            salvaSuCloud({ persone: updated });
            setToastMsg("Persona eliminata definitivamente.");
        });
    };



    const handleRefreshAmazonSuggestions = () => {
        setRefreshAmazonTrigger(prev => prev + 1);
        setToastMsg("Suggerimenti Amazon aggiornati!");
    };

    const handlePhotoUpload = async (file) => {
        if (!session) return;
        try {
            const publicUrl = await uploadAvatar(session.user.id, file);
            setNewPersonPhoto(publicUrl);
            setToastMsg("Immagine caricata!");
        } catch (error) {
            setToastMsg("Errore during il caricamento dell'immagine.");
        }
    };

    const amazonSuggestions = useMemo(() => {
        const allSuggestions = Object.values(DB_SUGGERIMENTI).flat();
        const uniqueNames = new Set();
        const uniquePool = [];
        for (const item of allSuggestions) {
            if (!uniqueNames.has(item.nome)) {
                uniqueNames.add(item.nome);
                uniquePool.push(item);
            }
        }
        return uniquePool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [refreshAmazonTrigger]);

    const getLastGift = (personId, eventType) => {
        const person = persone.find(p => p.id === personId);
        if (!person) return null;
        const event = person.eventi.find(e => e.tipo === eventType);
        if (!event || !event.storicoRegali || event.storicoRegali.length === 0) return null;
        // The list is already sorted by year descending
        return event.storicoRegali[0];
    };

    return {
        session, loading, persone, currentTheme, setCurrentTheme, showSettings, setShowSettings, relazioniList, eventTypesList, authMode, setAuthMode,
        email, setEmail, password, setPassword, authLoading, selectedUid, setSelectedUid, activeTab, setActiveTab, searchTerm, setSearchTerm,
        showModalPerson, setShowModalPerson, showModalGift, setShowModalGift, showModalStats, setShowModalStats, showArchive, setShowArchive,
        showAddEventModal, setShowAddEventModal, confirmConfig, setConfirmConfig, toastMsg, setToastMsg, suggerimenti, setSuggerimenti,
        isAddingEventFromGiftModal, setIsAddingEventFromGiftModal,
        pendingNewEventData, setPendingNewEventData, // <--- Added this line
        showPeopleList, setShowPeopleList,
        editingGiftIndex, editingGiftEventIndex, editingPersonId, editingEvents, newPersonName, setNewPersonName, newPersonPhoto, setNewPersonPhoto, newRelation, setNewRelation,
        customRelation, setCustomRelation, newPartnerId, setNewPartnerId, newEventType, setNewEventType, customEventType, setCustomEventType,
        newEventDate, setNewEventDate, giftTargetEvent, setGiftTargetEvent, giftObj, setGiftObj, giftYear, setGiftYear, giftParticipants, setGiftParticipants,
        giftShop, setGiftShop, giftLink, setGiftLink, giftImg, setGiftImg, giftPrice, setGiftPrice, addEventName, setAddEventName,
        customAddEventName, setCustomAddEventName, addEventDate, setAddEventDate, themeStyles, sidebarList, personeArchiviate, activePerson,
        headerInfo, amazonSuggestions, getLastGift, customEventTypes, editingEventType, setEditingEventType,
        saveCustomRelation, saveCustomEventType, saveCustomAddEventName, openNewPersonModal, openEditPersonModal,
        handleEditEventChange, handleAddFixedEvents, handleSavePerson, resetGiftForm, openNewGiftModal, openEditGiftModal,
        handleSaveRegalo, handleAddEventToPerson, askConfirm, executeConfirm, handleDeleteSingleGift, handleArchive, getFilteredGifts,
        getTotaleSpeso, handleEmailAuth, handleGoogleLogin, handleLogout, handleRestore, handlePermanentDelete, handlePhotoUpload, handleGiftImageUpload,
        handleSidebarClick, handleHomeClick, handleSelectUid, handleTabChange, getActivePerson, getHeaderInfo, getStatsBreakdown,
        handleRefreshAmazonSuggestions,
        updateSuggestions,
        handleEditCustomEventType,
        handleDeleteCustomEventType,
        handleDeleteEventFromTab,
        handleDeleteEventFromModal,
        customRelazioni, editingRelationType, setEditingRelationType,
        handleEditCustomRelationType, handleDeleteCustomRelationType,
    };
};
