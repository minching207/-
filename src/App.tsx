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
  mergeWithInitial 
} from './utils/storage';
import { subscribeToRemoteContent } from './lib/firebase';

export default function App() {
  const [content, setContent] = useState<SiteContent>(loadSiteContent);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);

  // 1. Hydrate from Cloud Firestore & IndexedDB on initial mount
  useEffect(() => {
    loadSiteContentAsync().then((loadedContent) => {
      if (loadedContent) {
        setContent(loadedContent);
      }
    });

    // 2. Real-time listener: When admin edits content, visitors see updates instantly
    const unsubscribe = subscribeToRemoteContent((remoteContent) => {
      if (remoteContent) {
        setContent((current) => {
          const currentUpdated = typeof current?.updatedAt === 'number' 
            ? current.updatedAt 
            : (current?.updatedAt ? new Date(current.updatedAt).getTime() : 0);
          const remoteUpdated = typeof remoteContent?.updatedAt === 'number'
            ? remoteContent.updatedAt
            : (remoteContent?.updatedAt ? new Date(remoteContent.updatedAt).getTime() : 0);

          if (currentUpdated && remoteUpdated && currentUpdated > remoteUpdated) {
            return current; // Keep newer local state
          }
          return mergeWithInitial(remoteContent);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync title when metadata changes
  useEffect(() => {
    document.title = `${content.meta.designerName} | ${content.meta.designerTitle}`;
  }, [content]);

  const handleSaveContent = async (newContent: SiteContent): Promise<{ success: boolean; error?: string }> => {
    setContent(newContent);
    const result = await saveSiteContent(newContent);
    // If the currently viewed project is updated, sync it
    if (selectedProject) {
      const updated = newContent.projects.find((p) => p.id === selectedProject.id);
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
