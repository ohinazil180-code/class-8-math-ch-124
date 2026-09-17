import React, { useState, useEffect, useCallback } from 'react';
import { MainNavTab, SlideData } from './types';
import { ALL_SLIDES, TOTAL_SLIDES_COUNT, getSlideById } from './data/slides';
import { Header } from './components/Header';
import { SlideSidebar } from './components/SlideSidebar';
import { SlideViewer } from './components/SlideViewer';
import { MathLabsView } from './components/MathLabsView';
import { FormulaBankView } from './components/FormulaBankView';
import { GlossaryView } from './components/GlossaryView';
import { ExamArenaView } from './components/ExamArenaView';
import { ProgressView } from './components/ProgressView';
import { PeerStudyView } from './components/PeerStudyView';
import { PeerRoomBanner } from './components/PeerRoomBanner';
import { QuickSearchModal } from './components/QuickSearchModal';
import { usePeerStudy } from './hooks/usePeerStudy';
import { playSound } from './utils/audio';
import { Radio } from 'lucide-react';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<MainNavTab>('slides');

  // Active Slide ID (1 - 500)
  const [currentSlideId, setCurrentSlideId] = useState<number>(() => {
    const saved = localStorage.getItem('class8_math_active_slide');
    if (saved) {
      const num = parseInt(saved, 10);
      if (num >= 1 && num <= TOTAL_SLIDES_COUNT) return num;
    }
    return 1;
  });

  // Completed Slides
  const [completedSlideIds, setCompletedSlideIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('class8_math_completed_slides');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  // Bookmarked Slides
  const [bookmarkedSlideIds, setBookmarkedSlideIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('class8_math_bookmarked_slides');
      return saved ? JSON.parse(saved) : [21, 146, 276];
    } catch {
      return [21, 146, 276];
    }
  });

  // XP & Gamification
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('class8_math_xp');
    return saved ? parseInt(saved, 10) : 50;
  });

  // Sound effects
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('class8_math_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Classroom / Presentation mode
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Sidebar Drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarActiveView, setSidebarActiveView] = useState<'slides' | 'solver'>('slides');

  // Quick Search Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Laser Pointer mode
  const [isLaserActive, setIsLaserActive] = useState<boolean>(false);

  // Handle slide completion and XP increment
  const markSlideCompleted = useCallback((id: number) => {
    setCompletedSlideIds(prev => {
      if (!prev.includes(id)) {
        setXp(x => x + 10);
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // Peer Study Hook
  const {
    room,
    currentUser,
    isConnected,
    isConnecting,
    error: peerError,
    followSync,
    setFollowSync,
    remotePointer,
    peerNotification,
    createRoom,
    joinRoom,
    leaveRoom,
    syncSlideChange,
    sendChat,
    sendPointer,
    startPoll,
    votePoll,
    closePoll,
    toggleAllowAnyPresenter,
    sendWhiteboardStroke,
    clearWhiteboard,
    undoWhiteboardStroke,
    activeWhiteboardDrawer,
  } = usePeerStudy(currentSlideId, (newSlideId) => {
    setCurrentSlideId(newSlideId);
    markSlideCompleted(newSlideId);
  });

  const [peerInitialSection, setPeerInitialSection] = useState<'slides' | 'whiteboard'>('slides');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('class8_math_active_slide', currentSlideId.toString());
  }, [currentSlideId]);

  useEffect(() => {
    localStorage.setItem('class8_math_completed_slides', JSON.stringify(completedSlideIds));
  }, [completedSlideIds]);

  useEffect(() => {
    localStorage.setItem('class8_math_bookmarked_slides', JSON.stringify(bookmarkedSlideIds));
  }, [bookmarkedSlideIds]);

  useEffect(() => {
    localStorage.setItem('class8_math_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('class8_math_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Current Slide Object
  const currentSlide = getSlideById(currentSlideId) || ALL_SLIDES[0];
  const slideIndex = ALL_SLIDES.findIndex(s => s.id === currentSlideId);

  // Jump to specific slide
  const handleJumpToSlide = useCallback((id: number, broadcast = true) => {
    if (id >= 1 && id <= TOTAL_SLIDES_COUNT) {
      setCurrentSlideId(id);
      setCurrentTab('slides');
      markSlideCompleted(id);
      if (broadcast) {
        syncSlideChange(id);
      }
    }
  }, [markSlideCompleted, syncSlideChange]);

  // Next slide
  const handleNextSlide = useCallback(() => {
    if (slideIndex < TOTAL_SLIDES_COUNT - 1) {
      const nextSlide = ALL_SLIDES[slideIndex + 1];
      setCurrentSlideId(nextSlide.id);
      markSlideCompleted(nextSlide.id);
      syncSlideChange(nextSlide.id);
    }
  }, [slideIndex, markSlideCompleted, syncSlideChange]);

  // Previous slide
  const handlePrevSlide = useCallback(() => {
    if (slideIndex > 0) {
      const prevSlide = ALL_SLIDES[slideIndex - 1];
      setCurrentSlideId(prevSlide.id);
      markSlideCompleted(prevSlide.id);
      syncSlideChange(prevSlide.id);
    }
  }, [slideIndex, markSlideCompleted, syncSlideChange]);

  // Toggle Bookmark
  const handleToggleBookmark = useCallback((id?: number) => {
    const targetId = id || currentSlideId;
    setBookmarkedSlideIds(prev => {
      if (prev.includes(targetId)) {
        return prev.filter(item => item !== targetId);
      } else {
        if (soundEnabled) playSound('click');
        return [...prev, targetId];
      }
    });
  }, [currentSlideId, soundEnabled]);

  // Award XP from quizzes / exams
  const handleAwardXP = useCallback((amount: number) => {
    setXp(prev => prev + amount);
  }, []);

  // Reset progress
  const handleResetProgress = useCallback(() => {
    setCompletedSlideIds([1]);
    setBookmarkedSlideIds([]);
    setXp(0);
    setCurrentSlideId(1);
    localStorage.removeItem('class8_math_completed_slides');
    localStorage.removeItem('class8_math_bookmarked_slides');
    localStorage.removeItem('class8_math_xp');
    localStorage.removeItem('class8_math_active_slide');
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast peer notification */}
      {peerNotification && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-500/50 backdrop-blur text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{peerNotification}</span>
        </div>
      )}

      {/* Header */}
      {!isPresentationMode && (
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentSlideId={currentSlideId}
          totalSlides={TOTAL_SLIDES_COUNT}
          onJumpToSlide={handleJumpToSlide}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          isPresentationMode={isPresentationMode}
          onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onOpenSolver={() => {
            setSidebarActiveView('solver');
            setIsSidebarOpen(true);
          }}
          xp={xp}
          activePeerRoomCode={room?.roomCode}
          peerUserCount={room?.users.length}
        />
      )}

      {/* Slide Navigation Sidebar Drawer */}
      <SlideSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSlideId={currentSlideId}
        onSelectSlide={handleJumpToSlide}
        allSlides={ALL_SLIDES}
        bookmarkedSlideIds={bookmarkedSlideIds}
        completedSlideIds={completedSlideIds}
        onToggleBookmark={handleToggleBookmark}
        soundEnabled={soundEnabled}
        activeView={sidebarActiveView}
        onViewChange={setSidebarActiveView}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        allSlides={ALL_SLIDES}
        onSelectSlide={handleJumpToSlide}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col overflow-x-hidden relative">
        {currentTab === 'slides' && (
          <>
            <SlideViewer
              slide={currentSlide}
              slideIndex={slideIndex}
              totalSlides={TOTAL_SLIDES_COUNT}
              onNextSlide={handleNextSlide}
              onPrevSlide={handlePrevSlide}
              isBookmarked={bookmarkedSlideIds.includes(currentSlideId)}
              onToggleBookmark={() => handleToggleBookmark(currentSlideId)}
              soundEnabled={soundEnabled}
              isPresentationMode={isPresentationMode}
              onQuizAnswer={(correct) => {
                if (correct) handleAwardXP(20);
              }}
              isLaserActive={isLaserActive}
              onSendLaserPointer={(x, y) => sendPointer(x, y, currentSlideId)}
              remotePointer={remotePointer}
            />

            {/* In-slide floating peer room widget */}
            {room && (
              <PeerRoomBanner
                room={room}
                currentUser={currentUser}
                currentSlideId={currentSlideId}
                followSync={followSync}
                onToggleFollowSync={() => setFollowSync(!followSync)}
                onJumpToRoomSlide={() => handleJumpToSlide(room.currentSlideId, false)}
                isLaserActive={isLaserActive}
                onToggleLaser={() => setIsLaserActive(!isLaserActive)}
                sendChat={sendChat}
                votePoll={votePoll}
                onOpenPeerTab={() => {
                  setPeerInitialSection('slides');
                  setCurrentTab('peer');
                }}
                onOpenWhiteboard={() => {
                  setPeerInitialSection('whiteboard');
                  setCurrentTab('peer');
                }}
                soundEnabled={soundEnabled}
              />
            )}
          </>
        )}

        {currentTab === 'peer' && (
          <PeerStudyView
            room={room}
            currentUser={currentUser}
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={peerError}
            followSync={followSync}
            setFollowSync={setFollowSync}
            createRoom={createRoom}
            joinRoom={joinRoom}
            leaveRoom={leaveRoom}
            syncSlideChange={syncSlideChange}
            sendChat={sendChat}
            startPoll={startPoll}
            votePoll={votePoll}
            closePoll={closePoll}
            toggleAllowAnyPresenter={toggleAllowAnyPresenter}
            currentSlideId={currentSlideId}
            currentSlide={currentSlide}
            onJumpToSlide={handleJumpToSlide}
            onSwitchToSlidesTab={() => setCurrentTab('slides')}
            soundEnabled={soundEnabled}
            onSendWhiteboardStroke={sendWhiteboardStroke}
            onClearWhiteboard={clearWhiteboard}
            onUndoWhiteboard={undoWhiteboardStroke}
            activeWhiteboardDrawer={activeWhiteboardDrawer}
            initialRoomSection={peerInitialSection}
          />
        )}

        {currentTab === 'labs' && (
          <MathLabsView soundEnabled={soundEnabled} />
        )}

        {currentTab === 'formulas' && (
          <FormulaBankView />
        )}

        {currentTab === 'glossary' && (
          <GlossaryView />
        )}

        {currentTab === 'exam' && (
          <ExamArenaView
            soundEnabled={soundEnabled}
            onAwardXP={handleAwardXP}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            completedSlideIds={completedSlideIds}
            bookmarkedSlideIds={bookmarkedSlideIds}
            allSlides={ALL_SLIDES}
            xp={xp}
            onJumpToSlide={handleJumpToSlide}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>
    </div>
  );
}

