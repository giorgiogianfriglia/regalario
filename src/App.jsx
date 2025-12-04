import React from 'react';
import { useRegalario } from './hooks/useRegalario';
import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import {
    Toast,
    ConfirmModal,
    SettingsModal,
    PersonModal,
    GiftModal,
    AddEventModal,
    ArchiveModal,
    StatsModal,
} from './components/modals/Modals';
import { calcolaOccorrenza, formatFixedDate } from './utils/helpers';

export default function App() {
    const regalario = useRegalario();

    if (!regalario.session) {
        return <AuthScreen {...regalario} />;
    }

    return (
        <div className="flex flex-col md:flex-row bg-white text-gray-800 relative h-full pt-[env(safe-area-inset-top)]">
            {regalario.toastMsg && <Toast msg={regalario.toastMsg} />}

            {regalario.confirmConfig.show && (
                <ConfirmModal
                    config={regalario.confirmConfig}
                    onCancel={() => regalario.setConfirmConfig({ ...regalario.confirmConfig, show: false })}
                    onConfirm={regalario.executeConfirm}
                />
            )}

            <div className="flex-grow contents order-2 md:order-1">
                <Sidebar {...regalario} />
            </div>
            <div className="flex-grow contents order-1 md:order-2">
                <MainContent {...regalario} calcolaOccorrenza={calcolaOccorrenza} formatFixedDate={formatFixedDate} />
            </div>

            {regalario.showSettings && (
                <SettingsModal
                    {...regalario}
                    onClose={() => regalario.setShowSettings(false)}
                />
            )}

            {regalario.showModalPerson && (
                <PersonModal
                    onClose={() => regalario.setShowModalPerson(false)}
                    {...regalario}
                />
            )}

            {regalario.showModalGift && (
                <GiftModal
                    onClose={() => {
                        regalario.setShowModalGift(false);
                        regalario.setPendingNewEventData(null);
                    }}
                    {...regalario}
                />
            )}

            {regalario.showAddEventModal && (
                <AddEventModal
                    onClose={() => regalario.setShowAddEventModal(false)}
                    isAddingEventFromGiftModal={regalario.isAddingEventFromGiftModal}
                    setIsAddingEventFromGiftModal={regalario.setIsAddingEventFromGiftModal}
                    setPendingNewEventData={regalario.setPendingNewEventData}
                    {...regalario}
                />
            )}

            {regalario.showArchive && (
                <ArchiveModal
                    onClose={() => regalario.setShowArchive(false)}
                    {...regalario}
                />
            )}

            {regalario.showModalStats && regalario.activePerson && (
                <StatsModal
                    onClose={() => regalario.setShowModalStats(false)}
                    {...regalario}
                />
            )}
        </div>
    );
}
