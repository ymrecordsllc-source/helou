import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, AppSection } from './components/Navbar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CoinsWalletModal } from './components/CoinsWalletModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CeoProfileEditModal } from './components/CeoProfileEditModal';
import { AuditionDetailModal } from './components/AuditionDetailModal';
import { MerchShowcaseModal } from './components/MerchShowcaseModal';
import { UserProfilePreviewModal } from './components/UserProfilePreviewModal';
import { LandingAndAuthView } from './components/LandingAndAuthView';
import { ForumsSection } from './components/ForumsSection';
import { AuditionsSection } from './components/AuditionsSection';
import { ChatsSection } from './components/ChatsSection';
import { FansSection } from './components/FansSection';
import { StoreSection } from './components/StoreSection';
import { IdCardSection } from './components/IdCardSection';
import { ConfigurationSection } from './components/ConfigurationSection';
import { ProfileCustomizeSection } from './components/ProfileCustomizeSection';
import { FashionSection } from './components/FashionSection';
import { ReleasesSection } from './components/ReleasesSection';
import { AwardsSection } from './components/AwardsSection';
import { SurvivalSection } from './components/SurvivalSection';
import { ChartsSection } from './components/ChartsSection';
import { PartnersSection } from './components/PartnersSection';
import { AchievementsSection } from './components/AchievementsSection';
import { CalendarSection } from './components/CalendarSection';
import { ModerationSection } from './components/ModerationSection';
import { CollaborationsSection } from './components/CollaborationsSection';
import { AuditionSubmission } from './types';

