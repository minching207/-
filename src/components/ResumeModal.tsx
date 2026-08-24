import React, { useEffect, useState, useRef } from 'react';
import { X, Printer, Download, Mail, Phone, MapPin, Award, Briefcase, GraduationCap, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteContent } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, content }) => {
  const { meta, about } = content;
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. Direct High-Resolution PDF Download using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    const element = printableRef.current;
    if (!element || isExportingPdf) return;

    try {
      setIsExportingPdf(true);
      setDownloadSuccess(false);

      // Create a cloned off-screen container with fixed desktop width to guarantee crisp A4 proportion
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution (retina crisp)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pdfHeight;

      // Additional Pages if content extends beyond 1 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save('김민경_이력서.pdf');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: Trigger isolated print dialog
      handleIsolatedPrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Reliable Isolated IFrame Print Handler
  const handleIsolatedPrint = () => {
    const element = printableRef.current;
    if (!element || isPrinting) return;

    setIsPrinting(true);

    try {
      // Create hidden iframe for isolated print
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((style) => style.outerHTML)
        .join('\n');

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8" />
            <title>김민경_이력서</title>
            <script src="https://cdn.tailwindcss.com"></script>
            ${styles}
            <style>
              @page { margin: 12mm 15mm; size: A4 portrait; }
              body { 
                background: #ffffff !important; 
                color: #0F172A !important; 
                padding: 0 !important;
                margin: 0 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif !important; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-hide { display: none !important; }
            </style>
          </head>
          <body>
            <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          if (printIframe.contentWindow) {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          }
        } catch (e) {
          console.warn('Iframe print failed, falling back to window.print():', e);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            setIsPrinting(false);
          }, 1000);
        }
      }, 500);
    } catch (err) {
      console.warn('Print preparation error:', err);
      window.print();
      setIsPrinting(false);
    }
  };

  return (
    <div
      id="resume-modal-root"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#11100E]/80 backdrop-blur-md flex justify-center items-start p-0 sm:p-6 lg:p-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl my-0 sm:my-4 bg-white text-[#1C1A17] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#E7DFD3] print:shadow-none print:m-0 print:w-full print:max-w-none print:border-none"
      >
        {/* Modal Action Bar (Hidden on print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#EC4899] px-2.5 py-1 rounded bg-[#FDF2F8] border border-[#FBCFE8]">
              OFFICIAL RESUME
            </span>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              김민경 디자이너 공식 이력서 (경력 총 6년 9개월)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Primary: Direct PDF File Download */}
            <button
              id="resume-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf || isPrinting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-60"
              title="이력서를 PDF 파일로 내 컴퓨터에 바로 저장합니다"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'PDF 생성 중...' : downloadSuccess ? '저장 완료!' : 'PDF 저장 / 다운로드'}</span>
            </button>

            {/* Secondary: Browser Print Dialog */}
            <button
              id="resume-print-btn"
              type="button"
              onClick={handleIsolatedPrint}
              disabled={isPrinting || isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer disabled:opacity-60"
              title="웹 브라우저 인쇄 창을 실행합니다"
            >
              {isPrinting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>{isPrinting ? '인쇄 준비 중...' : '인쇄'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-[#FDF2F8] text-slate-600 hover:text-[#EC4899] border border-slate-200 transition-colors ml-1"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Document Area */}
        <div
          ref={printableRef}
          id="printable-resume-area"
          className="p-8 sm:p-12 lg:p-14 space-y-10 bg-white"
        >
          {/* Resume Header & Profile Summary */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-[#0F172A]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-[#EC4899] uppercase font-bold bg-[#FDF2F8] px-2.5 py-0.5 rounded border border-[#FBCFE8]">
                  경력 총 6년 9개월 · 재직중
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                {meta.designerName}
                <span className="text-base font-normal text-slate-500 ml-2 font-mono">(여, 1999년생 / 27세)</span>
              </h1>
              <p className="text-sm font-semibold text-slate-700">
                기획부터 쇼핑몰 구축·운영, 퍼포먼스 광고 비주얼까지 성과를 만드는 커머스 웹디자이너
              </p>
            </div>

            <div className="text-xs font-mono text-slate-600 space-y-1.5 sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
              <div className="flex sm:justify-end items-center gap-1.5 font-bold text-[#0F172A]">
                <Mail className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>{meta.email}</span>
              </div>
              <div className="flex sm:justify-end items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{meta.phone}</span>
              </div>
              <div className="flex sm:justify-end items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{meta.location}</span>
              </div>
            </div>
          </div>

          {/* Intro & Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F172A] uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-[#EC4899]" />
              <span>ABOUT & SUMMARY</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">
              {about.intro}
            </p>
          </div>

          {/* Skills Badges */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F172A] uppercase">
              SKILLS & CAPABILITIES
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                "Adobe Photoshop",
                "Adobe Illustrator",
                "상세페이지제작",
                "쇼핑몰운영",
                "스마트스토어/오픈마켓",
                "카페24 쇼핑몰구축",
                "HTML/CSS 레이아웃",
                "상품관리 & 가격비교",
                "SNS활용 & 카드뉴스",
                "병원 이벤트 페이지",
                "프로모션 랜딩페이지",
                "홈페이지유지보수",
                "광고 성과 데이터 분석"
              ].map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Work Experience (PDF 실제 데이터 100% 반영) */}
          <div className="space-y-6">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F172A] uppercase pb-2 border-b border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#EC4899]" />
                <span>WORK EXPERIENCE (경력 총 6년 9개월)</span>
              </span>
            </h2>

            <div className="space-y-6 divide-y divide-slate-100">
              {/* 1. 더블어스 */}
              <div className="pt-2 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F172A]">더블어스</span>
                    <span className="px-2 py-0.5 rounded bg-pink-50 text-[#DB2777] font-bold text-[10px]">재직중</span>
                  </div>
                  <span className="text-slate-500 font-bold">2025.02 — 현재 재직중</span>
                </div>
                <div className="text-xs text-[#EC4899] font-bold">마케팅팀 · 선임 / 웹디자인</div>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  <li>성형외과·피부과 병원 전문 인하우스 마케팅 대행 및 웹디자인 총괄</li>
                  <li>병원 이벤트 페이지 기획 및 디자인 제작</li>
                  <li>프로모션·캠페인 랜딩페이지 디자인 및 운영</li>
                  <li>온라인 광고 소재 (배너, 카드뉴스, SNS 콘텐츠, 광고 영상) 기획 및 제작</li>
                  <li>광고 성과 데이터를 기반으로 유입과 전환율을 높이는 메시지 및 이벤트 기획, 지속적 개선 작업 수행</li>
                </ul>
              </div>

              {/* 2. 한국딥러닝 */}
              <div className="pt-4 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sm text-[#0F172A]">한국딥러닝</span>
                  <span className="text-slate-500">2024.11 — 2024.12 (2개월)</span>
                </div>
                <div className="text-xs text-slate-600 font-semibold">데이터라벨링 (단기계약직)</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI 학습 데이터 구축을 위한 데이터 라벨러로 근무하며 업무의 정확성과 세밀함을 함양
                </p>
              </div>

              {/* 3. 한국이텔레콤 */}
              <div className="pt-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sm text-[#0F172A]">한국이텔레콤</span>
                  <span className="text-slate-500">2024.07 — 2024.10 (4개월)</span>
                </div>
                <div className="text-xs text-slate-600 font-semibold">사원 · 웹디자인</div>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  <li>MVNO 공식 홈페이지 리뉴얼 디자인</li>
                  <li>통신 서비스 및 제품 상세페이지 제작</li>
                  <li>제품 촬영 (핸드폰 촬영 및 보정/합성)</li>
                  <li>포스터, 브로슈어 등 사내·외 홍보 인쇄물 제작</li>
                  <li>사내 교육자료 및 제안서 디자인 제작</li>
                </ul>
              </div>

              {/* 4. 미니게이트 */}
              <div className="pt-4 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sm text-[#0F172A]">미니게이트</span>
                  <span className="text-slate-500">2022.11 — 2022.12 / 2023.07 — 2023.09 (총 5개월)</span>
                </div>
                <div className="text-xs text-slate-600 font-semibold">경영관리본부 · 사원 (단기 계약직)</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  경영관리본부 사무보조, 전년도 전표철 정리, 인사 사무보조 및 사무실 이사 지원 업무 수행
                </p>
              </div>

              {/* 5. 하나다이아몬드 */}
              <div className="pt-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F172A]">하나다이아몬드</span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold text-[10px]">과장 승진 (4년 3개월)</span>
                  </div>
                  <span className="text-slate-500 font-bold">2018.08 — 2022.10 (4년 3개월)</span>
                </div>
                <div className="text-xs text-[#DB2777] font-bold">온라인팀 · 과장 (메인 웹디자이너, AMD 및 온라인팀 총괄)</div>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  <li><strong>카페24 쇼핑몰 오픈/구축:</strong> 브랜드 이미지에 맞춰 HTML, CSS를 활용한 레이아웃 커스텀 및 쇼핑몰 배너, 상세페이지 기획/제작 총괄</li>
                  <li><strong>스토어 운영 & 매출 성과:</strong> 네이버 스마트스토어, 오픈마켓, 소셜커머스 상품 등록 및 판매 운영 → <span className="font-bold text-[#0F172A]">네이버 쇼핑 카테고리 내 인기 브랜드·인기 쇼핑몰 1위 달성 및 월매출 1억 원 달성</span></li>
                  <li><strong>콘텐츠 & 마케팅:</strong> 유튜브 콘텐츠 기획 회의 참여 및 유튜브/SNS 채널 관리</li>
                  <li><strong>촬영 및 가격 관리:</strong> 촬영 장소 섭외, 모델 캐스팅, 네이버쇼핑 가격 비교 및 가격 조정</li>
                  <li><strong>인사/총무 서류 총괄:</strong> 급여명세서 작성, 연차관리, 국가지원사업 서류 접수 (내일채움공제, 디지털일자리사업, 출산휴가장려금 등), 비품 및 사내시설 관리</li>
                </ul>
              </div>

              {/* 6. 에스엔패션그룹 (소녀나라) */}
              <div className="pt-4 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sm text-[#0F172A]">에스엔패션그룹 (소녀나라)</span>
                  <span className="text-slate-500">2022.06 — 2022.07</span>
                </div>
                <div className="text-xs text-slate-600 font-semibold">웹디자인 아르바이트</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  소녀나라 여성의류 쇼핑몰 사진 보정 및 1차 기본 상세페이지 제작
                </p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F172A] uppercase flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#EC4899]" />
              <span>EDUCATION</span>
            </h2>
            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between font-mono font-bold text-[#0F172A]">
                <span>소명여자고등학교 (이과계열)</span>
                <span className="text-slate-500">2014.03 — 2017.02 (졸업)</span>
              </div>
              <p className="text-slate-600">
                고등학교 졸업
              </p>
            </div>
          </div>

          {/* Self Introduction / Philosophy Highlights from Resume */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F172A] uppercase">
              SELF INTRODUCTION & WORK ETHIC
            </h2>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#0F172A]">“단순히 예쁜 디자인을 넘어, 행동을 이끌고 매출 성과를 만드는 디자이너”</div>
                <p className="text-slate-600">
                  첫 직장에서 카페24 쇼핑몰 오픈부터 스마트스토어 카테고리 1위, 월 1억 매출을 달성하며 디자인이 매출과 직결되는 핵심 요소임을 배웠습니다. 이후 마케팅 대행사에서 광고 기획 단계부터 참여해 성과 데이터를 분석하고 전환율(CVR)을 높이는 디자인 프로세스를 체득했습니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#0F172A]">“‘내 회사’라는 마음가짐과 강한 책임감”</div>
                <p className="text-slate-600">
                  회사의 발전에 도움이 되는 일이라면 업무 경계를 두지 않고 새로운 분야에 적극 도전하며, 맡은 일은 끝까지 완수하고 신뢰받는 구성원으로 성장하겠습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
