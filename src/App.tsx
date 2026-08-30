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
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);

  // Helper to preload the hero showcase image before lifting the loading curtain
  const preloadHeroImage = (imgUrl?: string): Promise<void> => {
    if (!imgUrl) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      let finished = false;
      const done = () => {
        if (!finished) {
          finished = true;
          resolve();
        }
      };
      img.onload = done;
      img.onerror = done;
      img.src = imgUrl;
      if (img.complete) {
        done();
      }
      // Safety cap for image preload
      setTimeout(done, 1200);
    });
  };

  // 1. Hydrate from Cloud Firestore & IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    let hasAppliedRemote = false;

    // Safety timeout: Ensure preloader never hangs permanently even on completely offline connections
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !hasAppliedRemote) {
        setIsHydrated(true);
        setIsLoading(false);
      }
    }, 4500);

    const applyContent = async (newContent: SiteContent) => {
      if (!isMounted) return;
      hasAppliedRemote = true;

      // Find the hero featured project image and preload it into memory
      const published = (newContent.projects || []).filter((p) => p.isPublished !== false);
      const featured = published.find((p) => p.featuredInHero) || published[0] || (newContent.projects && newContent.projects[0]);
      if (featured?.coverImage) {
        try {
          await preloadHeroImage(featured.coverImage);
        } catch (e) {}
      }

      if (!isMounted) return;
      setContent(newContent);
      setIsHydrated(true);

      // Smooth transition buffer: ensure DOM has painted the updated image
      setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 150);
    };

    loadSiteContentAsync().then((loadedContent) => {
      if (isMounted && loadedContent && Array.isArray(loadedContent.projects) && loadedContent.projects.length > 0) {
        applyContent(loadedContent);
      }
    }).catch(() => {
      // If error occurs, subscribeToRemoteContent or safetyTimeout will handle it
    });

    // 2. Real-time listener: When admin edits content or first snapshot arrives, visitors see updates instantly
    const unsubscribe = subscribeToRemoteContent((remoteContent) => {
      if (remoteContent && isMounted && Array.isArray(remoteContent.projects) && remoteContent.projects.length > 0) {
        const merged = mergeWithInitial(remoteContent);
        applyContent(merged);
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

      {/* Main Page Container - Zero-flash visibility guarantee */}
      <div className={`transition-opacity duration-300 ${isHydrated ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
      </div>

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