const MainApp: React.FC = () => {
  const {
    currentUser,
    userProfile,
    toastMessage,
    openProfileByUsername
  } = useApp();

  const VALID_SECTIONS: AppSection[] = [
    'foros', 'audiciones', 'chats', 'fans', 'tienda', 'fashion', 'lanzamientos',
    'premiaciones', 'survival', 'charts', 'partners', 'calendario', 'colaboraciones',
    'logros', 'moderacion', 'idcard', 'configuracion', 'customize'
  ];

  const getInitialSection = (): AppSection => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase() as AppSection;
      if (VALID_SECTIONS.includes(hash)) {
        return hash;
      }
    }
    return 'foros';
  };

  const [currentSection, setCurrentSection] = useState<AppSection>(getInitialSection);
  const [selectedForumId, setSelectedForumId] = useState<string | null>(null);
  const [selectedStoreProductId, setSelectedStoreProductId] = useState<string | null>(null);

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isCeoEditModalOpen, setIsCeoEditModalOpen] = useState(false);
  const [isMerchShowcaseModalOpen, setIsMerchShowcaseModalOpen] = useState(false);

  // Active audition for review modal
  const [auditionToReview, setAuditionToReview] = useState<AuditionSubmission | null>(null);

  // Store search initial query
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  // Target chat for direct messaging
  const [activeChatTarget, setActiveChatTarget] = useState<string | null>(null);

  // Sync currentSection with URL Hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase() as AppSection;
      if (VALID_SECTIONS.includes(hash)) {
        setCurrentSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToSection = (sec: AppSection) => {
    if (sec === 'audiciones' && userProfile?.accountType === 'fan') {
      return;
    }
    if (sec === 'tienda') setStoreSearchQuery('');
    setCurrentSection(sec);
    if (typeof window !== 'undefined') {
      window.location.hash = sec;
    }
  };

  // Enforce: Fan accounts must NEVER access audiciones
  React.useEffect(() => {
    if (userProfile?.accountType === 'fan' && currentSection === 'audiciones') {
      navigateToSection('foros');
    }
  }, [userProfile?.accountType, currentSection]);

  if (!currentUser) {
    return <LandingAndAuthView />;
  }

  const handleOpenChatWithUser = (username: string) => {
    setActiveChatTarget(username);
    navigateToSection('chats');
  };

  const handleSearchProductInStore = (query: string) => {
    setStoreSearchQuery(query);
    setSelectedStoreProductId(null);
    navigateToSection('tienda');
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light-theme:bg-slate-50 text-slate-100 light-theme:text-slate-900 flex flex-col font-sans transition-colors duration-200">
      {/* Sticky Single-line Navbar with icon-only hover-expansion */}
      <Navbar
        currentSection={currentSection}
        onSelectSection={navigateToSection}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCoinsModal={() => setIsCoinsModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto w-full">
        {currentSection === 'foros' && (
          <ForumsSection
            onOpenUserProfile={openProfileByUsername}
            onGoToFansClub={(clubId) => navigateToSection('fans')}
            initialSelectedForumId={selectedForumId}
          />
        )}

        {currentSection === 'audiciones' && userProfile.accountType !== 'fan' && (
          <AuditionsSection
            onSelectAuditionToReview={(aud) => setAuditionToReview(aud)}
          />
        )}

        {currentSection === 'charts' && (
          <ChartsSection />
        )}

        {currentSection === 'partners' && (
          <PartnersSection />
        )}

        {currentSection === 'chats' && (
          <ChatsSection
            onOpenUserProfile={openProfileByUsername}
            activeChatTarget={activeChatTarget}
          />
        )}

        {currentSection === 'fans' && (
          <FansSection
            onOpenUserProfile={openProfileByUsername}
            onOpenChatWithUser={handleOpenChatWithUser}
          />
        )}

        {currentSection === 'tienda' && (
          <StoreSection
            initialSearchQuery={storeSearchQuery}
            initialSelectedProductId={selectedStoreProductId}
          />
        )}

        {currentSection === 'fashion' && (
          <FashionSection
            onGoToStoreProduct={(prodId) => {
              setSelectedStoreProductId(prodId);
              navigateToSection('tienda');
            }}
            onOpenUserProfile={openProfileByUsername}
          />
        )}

        {currentSection === 'lanzamientos' && <ReleasesSection />}

        {currentSection === 'premiaciones' && <AwardsSection />}

        {currentSection === 'survival' && <SurvivalSection />}

        {currentSection === 'calendario' && (
          <CalendarSection onNavigateToSection={(sec) => navigateToSection(sec)} />
        )}

        {currentSection === 'colaboraciones' && (
          <CollaborationsSection
            onOpenUserProfile={openProfileByUsername}
            onOpenChatWithUser={handleOpenChatWithUser}
            onGoToChatsGroup={(groupId) => {
              setActiveChatTarget(groupId);
              navigateToSection('chats');
            }}
          />
        )}

        {currentSection === 'logros' && (
          <AchievementsSection />
        )}

        {currentSection === 'moderacion' && (
          <ModerationSection />
        )}

        {currentSection === 'idcard' && <IdCardSection />}

        {currentSection === 'configuracion' && <ConfigurationSection />}

        {currentSection === 'customize' && (
          <ProfileCustomizeSection onBack={() => navigateToSection('foros')} />
        )}
      </main>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onGoToSection={(sec) => navigateToSection(sec)}
        onOpenMerchShowcase={() => setIsMerchShowcaseModalOpen(true)}
        onOpenCoinsModal={() => setIsCoinsModalOpen(true)}
        onOpenCeoEditModal={() => setIsCeoEditModalOpen(true)}
        onSelectForum={(forumId) => {
          setSelectedForumId(forumId);
          navigateToSection('foros');
        }}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectForum={(forumId) => {
          setSelectedForumId(forumId);
          navigateToSection('foros');
        }}
        onSelectStore={(query) => {
          setStoreSearchQuery(query);
          setSelectedStoreProductId(null);
          navigateToSection('tienda');
        }}
        onSelectUser={(username) => {
          openProfileByUsername(username);
        }}
        onSelectFans={() => {
          navigateToSection('fans');
        }}
      />

      {/* Coins & Wallet Modal */}
      <CoinsWalletModal
        isOpen={isCoinsModalOpen}
        onClose={() => setIsCoinsModalOpen(false)}
      />

      {/* Notifications Modal (with "Ver" button leading to Audition Review) */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onViewAudition={(aud) => setAuditionToReview(aud)}
      />

      {/* CEO Profile Edit Modal (For Admins) */}
      <CeoProfileEditModal
        isOpen={isCeoEditModalOpen}
        onClose={() => setIsCeoEditModalOpen(false)}
      />

      {/* Audition Detail & Evaluation Modal */}
      <AuditionDetailModal
        audition={auditionToReview}
        onClose={() => setAuditionToReview(null)}
        onReaudition={() => navigateToSection('audiciones')}
      />

      {/* Merch Showcase Manager Modal */}
      <MerchShowcaseModal
        isOpen={isMerchShowcaseModalOpen}
        onClose={() => setIsMerchShowcaseModalOpen(false)}
        onGoToStore={() => navigateToSection('tienda')}
      />

      {/* User Profile Preview Modal */}
      <UserProfilePreviewModal
        onOpenChatWithUser={handleOpenChatWithUser}
        onSearchProductInStore={handleSearchProductInStore}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-slate-900 light-theme:bg-white text-white light-theme:text-slate-900 border border-indigo-500/80 px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
