import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  Smartphone,
  Monitor,
  Square,
  Film,
  Video,
  Clock,
  Copy,
  Hash,
  Tag,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SiteContent, Project, DesignFocusItem, ProjectSection, ApproachStep, ExperienceItem, VideoKeyframe } from '../types';
import { ADMIN_PASSWORD, setAdminSession } from '../utils/storage';
import { MediaFileUpload, MultiImageSliceUpload } from './MediaFileUpload';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  onSaveContent: (newContent: SiteContent) => Promise<{ success: boolean; cloudSynced?: boolean; error?: string }> | void;
  onResetContent: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  content,
  onSaveContent,
  onResetContent,
  isAdmin,
  setIsAdmin,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'hero' | 'approach' | 'about' | 'contact' | 'backup'>('projects');
  
  // Local editable draft state
  const [draft, setDraft] = useState<SiteContent>(content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Selected project for editing in projects tab
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Reset draft when content changes
  useEffect(() => {
    setDraft(content);
  }, [content]);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminSession(true);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminSession(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const res = await onSaveContent(draft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '브라우저에 안전하게 저장되었습니다 (클라우드 동기화 대기 중)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else if (res && !res.success) {
        setSaveError(res.error || '저장 중 문제가 발생했습니다.');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setSaveError(err?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('모든 포트폴리오 데이터를 초기 샘플 데이터로 복원하시겠습니까? (작성한 내용이 초기화됩니다)')) {
      onResetContent();
      setEditingProject(null);
      setIsCreatingNewProject(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(draft, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.hero && parsed.projects && parsed.about) {
          setDraft(parsed);
          onSaveContent(parsed);
          alert('데이터를 성공적으로 불러왔습니다.');
        } else {
          alert('올바른 포트폴리오 백업 JSON 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  // Project CRUD helpers
  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    const newProjects = [...draft.projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;
    // Re-number projects
    newProjects.forEach((p, idx) => {
      p.number = String(idx + 1).padStart(2, '0');
    });
    const newDraft = { ...draft, projects: newProjects };
    setDraft(newDraft);
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await onSaveContent(newDraft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else if (res && !res.success) {
        setSaveError(res.error || '순서 변경 저장 실패');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e: any) {
      setSaveError(e?.message || '순서 변경 저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('이 프로젝트를 삭제하시겠습니까?')) {
      const filtered = draft.projects.filter((p) => p.id !== id);
      filtered.forEach((p, idx) => {
        p.number = String(idx + 1).padStart(2, '0');
      });
      const newDraft = { ...draft, projects: filtered };
      setDraft(newDraft);
      if (editingProject?.id === id) {
        setEditingProject(null);
      }
      setIsSaving(true);
      setSaveError(null);
      setSaveNotice(null);
      try {
        const res = await onSaveContent(newDraft);
        if (res && res.success) {
          setIsCloudSynced(res.cloudSynced !== false);
          setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } else if (res && !res.success) {
          setSaveError(res.error || '프로젝트 삭제 실패');
        } else {
          setIsCloudSynced(true);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        }
      } catch (e: any) {
        setSaveError(e?.message || '프로젝트 삭제 실패');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDuplicateProject = async (proj: Project) => {
    const newId = `proj-${Date.now()}`;
    const duplicated: Project = {
      ...JSON.parse(JSON.stringify(proj)),
      id: newId,
      number: String(draft.projects.length + 1).padStart(2, '0'),
      title: `${proj.title} (복사본)`,
    };
    const updatedProjects = [...draft.projects, duplicated];
    const newDraft = { ...draft, projects: updatedProjects };
    setDraft(newDraft);
    setIsSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const res = await onSaveContent(newDraft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else if (res && !res.success) {
        setSaveError(res.error || '복제본 저장 실패');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e: any) {
      setSaveError(e?.message || '저장 중 오류 발생');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const updatedProjects = draft.projects.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          isPublished: p.isPublished === false ? true : false,
        };
      }
      return p;
    });
    const newDraft = { ...draft, projects: updatedProjects };
    setDraft(newDraft);
    setIsSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const res = await onSaveContent(newDraft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else if (res && !res.success) {
        setSaveError(res.error || '게시 상태 변경 저장 실패');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e: any) {
      setSaveError(e?.message || '저장 중 오류 발생');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetHeroFeatured = async (id: string) => {
    const updatedProjects = draft.projects.map((p) => ({
      ...p,
      featuredInHero: p.id === id,
    }));
    const newDraft = { ...draft, projects: updatedProjects };
    setDraft(newDraft);
    setIsSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const res = await onSaveContent(newDraft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else if (res && !res.success) {
        setSaveError(res.error || '메인 대표작 설정 저장 실패');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e: any) {
      setSaveError(e?.message || '저장 중 오류 발생');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditingProject = async (proj: Project) => {
    let updatedProjects: Project[];
    if (isCreatingNewProject) {
      proj.number = String(draft.projects.length + 1).padStart(2, '0');
      updatedProjects = [...draft.projects, proj];
    } else {
      updatedProjects = draft.projects.map((p) => (p.id === proj.id ? proj : p));
    }
    const newDraft = { ...draft, projects: updatedProjects };
    setDraft(newDraft);
    setEditingProject(null);
    setIsCreatingNewProject(false);
    setIsSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    try {
      const res = await onSaveContent(newDraft);
      if (res && res.success) {
        setIsCloudSynced(res.cloudSynced !== false);
        setSaveNotice(res.cloudSynced === false ? (res.error || '로컬에 안전하게 저장되었습니다 (클라우드 동기화 대기)') : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else if (res && !res.success) {
        setSaveError(res.error || '프로젝트 저장에 실패했습니다.');
      } else {
        setIsCloudSynced(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e: any) {
      setSaveError(e?.message || '저장 중 오류 발생');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      id="admin-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      {!isAdmin ? (
        /* Password Authentication Screen - Compact, Centered, High Contrast Dialog */
        <div
          id="admin-login-dialog"
          className="relative w-full max-w-md bg-[#181818] text-[#ECECE8] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#3A3A36] p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#242422] text-[#888880] hover:text-white hover:bg-[#333330] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2A2A28] border border-[#3A3A36] flex items-center justify-center text-amber-400 shadow-md">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">포트폴리오 관리자 모드</h3>
              <p className="text-xs text-[#999990] leading-relaxed">
                모든 프로젝트와 소개 콘텐츠를 실시간 수정할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-mono text-slate-400 block text-center">
                  관리자 비밀번호를 입력해주세요
                </label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#242422] border border-[#444440] text-white text-center text-sm tracking-widest focus:outline-none focus:border-amber-400 font-mono shadow-inner transition-colors"
                />
                {authError && (
                  <p className="text-xs text-red-400 text-center font-medium pt-1">
                    비밀번호가 일치하지 않습니다. 다시 입력해주세요.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#282826] text-[#A0A09A] text-xs font-bold hover:bg-[#333330] hover:text-white transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-white text-[#141414] text-xs font-bold uppercase tracking-wider hover:bg-[#EAEAEA] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                >
                  로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Admin Main Tabs Workspace */
        <div
          id="admin-workspace-dialog"
          className="relative w-full max-w-5xl h-[94vh] sm:h-[90vh] bg-[#181818] text-[#ECECE8] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#333330]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="bg-[#202020] px-6 py-4 border-b border-[#303030] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#2C2C2A] text-white">
                <Unlock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  <span>포트폴리오 관리자 콘솔</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                    ADMIN MODE
                  </span>
                </h2>
                <p className="text-[11px] text-[#888880]">
                  모든 텍스트, 프로젝트 이미지, 접근 방식 및 이력을 실시간 수정합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  isSaving 
                    ? 'bg-amber-600 text-white cursor-wait' 
                    : saveSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : saveError 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-[#141414] hover:bg-[#EAEAE5]'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>클라우드 저장 중...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>클라우드 반영 완료!</span>
                  </>
                ) : saveError ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>저장 실패</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>변경사항 저장</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                aria-label="관리자 창 닫기"
                className="p-1.5 rounded-lg hover:bg-[#333330] text-[#888880] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time sync feedback banner if saving / error / success */}
          {saveSuccess && isCloudSynced && (
            <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-6 py-2 flex items-center justify-between text-xs text-emerald-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Firebase 클라우드에 영구 저장되었습니다. 모든 방문자 및 시크릿 창에 즉시 반영됩니다!</span>
              </div>
            </div>
          )}
          {saveSuccess && !isCloudSynced && (
            <div className="bg-amber-950/80 border-b border-amber-800/80 px-6 py-2 flex items-center justify-between text-xs text-amber-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>작성하신 내용이 브라우저에 안전하게 보관되었습니다. (Firebase 일일 할당량 리셋 시 자동 클라우드 동기화됩니다)</span>
              </div>
              <button
                onClick={handleExportJson}
                className="underline hover:text-white ml-3 text-amber-200 cursor-pointer"
              >
                JSON 백업 다운로드
              </button>
            </div>
          )}
          {saveError && (
            <div className="bg-red-950/80 border-b border-red-800/80 px-6 py-2 flex items-center justify-between text-xs text-red-300 font-medium">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <span>{saveError}</span>
              </div>
              <button
                onClick={handleExportJson}
                className="underline hover:text-white ml-3 text-red-200 cursor-pointer"
              >
                데이터 백업 파일 받기
              </button>
            </div>
          )}

          {/* Nav Tabs */}
          <div className="bg-[#1E1E1C] px-6 border-b border-[#2C2C28] flex items-center gap-2 overflow-x-auto shrink-0">
            {[
              { id: 'projects', label: '01. 프로젝트 관리 (Works)' },
              { id: 'hero', label: '02. 메인 히어로 (Hero)' },
              { id: 'approach', label: '03. 디자인 철학 (Approach)' },
              { id: 'about', label: '04. 소개 & 스킬 & 이력 (About)' },
              { id: 'contact', label: '05. 연락처 & 메타 (Contact)' },
              { id: 'backup', label: '06. 데이터 백업 & 초기화' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingProject(null);
                  setIsCreatingNewProject(false);
                }}
                className={`px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-white text-white font-bold bg-[#262624]'
                    : 'border-transparent text-[#999990] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {/* TAB 1: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {editingProject ? (
                    <ProjectEditor
                      project={editingProject}
                      onSave={handleSaveEditingProject}
                      onCancel={() => {
                        setEditingProject(null);
                        setIsCreatingNewProject(false);
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">프로젝트 목록 ({draft.projects.length}개)</h3>
                          <p className="text-xs text-[#888880]">
                            상세페이지 및 콘텐츠 작업물을 추가, 수정, 순서 변경합니다.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newProj: Project = {
                              id: `proj-${Date.now()}`,
                              number: String(draft.projects.length + 1).padStart(2, '0'),
                              title: '신규 상세페이지 프로젝트',
                              category: 'DETAIL PAGE · CONTENT DESIGN',
                              summary: '프로젝트의 핵심 특징과 브랜드 이미지를 시각적으로 표현한 상세페이지.',
                              coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
                              tags: ['New Detail Page', 'Ecommerce', 'Promotion'],
                              role: 'Detail Page Design / Content Planning',
                              period: '2026.01 — 2026.02',
                              tools: 'Photoshop / Illustrator / After Effects',
                              background: '제품의 주요 특징과 브랜드 이미지를 효과적으로 전달하기 위해 상세페이지를 제작했습니다.',
                              designFocus: [
                                {
                                  id: 'f-1',
                                  title: '핵심 정보의 명확한 위계 설계',
                                  description: '소비자가 가장 궁금해하는 핵심 장점을 우선적으로 배치했습니다.'
                                }
                              ],
                              sections: [
                                {
                                  id: 'sec-1',
                                  title: '01. HERO SECTION',
                                  caption: '메인 훅 비주얼',
                                  imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85'
                                }
                              ],
                              outcome: {
                                result: '공식 런칭 페이지 적용',
                                details: '실제 판매 페이지에 적용되어 고객 이해도 향상.'
                              }
                            };
                            setEditingProject(newProj);
                            setIsCreatingNewProject(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-white text-[#141414] text-xs font-semibold hover:bg-[#EAEAEA]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>새 프로젝트 추가</span>
                        </button>
                      </div>

                      {/* Project Table / Cards */}
                      <div className="space-y-3">
                        {(draft.projects || []).map((proj, idx) => {
                          const isPub = proj.isPublished !== false;
                          return (
                            <div
                              key={proj.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                isPub 
                                  ? 'bg-[#222220] border-[#333330]' 
                                  : 'bg-[#1C1C1A] border-[#383834] border-dashed opacity-85'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={proj.coverImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85'}
                                    alt={proj.title}
                                    className="w-16 h-12 rounded-lg object-cover bg-[#333330] border border-[#444440]"
                                  />
                                  {!isPub && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                      <EyeOff className="w-4 h-4 text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-amber-400">
                                      {proj.number || String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <h4 className="text-sm font-bold text-white">{proj.title || 'Untitled'}</h4>
                                    {isPub ? (
                                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>노출 중</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-[#2A2A28] text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                                        <EyeOff className="w-2.5 h-2.5" />
                                        <span>숨김 상태</span>
                                      </span>
                                    )}
                                    {proj.featuredInHero && (
                                      <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                                        HERO FEATURED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#888880] font-mono">
                                    {proj.category || 'DETAIL PAGE'} · {proj.period || ''} · {(proj.sections || []).length} 섹션
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                                {/* Direct Visibility Toggle Button */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(proj.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                                    isPub
                                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/80'
                                      : 'bg-[#2A2A28] border-[#444440] text-slate-400 hover:text-white hover:bg-[#343430]'
                                  }`}
                                  title={isPub ? "클릭하여 사이트에서 숨기기" : "클릭하여 사이트에 노출(게시)하기"}
                                >
                                  {isPub ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span>{isPub ? '노출' : '숨김'}</span>
                                </button>

                                {/* Direct Hero Featured Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleSetHeroFeatured(proj.id)}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                                    proj.featuredInHero
                                      ? 'bg-pink-950/80 border-pink-500/90 text-pink-200 font-bold shadow-xs'
                                      : 'bg-[#2A2A28] border-[#444440] text-slate-400 hover:text-pink-300 hover:bg-[#343430]'
                                  }`}
                                  title={proj.featuredInHero ? "현재 메인 최상단에 노출되는 대표 프로젝트입니다" : "이 프로젝트를 메인 최상단 대표작으로 설정하기"}
                                >
                                  <Sparkles className={`w-3.5 h-3.5 ${proj.featuredInHero ? 'text-pink-400 fill-pink-400' : ''}`} />
                                  <span>{proj.featuredInHero ? '⭐ 대표작' : '대표작 지정'}</span>
                                </button>

                                <button
                                  onClick={() => handleMoveProject(idx, 'up')}
                                  disabled={idx === 0}
                                  title="위로 이동"
                                  className="p-1.5 rounded bg-[#2C2C28] hover:bg-[#383834] text-[#A0A09A] disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveProject(idx, 'down')}
                                  disabled={idx === (draft.projects || []).length - 1}
                                  title="아래로 이동"
                                  className="p-1.5 rounded bg-[#2C2C28] hover:bg-[#383834] text-[#A0A09A] disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setIsCreatingNewProject(false);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#333330] hover:bg-[#40403C] text-xs text-white font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>상세 편집</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicateProject(proj)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#2C2C28] hover:bg-[#383834] text-xs text-amber-300 border border-[#3E3E3A]"
                                  title="이 프로젝트 복사하여 추가 (복제)"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>복제</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1.5 rounded bg-red-900/40 hover:bg-red-900/70 text-red-300"
                                  title="삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: HERO */}
              {activeTab === 'hero' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">메인 히어로 설정 & 대표작 선택</h3>
                      <p className="text-xs text-[#888880] mt-0.5">
                        웹사이트 최상단에 노출될 대표 프로젝트와 메인 카피 문구를 설정합니다.
                      </p>
                    </div>
                  </div>

                  {/* Featured Project Selector */}
                  <div className="p-4 rounded-xl bg-[#242422] border border-pink-900/40 space-y-2.5">
                    <label className="text-xs font-mono text-pink-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>메인 최상단 1개 대표 프로젝트 (Hero Featured Project)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      방문자가 사이트에 접속했을 때 우측 상단 쇼케이스 프레임에 노출될 대표 작업물을 선택합니다.
                    </p>
                    <select
                      value={draft.projects.find((p) => p.featuredInHero)?.id || draft.projects.find((p) => p.isPublished !== false)?.id || ''}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const updated = draft.projects.map((p) => ({
                          ...p,
                          featuredInHero: p.id === targetId,
                        }));
                        setDraft({ ...draft, projects: updated });
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C1A] border border-[#3A3A36] text-white text-xs font-mono focus:border-pink-500"
                    >
                      {draft.projects.map((p, pIdx) => {
                        const isPub = p.isPublished !== false;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.number || String(pIdx + 1).padStart(2, '0')}. {p.title} {isPub ? '(노출 중)' : '(숨김 상태)'} {p.featuredInHero ? '★ 현재 대표작' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">메인 카피 (첫 줄)</label>
                      <input
                        type="text"
                        value={draft.hero.mainCopyLine1}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            hero: { ...draft.hero, mainCopyLine1: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">메인 카피 (둘째 줄)</label>
                      <input
                        type="text"
                        value={draft.hero.mainCopyLine2}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            hero: { ...draft.hero, mainCopyLine2: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">서브 카피 (첫 줄)</label>
                      <input
                        type="text"
                        value={draft.hero.subCopyLine1}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            hero: { ...draft.hero, subCopyLine1: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">서브 카피 (둘째 줄)</label>
                      <textarea
                        rows={2}
                        value={draft.hero.subCopyLine2}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            hero: { ...draft.hero, subCopyLine2: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">CTA 버튼 텍스트</label>
                      <input
                        type="text"
                        value={draft.hero.ctaText}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            hero: { ...draft.hero, ctaText: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DESIGN APPROACH */}
              {activeTab === 'approach' && (
                <div className="space-y-6 max-w-3xl">
                  <h3 className="text-base font-bold text-white">디자인 철학 & 4단계 프로세스</h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">핵심 철학 인용구 (Core Quote)</label>
                      <textarea
                        rows={3}
                        value={draft.approach.coreQuote}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            approach: { ...draft.approach, coreQuote: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white resize-none"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#333330]">
                      <span className="text-xs font-mono font-bold text-[#A0A09A]">4단계 프로세스 수정</span>
                      {draft.approach.steps.map((st, idx) => (
                        <div key={st.step} className="p-4 rounded bg-[#222220] border border-[#333330] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-amber-400">0{idx + 1}</span>
                            <input
                              type="text"
                              value={st.enTitle}
                              onChange={(e) => {
                                const newSteps = [...draft.approach.steps];
                                newSteps[idx].enTitle = e.target.value;
                                setDraft({ ...draft, approach: { ...draft.approach, steps: newSteps } });
                              }}
                              className="px-2 py-1 rounded bg-[#2A2A28] text-xs font-mono text-white"
                            />
                          </div>
                          <input
                            type="text"
                            value={st.koTitle}
                            onChange={(e) => {
                              const newSteps = [...draft.approach.steps];
                              newSteps[idx].koTitle = e.target.value;
                              setDraft({ ...draft, approach: { ...draft.approach, steps: newSteps } });
                            }}
                            className="w-full px-3 py-1.5 rounded bg-[#282826] border border-[#3A3A36] text-xs sm:text-sm text-white"
                          />
                          <textarea
                            rows={2}
                            value={st.description}
                            onChange={(e) => {
                              const newSteps = [...draft.approach.steps];
                              newSteps[idx].description = e.target.value;
                              setDraft({ ...draft, approach: { ...draft.approach, steps: newSteps } });
                            }}
                            className="w-full px-3 py-1.5 rounded bg-[#282826] border border-[#3A3A36] text-xs text-[#B0B0A8] resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-6 max-w-3xl">
                  <h3 className="text-base font-bold text-white">디자이너 소개 & 이력</h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">인사말 (Greeting)</label>
                      <input
                        type="text"
                        value={draft.about.greeting}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            about: { ...draft.about, greeting: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">소개 본문 (Intro Paragraph)</label>
                      <textarea
                        rows={4}
                        value={draft.about.intro}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            about: { ...draft.about, intro: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm focus:border-white resize-none"
                      />
                    </div>

                    {/* 3 Strengths */}
                    <div className="space-y-3 pt-4 border-t border-[#333330]">
                      <span className="text-xs font-mono font-bold text-[#A0A09A]">핵심 강점 3가지 (Strengths)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {draft.about.strengths.map((st, sIdx) => (
                          <div key={st.id} className="p-3 rounded bg-[#222220] border border-[#333330] space-y-2">
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const newSt = [...draft.about.strengths];
                                newSt[sIdx].title = e.target.value;
                                setDraft({ ...draft, about: { ...draft.about, strengths: newSt } });
                              }}
                              className="w-full px-2 py-1 rounded bg-[#2C2C28] text-xs font-bold text-white"
                            />
                            <textarea
                              rows={3}
                              value={st.description}
                              onChange={(e) => {
                                const newSt = [...draft.about.strengths];
                                newSt[sIdx].description = e.target.value;
                                setDraft({ ...draft, about: { ...draft.about, strengths: newSt } });
                              }}
                              className="w-full px-2 py-1 rounded bg-[#2C2C28] text-[11px] text-[#A0A09A] resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CONTACT & META */}
              {activeTab === 'contact' && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-base font-bold text-white">연락처 & 메타 정보</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#888880]">디자이너 이름</label>
                        <input
                          type="text"
                          value={draft.meta.designerName}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              meta: { ...draft.meta, designerName: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#888880]">직함 / 타이틀</label>
                        <input
                          type="text"
                          value={draft.meta.designerTitle}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              meta: { ...draft.meta, designerTitle: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">이메일 주소</label>
                      <input
                        type="email"
                        value={draft.meta.email}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            meta: { ...draft.meta, email: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">전화번호</label>
                      <input
                        type="text"
                        value={draft.meta.phone}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            meta: { ...draft.meta, phone: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#888880]">구직 / 협업 가능 상태 뱃지 문구</label>
                      <input
                        type="text"
                        value={draft.contact.availableBadgeText}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            contact: { ...draft.contact, availableBadgeText: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BACKUP & RESTORE */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-base font-bold text-white">클라우드 데이터베이스 (Firebase) 자동 동기화</h3>
                  
                  {/* Cloud Firebase Real-time explanation box */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Firebase 클라우드 실시간 자동 동기화 활성화됨</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      관리자 모드에서 프로젝트를 추가하거나 수정하고 <strong>[변경사항 저장]</strong>을 누르면, <strong>Firebase Cloud Firestore</strong>에 즉시 저장되어 스마트폰, 다른 컴퓨터, Netlify 배포 사이트에 접속하는 <strong>모든 방문자에게 실시간으로 영구 반영</strong>됩니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button
                      onClick={handleExportJson}
                      className="p-4 rounded-lg bg-[#222220] border border-[#3A3A36] hover:border-amber-400 text-left space-y-2 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-white font-bold text-xs group-hover:text-amber-400">
                        <Download className="w-4 h-4" />
                        <span>JSON 파일 다운로드</span>
                      </div>
                      <p className="text-[11px] text-[#888880]">
                        현재 작성된 전체 포트폴리오 데이터를 JSON 파일로 다운로드합니다.
                      </p>
                    </button>

                    <button
                      onClick={handleCopyJsonToClipboard}
                      className={`p-4 rounded-lg border text-left space-y-2 transition-all ${
                        copiedJson
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-[#222220] border-[#3A3A36] hover:border-pink-400 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Copy className="w-4 h-4" />
                        <span>{copiedJson ? '복사 완료!' : 'JSON 클립보드 복사'}</span>
                      </div>
                      <p className="text-[11px] text-[#888880]">
                        AI에게 데이터 전달 또는 영구 코드 적용 시 간편하게 복사할 수 있습니다.
                      </p>
                    </button>

                    <label className="p-4 rounded-lg bg-[#222220] border border-[#3A3A36] hover:border-white text-left space-y-2 cursor-pointer transition-colors block">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Upload className="w-4 h-4" />
                        <span>JSON 백업 불러오기</span>
                      </div>
                      <p className="text-[11px] text-[#888880]">
                        이전에 저장해 둔 JSON 백업 파일을 업로드하여 복원합니다.
                      </p>
                      <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                    </label>
                  </div>

                  <div className="pt-6 border-t border-[#333330]">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2.5 rounded bg-red-900/50 hover:bg-red-900/80 text-red-200 text-xs font-semibold border border-red-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>초기 샘플 데이터로 리셋하기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="bg-[#202020] px-6 py-3 border-t border-[#303030] flex items-center justify-between text-xs shrink-0">
              <button
                onClick={handleLogout}
                className="text-[#888880] hover:text-white font-mono cursor-pointer transition-colors"
              >
                관리자 로그아웃
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded font-bold cursor-pointer transition-all shadow ${
                  isSaving
                    ? 'bg-amber-600 text-white cursor-wait'
                    : saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : saveError
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-[#141414] hover:bg-[#EAEAEA]'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>클라우드 동기화 중...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>클라우드 및 사이트에 영구 반영 완료!</span>
                  </>
                ) : saveError ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>저장 실패 (다시 시도)</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>저장하고 사이트에 반영</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

// Sub-component: In-depth Project Editor
interface ProjectEditorProps {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCancel }) => {
  const [form, setForm] = useState<Project>(project);
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim().replace(/^#/, '');
    if (!tag) return;
    const currentTags = form.tags || [];
    if (!currentTags.includes(tag)) {
      setForm({ ...form, tags: [...currentTags, tag] });
    }
    if (!tagToAdd) setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (form.tags || []).filter((t) => t !== tagToRemove);
    setForm({ ...form, tags: updatedTags });
  };

  const handleAddDesignFocus = () => {
    setForm({
      ...form,
      designFocus: [
        ...form.designFocus,
        {
          id: `focus-${Date.now()}`,
          title: '새로운 디자인 포커스',
          description: '이 섹션에서 고객과 정보 전달을 위해 고민한 내용을 작성합니다.',
        },
      ],
    });
  };

  const handleRemoveDesignFocus = (index: number) => {
    const updated = form.designFocus.filter((_, idx) => idx !== index);
    setForm({ ...form, designFocus: updated });
  };

  const handleAddSection = () => {
    setForm({
      ...form,
      sections: [
        ...form.sections,
        {
          id: `sec-${Date.now()}`,
          title: `0${form.sections.length + 1}. NEW SECTION`,
          caption: '섹션 설명 또는 타이포그래피/레이아웃 의도',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
        },
      ],
    });
  };

  const handleRemoveSection = (index: number) => {
    const updated = form.sections.filter((_, idx) => idx !== index);
    setForm({ ...form, sections: updated });
  };

  const handleAddKeyframe = () => {
    const currentKeyframes = form.videoKeyframes || [];
    const count = currentKeyframes.length + 1;
    const newFrame: VideoKeyframe = {
      timestamp: `00:${String((count - 1) * 5).padStart(2, '0')} - 00:${String(count * 5).padStart(2, '0')}`,
      title: `0${count}. SCENE TITLE (씬 제목)`,
      description: '이 타임라인 구간의 주요 모션 그래픽 연출 의도 및 화면 전환 효과를 작성합니다.'
    };
    setForm({ ...form, videoKeyframes: [...currentKeyframes, newFrame] });
  };

  const handleRemoveKeyframe = (index: number) => {
    const currentKeyframes = form.videoKeyframes || [];
    const updated = currentKeyframes.filter((_, idx) => idx !== index);
    setForm({ ...form, videoKeyframes: updated.length > 0 ? updated : undefined });
  };

  const isVideoProject = 
    form.projectType === 'video-motion' || 
    form.category?.includes('영상') || 
    form.category?.includes('모션') || 
    form.category?.includes('VIDEO') || 
    form.category?.includes('MOTION');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#333330]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-400">PROJECT {form.number}</span>
          <h3 className="text-base font-bold text-white">프로젝트 상세 편집</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded bg-[#333330] text-xs text-white hover:bg-[#40403C]"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-1.5 rounded bg-white text-xs font-bold text-[#141414] hover:bg-[#EAEAEA]"
          >
            완료
          </button>
        </div>
      </div>

      {/* Visibility / Publish Setting */}
      <div className="p-4 rounded-xl bg-[#242422] border border-[#3A3A36] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              {form.isPublished !== false ? (
                <Eye className="w-4 h-4 text-emerald-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
              <span>웹사이트 게시 여부 (노출 / 숨김)</span>
            </span>
            {form.isPublished !== false ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>사이트에 정상 노출 중</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center gap-1">
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>숨김 (비공개 상태)</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {form.isPublished !== false
              ? '현재 포트폴리오 메인 화면 및 작품 갤러리에 모든 방문자에게 정상 노출됩니다.'
              : '현재 숨김 상태입니다. 일반 방문자에게는 노출되지 않으며 관리자 모드에서만 확인하고 언제든 다시 노출할 수 있습니다.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1C1C1A] p-1 rounded-lg border border-[#333330] shrink-0">
          <button
            type="button"
            onClick={() => setForm({ ...form, isPublished: true })}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              form.isPublished !== false
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>노출 (공개)</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, isPublished: false })}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              form.isPublished === false
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>숨김 (비공개)</span>
          </button>
        </div>
      </div>

      {/* Featured in Hero toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#222220] border border-[#333330]">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>메인 화면 최상단 대표작으로 설정</span>
            {form.featuredInHero && (
              <span className="text-[10px] bg-pink-900/60 text-pink-300 px-1.5 py-0.2 rounded font-mono font-bold">
                HERO FEATURED
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {form.featuredInHero
              ? '현재 사이트 접속 시 최상단 히어로 보드에 이 작업물이 1순위 대표작으로 노출됩니다.'
              : '체크 시 사이트 최상단 히어로 보드의 대표 프로젝트로 지정됩니다.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setForm({ ...form, featuredInHero: !form.featuredInHero })}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shrink-0 border ${
            form.featuredInHero
              ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
              : 'bg-[#2A2A28] border-[#3A3A36] text-slate-300 hover:text-white hover:bg-[#343430]'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${form.featuredInHero ? 'fill-white' : ''}`} />
          <span>{form.featuredInHero ? '대표작 해제' : '⭐ 대표작으로 지정'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[#888880]">프로젝트 제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[#888880]">프로젝트 유형 / 카테고리</label>
          <div className="flex gap-1.5 mb-1.5 flex-wrap">
            {[
              { label: '상세페이지', val: 'DETAIL PAGE', type: 'detail-page' as const },
              { label: '제품', val: 'PRODUCT', type: 'product' as const },
              { label: 'SNS 콘텐츠', val: 'SNS CONTENT', type: 'sns-content' as const },
              { label: '배너', val: 'BANNER', type: 'main-banner' as const },
              { label: '영상·모션', val: 'VIDEO & MOTION', type: 'video-motion' as const },
            ].map((c) => {
              const isSelected = form.projectType === c.type || 
                (c.type === 'video-motion' ? isVideoProject : (form.category === c.val || (c.val === 'BANNER' && (form.category === 'MAIN BANNER' || form.category === 'BANNER'))));
              return (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.val, projectType: c.type })}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                    isSelected
                      ? 'bg-[#EC4899] text-white border-[#EC4899] font-bold shadow-sm'
                      : 'bg-[#2A2A28] text-slate-300 border-[#3A3A36] hover:text-white hover:bg-[#343430]'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
            placeholder="e.g. DETAIL PAGE, PRODUCT, SNS CONTENT, BANNER, VIDEO & MOTION"
          />
        </div>
      </div>

      {/* Video & Motion Multi-Size Settings (Only visible for Video & Motion projects) */}
      {isVideoProject && (
      <div className="p-4 rounded-xl bg-[#242422] border border-pink-900/40 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#333330]">
          <div>
            <label className="text-xs font-mono text-pink-400 font-bold flex items-center gap-1.5">
              <Film className="w-4 h-4 text-pink-400" />
              <span>영상 포맷 & 사이즈 설정 (1가지, 2가지, 또는 3가지 자유 등록)</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              1개 사이즈만 단독 등록하거나, 2개 또는 3개 사이즈(9:16, 16:9, 1:1)를 필요한 만큼 자유롭게 조합할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Quick Presets & Format Generators */}
        <div className="space-y-2 bg-[#1C1C1A] p-3 rounded-lg border border-[#333330]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            ⚡ 빠른 프리셋 조합 선택
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                const baseVid = form.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4";
                setForm({
                  ...form,
                  videoUrl: baseVid,
                  videoVariations: [
                    {
                      id: "var-shortform-" + Date.now(),
                      type: "9:16",
                      label: "모바일 숏폼 버전 (9:16)",
                      dimension: "1080 x 1920 px (9:16)",
                      videoUrl: baseVid,
                      description: "인스타그램 릴스, 유튜브 쇼츠, 틱톡 모바일 세로 풀스크린 최적화 영상"
                    },
                    {
                      id: "var-pc-" + Date.now(),
                      type: "16:9",
                      label: "PC·웹 와이드 버전 (16:9)",
                      dimension: "1920 x 1080 px (16:9)",
                      videoUrl: baseVid,
                      description: "웹사이트 메인 및 유튜브용 16:9 와이드 가로형 시네마틱 영상"
                    },
                    {
                      id: "var-square-" + Date.now(),
                      type: "1:1",
                      label: "정사각형 타입 (1:1)",
                      dimension: "1080 x 1080 px (1:1)",
                      videoUrl: baseVid,
                      description: "인스타그램 피드 및 모바일 광고 피드용 1:1 정방형 영상"
                    }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-pink-950/60 text-pink-300 hover:bg-pink-900/80 border border-pink-700/60 font-semibold"
            >
              ✨ 3가지 전체 (9:16 + 16:9 + 1:1)
            </button>

            <button
              type="button"
              onClick={() => {
                const baseVid = form.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4";
                setForm({
                  ...form,
                  videoUrl: baseVid,
                  videoVariations: [
                    {
                      id: "var-shortform-" + Date.now(),
                      type: "9:16",
                      label: "모바일 숏폼 버전 (9:16)",
                      dimension: "1080 x 1920 px (9:16)",
                      videoUrl: baseVid,
                      description: "인스타그램 릴스, 유튜브 쇼츠, 틱톡 모바일 세로 풀스크린 최적화 영상"
                    },
                    {
                      id: "var-pc-" + Date.now(),
                      type: "16:9",
                      label: "PC·웹 와이드 버전 (16:9)",
                      dimension: "1920 x 1080 px (16:9)",
                      videoUrl: baseVid,
                      description: "웹사이트 메인 및 유튜브용 16:9 와이드 가로형 시네마틱 영상"
                    }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#2C2C2A] text-slate-200 hover:text-white border border-[#444440]"
            >
              2가지 (9:16 + 16:9)
            </button>

            <button
              type="button"
              onClick={() => {
                const baseVid = form.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4";
                setForm({
                  ...form,
                  videoUrl: baseVid,
                  videoVariations: [
                    {
                      id: "var-shortform-" + Date.now(),
                      type: "9:16",
                      label: "모바일 숏폼 버전 (9:16)",
                      dimension: "1080 x 1920 px (9:16)",
                      videoUrl: baseVid,
                      description: "인스타그램 릴스, 유튜브 쇼츠, 틱톡 모바일 세로 풀스크린 최적화 영상"
                    },
                    {
                      id: "var-square-" + Date.now(),
                      type: "1:1",
                      label: "정사각형 타입 (1:1)",
                      dimension: "1080 x 1080 px (1:1)",
                      videoUrl: baseVid,
                      description: "인스타그램 피드 및 모바일 광고 피드용 1:1 정방형 영상"
                    }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#2C2C2A] text-slate-200 hover:text-white border border-[#444440]"
            >
              2가지 (9:16 + 1:1)
            </button>

            <button
              type="button"
              onClick={() => {
                const baseVid = form.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4";
                setForm({
                  ...form,
                  videoUrl: baseVid,
                  aspectRatio: "9:16",
                  videoVariations: [
                    {
                      id: "var-shortform-" + Date.now(),
                      type: "9:16",
                      label: "모바일 숏폼 버전 (9:16)",
                      dimension: "1080 x 1920 px (9:16)",
                      videoUrl: baseVid,
                      description: "모바일 세로형 풀스크린 단독 영상"
                    }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#2C2C2A] text-slate-300 hover:text-white border border-[#444440]"
            >
              1가지 단독 (9:16 숏폼)
            </button>

            <button
              type="button"
              onClick={() => {
                const baseVid = form.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4";
                setForm({
                  ...form,
                  videoUrl: baseVid,
                  aspectRatio: "16:9",
                  videoVariations: [
                    {
                      id: "var-pc-" + Date.now(),
                      type: "16:9",
                      label: "PC·웹 와이드 버전 (16:9)",
                      dimension: "1920 x 1080 px (16:9)",
                      videoUrl: baseVid,
                      description: "16:9 와이드 가로형 시네마틱 단독 영상"
                    }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#2C2C2A] text-slate-300 hover:text-white border border-[#444440]"
            >
              1가지 단독 (16:9 와이드)
            </button>
          </div>
        </div>

        {/* Dynamic Registered Variations List */}
        {form.videoVariations && form.videoVariations.length > 0 ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-pink-300 font-bold flex items-center gap-1.5">
                <span>등록된 영상 사이즈 ({form.videoVariations.length}개):</span>
              </span>

              {/* Add format button */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const currentVars = form.videoVariations || [];
                    const newVar = {
                      id: "var-" + Date.now(),
                      type: "9:16",
                      label: "모바일 숏폼 (9:16)",
                      dimension: "1080 x 1920 px (9:16)",
                      videoUrl: form.videoUrl || "",
                      description: "모바일 세로형 영상"
                    };
                    setForm({ ...form, videoVariations: [...currentVars, newVar] });
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#333330] text-slate-200 hover:text-pink-300 border border-[#444440] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> + 9:16 추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentVars = form.videoVariations || [];
                    const newVar = {
                      id: "var-" + Date.now(),
                      type: "16:9",
                      label: "PC 와이드 (16:9)",
                      dimension: "1920 x 1080 px (16:9)",
                      videoUrl: form.videoUrl || "",
                      description: "PC 및 웹용 16:9 가로형 영상"
                    };
                    setForm({ ...form, videoVariations: [...currentVars, newVar] });
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#333330] text-slate-200 hover:text-pink-300 border border-[#444440] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> + 16:9 추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentVars = form.videoVariations || [];
                    const newVar = {
                      id: "var-" + Date.now(),
                      type: "1:1",
                      label: "정방형 (1:1)",
                      dimension: "1080 x 1080 px (1:1)",
                      videoUrl: form.videoUrl || "",
                      description: "SNS 피드용 정방형 영상"
                    };
                    setForm({ ...form, videoVariations: [...currentVars, newVar] });
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#333330] text-slate-200 hover:text-pink-300 border border-[#444440] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> + 1:1 추가
                </button>
              </div>
            </div>

            {form.videoVariations.map((v, vIdx) => {
              const IconComp = v.type === '16:9' ? Monitor : v.type === '1:1' ? Square : Smartphone;
              return (
                <div key={v.id || vIdx} className="p-3.5 rounded-xl bg-[#1C1C1A] border border-[#3A3A36] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#2C2C2A] text-pink-400">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        사이즈 #{vIdx + 1}: {v.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVars = form.videoVariations?.filter((_, idx) => idx !== vIdx);
                        setForm({
                          ...form,
                          videoVariations: (newVars && newVars.length > 0) ? newVars : undefined
                        });
                      }}
                      className="px-2 py-1 rounded text-[10px] font-mono text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 border border-rose-900/40 flex items-center gap-1 transition-colors"
                      title="이 사이즈 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>이 사이즈 삭제</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">비율 타입</label>
                      <select
                        value={v.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const newVars = [...(form.videoVariations || [])];
                          const defaultDims: Record<string, string> = {
                            '9:16': '1080 x 1920 px (9:16)',
                            '16:9': '1920 x 1080 px (16:9)',
                            '1:1': '1080 x 1080 px (1:1)',
                          };
                          newVars[vIdx] = {
                            ...newVars[vIdx],
                            type: newType,
                            dimension: defaultDims[newType] || newVars[vIdx].dimension
                          };
                          setForm({ ...form, videoVariations: newVars });
                        }}
                        className="w-full px-2 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
                      >
                        <option value="9:16">9:16 (모바일 세로/숏폼)</option>
                        <option value="16:9">16:9 (PC/웹 가로 와이드)</option>
                        <option value="1:1">1:1 (SNS 피드 정방형)</option>
                        <option value="custom">직접 지정 (Custom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">사이즈 이름 / 라벨</label>
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => {
                          const newVars = [...(form.videoVariations || [])];
                          newVars[vIdx] = { ...newVars[vIdx], label: e.target.value };
                          setForm({ ...form, videoVariations: newVars });
                        }}
                        className="w-full px-2 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
                        placeholder="e.g. 모바일 숏폼 버전 (9:16)"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">해상도 규격 (Dimension)</label>
                      <input
                        type="text"
                        value={v.dimension}
                        onChange={(e) => {
                          const newVars = [...(form.videoVariations || [])];
                          newVars[vIdx] = { ...newVars[vIdx], dimension: e.target.value };
                          setForm({ ...form, videoVariations: newVars });
                        }}
                        className="w-full px-2 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
                        placeholder="e.g. 1080 x 1920 px (9:16)"
                      />
                    </div>
                  </div>

                  {/* Video File Upload */}
                  <MediaFileUpload
                    label={`${v.label} 영상 파일`}
                    value={v.videoUrl || ''}
                    onChange={(val) => {
                      const newVars = [...(form.videoVariations || [])];
                      newVars[vIdx] = { ...newVars[vIdx], videoUrl: val };
                      // Also sync primary videoUrl if this is the first item
                      const updatedForm = { ...form, videoVariations: newVars };
                      if (vIdx === 0) {
                        updatedForm.videoUrl = val;
                      }
                      setForm(updatedForm);
                    }}
                    accept="video"
                    placeholder="영상 파일(MP4, WebM 등)을 선택하세요"
                    previewHeight="h-32"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Video Mode (When no variations array is defined) */
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-lg bg-[#1C1C1A] border border-[#3A3A36] flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>단일 영상 파일 등록 모드</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (2개 또는 3개 사이즈 등록을 원하시면 위의 프리셋 버튼을 클릭하세요)
              </span>
            </div>

            <MediaFileUpload
              label="단독 재생 영상 파일"
              value={form.videoUrl || ''}
              onChange={(val) => setForm({ ...form, videoUrl: val })}
              accept="video"
              placeholder="내 컴퓨터에서 영상 파일(MP4, WebM 등)을 선택하세요"
              helperText="단독 사이즈로 등록되는 메인 재생 영상 파일입니다."
              previewHeight="h-40"
            />
          </div>
        )}

        {/* Video Storyboard & Timeline Editor */}
        <div className="pt-4 border-t border-[#333330] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-mono text-pink-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>타임라인 & 스토리보드 씬 구성 (Timeline & Storyboard)</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                상세 모달에 노출되는 구간별 타임스탬프, 씬 제목, 모션 설명을 편집합니다. <span className="text-pink-400 font-medium">※ 씬을 작성하지 않으면 상세 모달에서 해당 섹션이 자동으로 숨겨집니다.</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {form.videoKeyframes && form.videoKeyframes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, videoKeyframes: [] })}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 flex items-center gap-1"
                  title="모든 씬을 삭제하고 상세 모달에서 스토리보드 섹션을 숨깁니다"
                >
                  <Trash2 className="w-3 h-3" /> 전체 비우기 (숨김)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    videoKeyframes: [
                      {
                        timestamp: "00:00 - 00:03",
                        title: "01. INTRO HOOK (유리알 광택 클로즈업)",
                        description: "화면 가득 차오르는 촉촉한 제형감과 빛 반사 모션으로 1초 만에 시선 고정"
                      },
                      {
                        timestamp: "00:04 - 00:09",
                        title: "02. USP SHADE TRANSITION (색상 스위칭)",
                        description: "시그니처 컬러 쉐이드가 빠르게 교차되는 다이내믹 타이포그래피 모션"
                      },
                      {
                        timestamp: "00:10 - 00:15",
                        title: "03. OUTRO & CTA (올리브영 단독 특가 안내)",
                        description: "‘지금 바로 터치’ 인터랙션 모션과 단독 런칭 특가 자막 애니메이션"
                      }
                    ]
                  });
                }}
                className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#333330] text-pink-300 hover:text-white border border-[#444440]"
              >
                ✨ 3단계 프리셋
              </button>

              <button
                type="button"
                onClick={handleAddKeyframe}
                className="px-2.5 py-1 rounded text-[10px] font-mono bg-pink-900/60 text-pink-200 hover:bg-pink-800/70 border border-pink-700/60 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> + 새 씬 추가
              </button>
            </div>
          </div>

          {form.videoKeyframes && form.videoKeyframes.length > 0 ? (
            <div className="space-y-3">
              {form.videoKeyframes.map((kf, kfIdx) => (
                <div
                  key={kfIdx}
                  className="p-3.5 rounded-xl bg-[#1C1C1A] border border-[#3A3A36] space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded bg-pink-950/80 text-pink-400 font-mono text-[11px] font-bold flex items-center justify-center border border-pink-800/60">
                        {kfIdx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="타임스탬프 (예: 00:00 - 00:03)"
                        value={kf.timestamp}
                        onChange={(e) => {
                          const updated = [...(form.videoKeyframes || [])];
                          updated[kfIdx] = { ...updated[kfIdx], timestamp: e.target.value };
                          setForm({ ...form, videoKeyframes: updated });
                        }}
                        className="w-36 px-2.5 py-1 rounded bg-[#242422] border border-[#3A3A36] text-pink-300 font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="씬 제목 (예: 01. INTRO HOOK (유리알 광택 클로즈업))"
                        value={kf.title}
                        onChange={(e) => {
                          const updated = [...(form.videoKeyframes || [])];
                          updated[kfIdx] = { ...updated[kfIdx], title: e.target.value };
                          setForm({ ...form, videoKeyframes: updated });
                        }}
                        className="flex-1 px-2.5 py-1 rounded bg-[#242422] border border-[#3A3A36] text-white font-bold text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveKeyframe(kfIdx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                      title="이 씬 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder="이 타임라인 구간의 핵심 연출 내용 및 화면 구성 설명 (예: 화면 가득 차오르는 촉촉한 제형감과 빛 반사 모션으로 1초 만에 시선 고정)"
                      value={kf.description}
                      onChange={(e) => {
                        const updated = [...(form.videoKeyframes || [])];
                        updated[kfIdx] = { ...updated[kfIdx], description: e.target.value };
                        setForm({ ...form, videoKeyframes: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-slate-300 text-xs resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#1C1C1A] border border-dashed border-[#3A3A36] text-center space-y-2">
              <p className="text-xs text-slate-400">
                등록된 스토리보드 씬이 없습니다. <span className="text-pink-400 font-semibold">(상세 모달에 스토리보드 섹션이 표시되지 않습니다)</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    videoKeyframes: [
                      {
                        timestamp: "00:00 - 00:03",
                        title: "01. INTRO HOOK (유리알 광택 클로즈업)",
                        description: "화면 가득 차오르는 촉촉한 제형감과 빛 반사 모션으로 1초 만에 시선 고정"
                      },
                      {
                        timestamp: "00:04 - 00:09",
                        title: "02. USP SHADE TRANSITION (색상 스위칭)",
                        description: "시그니처 컬러 쉐이드가 빠르게 교차되는 다이내믹 타이포그래피 모션"
                      },
                      {
                        timestamp: "00:10 - END",
                        title: "03. OUTRO & CTA (올리브영 단독 특가 안내)",
                        description: "‘지금 바로 터치’ 인터랙션 모션과 단독 런칭 특가 자막 애니메이션"
                      }
                    ]
                  });
                }}
                className="px-3 py-1.5 rounded bg-[#2A2A28] hover:bg-[#343430] text-pink-300 text-xs font-mono border border-[#444440] inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>+ 3단계 스토리보드 기본 구성 생성</span>
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#888880]">한 줄 요약 (Summary)</label>
        <textarea
          rows={2}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs resize-none"
        />
      </div>

      {/* Representative Cover Image Direct Upload */}
      <MediaFileUpload
        label="대표 커버 이미지 (Cover Image)"
        value={form.coverImage}
        onChange={(val) => setForm({ ...form, coverImage: val })}
        accept="image"
        placeholder="내 컴퓨터에서 대표 커버 이미지(JPG, PNG, WebP)를 선택하세요"
        helperText="작품 갤러리 썸네일 및 상세 상단 헤더에 노출되는 대표 이미지입니다."
        previewHeight="h-44"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#888880]">역할 (Role)</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#888880]">기간 (Period)</label>
          <input
            type="text"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#888880]">사용 툴 (Tools)</label>
          <input
            type="text"
            value={form.tools}
            onChange={(e) => setForm({ ...form, tools: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#888880]">클라이언트 (Client)</label>
          <input
            type="text"
            value={form.client || ''}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
          />
        </div>
      </div>

      {/* Hashtags Editor (작업물 목록 하단 해시태그 편집) */}
      <div className="p-4 rounded-xl bg-[#242422] border border-[#3A3A36] space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>작업물 해시태그 편집 (Tags)</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              작업물 목록 카드 하단에 표시되는 키워드 태그입니다. 자유롭게 추가, 삭제, 텍스트 입력할 수 있습니다.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 self-start sm:self-auto">
            현재 {(form.tags || []).length}개 태그 등록됨
          </span>
        </div>

        {/* Current Active Tags */}
        <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-2.5 rounded-lg bg-[#1C1C1A] border border-[#333330]">
          {(form.tags || []).length > 0 ? (
            form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#2C2C28] text-amber-300 border border-amber-500/30 group shadow-2xs"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
                  title="이 태그 삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 font-mono italic">
              등록된 태그가 없습니다. 아래 입력창에서 태그를 추가해보세요.
            </span>
          )}
        </div>

        {/* Tag Input Field & Quick Add */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">#</span>
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="추가할 태그 입력 (예: 브랜드상세페이지, 올리브영, 기획포함) 후 Enter 또는 [추가]"
              className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#1C1C1A] border border-[#3A3A36] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-4 py-2 rounded-lg bg-[#333330] hover:bg-[#3E3E3A] text-amber-300 text-xs font-mono font-bold border border-[#444440] flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>태그 추가</span>
          </button>
        </div>

        {/* Quick Recommendation Tags */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-400 block font-semibold">
            ⚡ 추천 태그 (클릭 시 바로 추가):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              '상세페이지기획',
              'USP시각화',
              '포토샵합성',
              '올리브영입점',
              '와디즈펀딩',
              'SNS광고소재',
              '모션그래픽',
              '숏폼영상',
              '메인배너',
              '브랜드디자인',
              '매출상승',
              '클로즈업보정',
            ].map((suggested) => {
              const isAlreadyAdded = (form.tags || []).includes(suggested);
              return (
                <button
                  key={suggested}
                  type="button"
                  disabled={isAlreadyAdded}
                  onClick={() => handleAddTag(suggested)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all border ${
                    isAlreadyAdded
                      ? 'bg-[#1C1C1A] text-slate-600 border-transparent cursor-not-allowed opacity-50'
                      : 'bg-[#2A2A28] text-slate-300 hover:text-amber-300 hover:bg-[#343430] border-[#3A3A36]'
                  }`}
                >
                  +{suggested}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 01. BACKGROUND */}
      <div className="space-y-1.5 pt-3 border-t border-[#333330]">
        <label className="text-xs font-mono text-[#888880]">01. BACKGROUND (프로젝트 배경 및 기획 의도)</label>
        <textarea
          rows={3}
          value={form.background}
          onChange={(e) => setForm({ ...form, background: e.target.value })}
          className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs resize-none"
        />
      </div>

      {/* 02. DESIGN FOCUS (비디오 프로젝트가 아닐 때만 노출) */}
      {!isVideoProject && (
      <div className="space-y-3 pt-3 border-t border-[#333330]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-[#888880]">02. DESIGN FOCUS (고민한 디자인 포인트 2~3개)</label>
          <button
            onClick={handleAddDesignFocus}
            className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 포커스 추가
          </button>
        </div>
        <div className="space-y-2">
          {form.designFocus.map((df, idx) => (
            <div key={df.id || idx} className="p-3 rounded bg-[#222220] border border-[#333330] space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="포커스 제목 (예: 핵심 특장점의 단계적 인지 구조)"
                  value={df.title}
                  onChange={(e) => {
                    const updated = [...form.designFocus];
                    updated[idx].title = e.target.value;
                    setForm({ ...form, designFocus: updated });
                  }}
                  className="w-5/6 px-2.5 py-1 rounded bg-[#2C2C28] text-xs font-bold text-white"
                />
                <button
                  onClick={() => handleRemoveDesignFocus(idx)}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="상세 설명"
                value={df.description}
                onChange={(e) => {
                  const updated = [...form.designFocus];
                  updated[idx].description = e.target.value;
                  setForm({ ...form, designFocus: updated });
                }}
                className="w-full px-2.5 py-1 rounded bg-[#2C2C28] text-xs text-[#B0B0A8] resize-none"
              />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 03. DESIGN SECTIONS (상세페이지 분할 컷팅 및 다중 이미지/GIF 지원 - 비디오 프로젝트가 아닐 때만 노출) */}
      {!isVideoProject && (
      <div className="space-y-4 pt-4 border-t border-[#333330]">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-mono text-amber-400 font-bold block">
              03. DESIGN SECTIONS (상세 이미지 / 분할 컷팅 섹션)
            </label>
            <span className="text-[11px] text-[#888880] font-mono">
              한 섹션에 상세페이지 여러 분할 컷(01.jpg, 02.gif...)을 연속으로 등록할 수 있습니다.
            </span>
          </div>
          <button
            onClick={handleAddSection}
            className="px-3 py-1.5 rounded-lg bg-[#30302C] hover:bg-[#3C3C38] text-[11px] font-mono text-amber-400 border border-[#444440] flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> 새 섹션 추가
          </button>
        </div>

        <div className="space-y-5">
          {form.sections.map((sec, sIdx) => {
            const hasMultipleImages = Boolean(sec.images && sec.images.length > 1);
            const currentImagesList = sec.images && sec.images.length > 0 ? sec.images : sec.imageUrl ? [sec.imageUrl] : [];

            return (
              <div key={sec.id || sIdx} className="p-4 rounded-xl bg-[#222220] border border-[#3A3A36] space-y-3.5 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-[#2F2F2B] text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-[#42423E]">
                      {sIdx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="섹션 제목 (예: 01. INTRO & HOOK / 상세페이지 전체 컷)"
                      value={sec.title}
                      onChange={(e) => {
                        const updated = [...form.sections];
                        updated[sIdx].title = e.target.value;
                        setForm({ ...form, sections: updated });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#2C2C28] text-xs font-bold text-white border border-[#3E3E3A]"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveSection(sIdx)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors border border-transparent hover:border-red-900/50 shrink-0"
                    title="이 섹션 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sliced Multi-Cut Images / GIF Uploader Component */}
                <MultiImageSliceUpload
                  label={`섹션 ${sIdx + 1} 상세 이미지 / 분할 컷팅 (다중 파일 및 GIF 지원)`}
                  images={currentImagesList}
                  layoutMode={sec.layoutMode || 'seamless'}
                  onLayoutModeChange={(mode) => {
                    const updated = [...form.sections];
                    updated[sIdx].layoutMode = mode;
                    setForm({ ...form, sections: updated });
                  }}
                  onChange={(newImages) => {
                    const updated = [...form.sections];
                    updated[sIdx].images = newImages;
                    updated[sIdx].imageUrl = newImages[0] || '';
                    setForm({ ...form, sections: updated });
                  }}
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">섹션 부가 설명 / 캡션 (선택)</label>
                  <input
                    type="text"
                    placeholder="섹션 기획 의도 또는 상세 설명 (선택사항)"
                    value={sec.caption || ''}
                    onChange={(e) => {
                      const updated = [...form.sections];
                      updated[sIdx].caption = e.target.value;
                      setForm({ ...form, sections: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#2C2C28] text-xs text-[#E0E0D8] border border-[#3A3A36]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* 04. OUTCOME */}
      <div className="space-y-2 pt-3 border-t border-[#333330]">
        <label className="text-xs font-mono text-[#888880]">04. OUTCOME (결과 및 적용 현황)</label>
        <input
          type="text"
          placeholder="성과 요약 (예: 공식 온라인 스토어 메인 상세페이지 적용)"
          value={form.outcome.result}
          onChange={(e) =>
            setForm({
              ...form,
              outcome: { ...form.outcome, result: e.target.value },
            })
          }
          className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs"
        />
        <textarea
          rows={2}
          placeholder="세부 내용 또는 고객 피드백"
          value={form.outcome.details || ''}
          onChange={(e) =>
            setForm({
              ...form,
              outcome: { ...form.outcome, details: e.target.value },
            })
          }
          className="w-full px-3 py-2 rounded bg-[#242422] border border-[#3A3A36] text-white text-xs resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-[#333330] hover:bg-[#40403C] text-xs text-white transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>프로젝트 저장 & 즉시 반영</span>
        </button>
      </div>
    </div>
  );
};
