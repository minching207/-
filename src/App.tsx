/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SelectedWorks } from './components/SelectedWorks';
import { DesignApproach } from './components/DesignApproach';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ResumeModal } from './components/ResumeModal';
import { AdminModal } from './components/AdminModal';
import { SiteContent, Project } from './types';
import { 
  loadSiteContent, 
  loadSiteContentAsync, 
  saveSiteContent, 
  resetToDefaultContent, 
  checkAdminSession,
  mergeWithInitial,
  hasSavedLocalContent 
} from './utils/storage';
import { subscribeToRemoteContent } from './lib/firebase';
import { InitialPreloader } from './components/InitialPreloader';

export default function App() {
  const [content, setContent] = useState<SiteContent>(loadSiteContent);
  const [isLoading, setIsLoading] = useState<boolean>(() => !hasSavedLocalContent());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);

  // 1. Hydrate from Cloud Firestore & IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    let hasAppliedRemote = false;

    // Safety timeout: Ensure preloader never hangs indefinitely on slow network / offline (4s)
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 4000);

    const applyContent = (newContent: SiteContent) => {
      if (!isMounted) return;
      hasAppliedRemote = true;
      setContent(newContent);
      // Wait a frame for React to mount the new projects before fading out the preloader
      setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 120);
    };

    loadSiteContentAsync().then((loadedContent) => {
      if (isMounted && loadedContent) {
        applyContent(loadedContent);
      }
    }).catch(() => {
      // If error occurs, subscribeToRemoteContent or safetyTimeout will handle it
    });

    // 2. Real-time listener: When admin edits content, visitors see updates instantly
    const unsubscribe = subscribeToRemoteContent((remoteContent) => {
      if (remoteContent && isMounted) {
        setContent((current) => {
          const currentUpdated = typeof current?.updatedAt === 'number' 
            ? current.updatedAt 
            : (current?.updatedAt ? new Date(current.updatedAt).getTime() : 0);
          const remoteUpdated = typeof remoteContent?.updatedAt === 'number'
            ? remoteContent.updatedAt
            : (remoteContent?.updatedAt ? new Date(remoteContent.updatedAt).getTime() : 0);

          // If local has newer unsynced edits, protect local state from being overwritten
          if (currentUpdated && (!remoteUpdated || currentUpdated >= remoteUpdated)) {
            console.log('[App] Preserving active local edits over remote data');
            return current;
          }
          return mergeWithInitial(remoteContent);
        });

        // Ensure preloader is dismissed only after real remote content is rendered
        if (!hasAppliedRemote) {
          hasAppliedRemote = true;
          setTimeout(() => {
            if (isMounted) setIsLoading(false);
          }, 120);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // Sync title when metadata changes
  useEffect(() => {
    document.title = `${content.meta.designerName} | ${content.meta.designerTitle}`;
  }, [content]);

  const handleSaveContent = async (newContent: SiteContent): Promise<{ success: boolean; cloudSynced?: boolean; error?: string }> => {
    const timestamped: SiteContent = {
      ...newContent,
      updatedAt: Date.now(),
    };
    // Update active React state immediately so the screen reflects changes in real time
    setContent(timestamped);
    
    // Save to LocalStorage + IndexedDB + Firestore
    const result = await saveSiteContent(timestamped);
    
    // If the currently viewed project in the modal is updated, sync it immediately
    if (selectedProject) {
      const updated = timestamped.projects.find((p) => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
    return result;
  };

  const handleResetContent = () => {
    const defaultData = resetToDefaultContent();
    setContent(defaultData);
    if (selectedProject) {
      setSelectedProject(defaultData.projects[0] || null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] selection:bg-[#EC4899] selection:text-white font-sans antialiased">
      {/* Seamless Initial Hydration Preloader for First-time/New Browser Visitors */}
      <InitialPreloader isLoading={isLoading} />

      {/* Top Fixed Minimalist Navigation */}
      <Header content={content} />

      {/* Main Content Flow */}
      <main id="portfolio-main">
        {/* Hero Section with exact slogan & editorial mockup visual */}
        <Hero
          content={content}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* 01 / Selected Works (curated detail page & content projects) */}
        <SelectedWorks
          projects={content.projects}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* 02 / Design Approach (Understand, Organize, Visualize, Refine + Key quote) */}
        <DesignApproach content={content} />

        {/* 03 / About Me (Introduction, 3 Strengths, Skills, Experience Timeline) */}
        <AboutSection
          content={content}
          onOpenResume={() => setIsResumeOpen(true)}
        />

        {/* 04 / Contact (Let's Work Together, Email Copy, Direct Inquiry Form) */}
        <ContactSection
          content={content}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </main>

      {/* Minimal Editorial Footer */}
      <Footer
        content={content}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isAdmin}
      />

      {/* In-depth Project Design Story Modal */}
      <ProjectDetailModal
        project={selectedProject}
        allProjects={content.projects}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />

      {/* Official Resume View / Print Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        content={content}
      />

      {/* Admin Suite Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        content={content}
        onSaveContent={handleSaveContent}
        onResetContent={handleResetContent}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}
