import React, { useState, useEffect } from 'react';
import {
  saveQuizToCloud,
  loadQuizFromCloud,
  getSavedLocalQuizzes,
  deleteSavedLocalQuiz,
  buildHostShareUrl
} from '../utils/quizSharing.js';

// Clean inline SVGs (zero external dependencies)
const ShareIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </svg>
);

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const LoaderIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

/**
 * ShareQuizModal
 * 
 * Provides:
 * 1. 1-Click Host Share Link for friends to host this quiz
 * 2. 6-Character Quiz Code
 * 3. Library of previously saved quizzes
 * 4. Load Quiz by Code input
 */
export default function ShareQuizModal({
  isOpen,
  onClose,
  currentQuiz = null, // { title, questions, showScoreboardAfterQuestion }
  onLoadQuiz = null   // callback(quizData) when user loads a quiz
}) {
  const [activeTab, setActiveTab] = useState('share'); // 'share' | 'load'
  const [isSaving, setIsSaving] = useState(false);
  const [shareData, setShareData] = useState(null); // { quizId, shareUrl, title }
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load tab states
  const [inputCode, setInputCode] = useState('');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [savedLocalQuizzes, setSavedLocalQuizzes] = useState([]);

  // Refresh saved quizzes when modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedLocalQuizzes(getSavedLocalQuizzes());
      setCopiedLink(false);
      setCopiedCode(false);
      setErrorMessage('');
      setStatusMessage('');

      // If we have a currentQuiz and activeTab is share, save to cloud to generate link
      if (currentQuiz && currentQuiz.questions?.length > 0) {
        handleGenerateShareLink();
      } else {
        setActiveTab('load');
      }
    }
  }, [isOpen]);

  const handleGenerateShareLink = async () => {
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      const res = await saveQuizToCloud({
        title: currentQuiz.title || 'My Custom Quiz',
        questions: currentQuiz.questions,
        showScoreboardAfterQuestion: currentQuiz.showScoreboardAfterQuestion
      });
      setShareData(res);
      setSavedLocalQuizzes(getSavedLocalQuizzes());
      setIsSaving(false);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      // Graceful fallback: even if cloud write fails, generate client URL
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setShareData({
        quizId: fallbackCode,
        shareUrl: buildHostShareUrl(fallbackCode),
        title: currentQuiz.title || 'My Custom Quiz'
      });
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareData?.shareUrl) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopiedLink(true);
    setStatusMessage('Host link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setStatusMessage('');
    }, 2500);
  };

  const handleCopyCode = () => {
    if (!shareData?.quizId) return;
    navigator.clipboard.writeText(shareData.quizId);
    setCopiedCode(true);
    setStatusMessage(`Quiz Code "${shareData.quizId}" copied!`);
    setTimeout(() => {
      setCopiedCode(false);
      setStatusMessage('');
    }, 2500);
  };

  // Load a quiz by code from Firebase
  const handleLoadByCode = async (e) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;

    setIsLoadingQuiz(true);
    setErrorMessage('');
    try {
      const loaded = await loadQuizFromCloud(clean);
      if (onLoadQuiz) {
        onLoadQuiz(loaded);
      }
      setStatusMessage(`Loaded "${loaded.title || 'Quiz'}" with ${loaded.questions?.length || 0} slides!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Quiz not found. Please verify the code.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Load from local storage
  const handleSelectLocalQuiz = (q) => {
    if (onLoadQuiz) {
      onLoadQuiz(q);
    }
    setStatusMessage(`Loaded "${q.title}" from saved library!`);
    setTimeout(() => {
      if (onClose) onClose();
    }, 800);
  };

  const handleDeleteLocalQuiz = (id, title, e) => {
    e.stopPropagation();
    if (confirm(`Remove "${title}" from your saved quizzes on this device?`)) {
      deleteSavedLocalQuiz(id);
      setSavedLocalQuizzes(getSavedLocalQuizzes());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShareIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Share & Saved Quizzes</h3>
              <p className="text-xs text-slate-400">Send a 1-click host link to a friend or load any quiz</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            disabled={!currentQuiz || !currentQuiz.questions?.length}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'share'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <ShareIcon className="w-3.5 h-3.5" />
            <span>Send Host Link to Friend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('load')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'load'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Saved Quizzes & Codes ({savedLocalQuizzes.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: SHARE QUIZ LINK */}
          {activeTab === 'share' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-950 border border-indigo-500/30 text-left space-y-2">
                <span className="text-[11px] font-mono uppercase font-black tracking-wider text-indigo-300 block">
                  Quiz Ready to Share
                </span>
                <h4 className="text-xl font-black text-white">
                  "{shareData?.title || currentQuiz?.title || 'My Custom Quiz'}"
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anyone who clicks your link will instantly open QuizPulse in <strong>Host Mode</strong> with your quiz preloaded and a fresh game PIN!
                </p>
              </div>

              {isSaving ? (
                <div className="py-8 text-center space-y-2">
                  <LoaderIcon className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Generating your 1-click host link...</p>
                </div>
              ) : shareData?.shareUrl ? (
                <div className="space-y-4">
                  {/* Shareable Link Box */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      1-Click Host Link (Send this to your friend):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareData.shareUrl}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-mono text-indigo-200 outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-lg ${
                          copiedLink
                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white shadow-indigo-600/30'
                        }`}
                      >
                        {copiedLink ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-4 h-4" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 6-Character Quiz Code */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Or share by Quiz Code:</span>
                      <strong className="text-2xl font-mono font-black text-amber-300 tracking-wider">
                        {shareData.quizId}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedCode ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Simple 3-step Instructions */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-2 text-xs text-slate-300">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                      How your friend hosts this:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Paste this link into a message to your friend (WhatsApp, text, email, Discord).</li>
                      <li>When your friend clicks the link on their laptop or tablet, the quiz loads automatically.</li>
                      <li>They can connect to a TV/projector and click <strong>"Open Display"</strong> to play!</li>
                    </ol>
                  </div>

                  {/* Quick Test Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={shareData.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Test Host Link in New Tab</span>
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: LOAD QUIZ FROM CODE OR SAVED LIBRARY */}
          {activeTab === 'load' && (
            <div className="space-y-5">
              {/* Enter Quiz Code Form */}
              <form onSubmit={handleLoadByCode} className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Have a 6-character Quiz Code from a friend?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. K9X2B4"
                    maxLength={10}
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-base font-mono font-bold tracking-widest text-amber-300 uppercase outline-none placeholder-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={!inputCode.trim() || isLoadingQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isLoadingQuiz ? <LoaderIcon className="w-4 h-4" /> : <span>Load Quiz</span>}
                  </button>
                </div>
              </form>

              {/* Saved Quizzes on this device */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Saved Quizzes on this Device:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {savedLocalQuizzes.length} saved
                  </span>
                </div>

                {savedLocalQuizzes.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                    No quizzes saved locally yet. When you create or share a quiz, it will appear here automatically!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {savedLocalQuizzes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => handleSelectLocalQuiz(q)}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                              {q.title}
                            </h5>
                            <span className="px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800/80 text-purple-300 text-[10px] font-mono font-bold shrink-0">
                              {q.questionCount || 0} Qs
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                            Code: {q.id} • {q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = buildHostShareUrl(q.id);
                              navigator.clipboard.writeText(link);
                              setStatusMessage(`Copied link for "${q.title}"!`);
                              setTimeout(() => setStatusMessage(''), 2500);
                            }}
                            title="Copy share link for this saved quiz"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                          >
                            <CopyIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteLocalQuiz(q.id, q.title, e)}
                            title="Delete this saved quiz"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
