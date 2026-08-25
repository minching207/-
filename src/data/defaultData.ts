import { SiteContent } from '../types';

export const initialSiteContent: SiteContent = {
  meta: {
    designerName: "김민경",
    designerTitle: "E-Commerce Web & Visual Content Designer",
    email: "minkyeang0227@naver.com",
    phone: "010-2094-2009",
    location: "경기 부천시 원미구 상동",
    isAvailableForWork: true,
  },
  hero: {
    mainCopyLine1: "상품의 가치를 극대화하는",
    mainCopyLine2: "감각적인 커머스 & 비주얼 디자인.",
    subCopyLine1: "상세페이지부터 SNS 카드뉴스, 배너, 영상·모션 콘텐츠까지",
    subCopyLine2: "고객의 시선을 사로잡고 구매로 이어지는 최적의 비주얼 솔루션을 설계합니다.",
    tags: ["상세페이지 (DETAIL PAGE)", "SNS 콘텐츠 (SNS CONTENT)", "배너 (BANNER)", "영상·모션 (VIDEO & MOTION)"],
    ctaText: "VIEW ALL WORKS",
    featuredVisualTitle: "RELIEF CICA CALMING SERUM",
    featuredVisualSubtitle: "Editorial Commerce & Visual Portfolio · 2026",
  },
  projects: [
    {
      id: "project-cica-serum",
      number: "01",
      title: "비건 릴리프 시카 세럼 상세페이지 디자인",
      category: "DETAIL PAGE",
      projectType: "detail-page",
      summary: "제품의 핵심 성분과 즉각적인 진정 효과를 시각화하여, 감성적 무드와 정보 전달력을 균형 있게 구현한 뷰티 상세페이지.",
      coverImage: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=85",
      tags: ["Vegan Skincare", "Detail Page", "Texture Shot", "Infographic"],
      role: "Detail Page Design / Content Planning / Retouching",
      period: "2026.02 — 2026.03",
      tools: "Photoshop / Illustrator",
      client: "Aube Botanical Lab",
      featuredInHero: true,
      background: "민감성 피부를 위한 100% 비건 병풀 진정 세럼의 신규 런칭 프로젝트입니다. 자극 없는 순수함이라는 브랜드 이미지와 '즉각 진정 89%'라는 임상 테스트 결과를 고객에게 설득력 있게 전달하는 상세페이지를 기획 및 제작했습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "핵심 특장점의 단계적 인지 구조 설계",
          description: "소비자가 가장 먼저 반응하는 '붉은기 즉각 진정'이라는 1순위 베네핏을 상단 훅(Hook)으로 전면 배치하고 원료 스토리와 임상 데이터를 순차적으로 전개했습니다."
        },
        {
          id: "focus-2",
          title: "감성적 무드와 신뢰성 있는 인포그래픽의 조화",
          description: "식물 유래 비건 톤의 차분한 세이지 그린 팔레트를 기본으로, 맑은 제형감의 텍스처 컷과 3단 수분 침투 그래픽을 배치해 감성과 과학적 신뢰를 동시에 전달했습니다."
        },
        {
          id: "focus-3",
          title: "모바일 스크롤 호흡을 고려한 여백과 타이포 위계",
          description: "스마트폰 환경에서 텍스트가 빽빽하게 느껴지지 않도록 핵심 키카피는 시원하게 키우고 보조 설명은 짧은 호흡으로 끊어 빠른 스크롤 중에도 핵심이 걸리도록 디자인했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. HERO & HOOK SECTION",
          caption: "스크롤 시작 3초 내에 제품의 카테고리와 최대 강점을 직관적으로 각인시키는 헤더 구성",
          imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. TEXTURE & INGREDIENT DETAIL",
          caption: "끈적임 없이 수분만 채우는 산뜻한 제형의 시각화 및 제주 유기농 병풀잎 추출물 스토리텔링",
          imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        },
        {
          id: "sec-3",
          title: "03. CLINICAL DATA & POINT INFOGRAPHIC",
          caption: "임상 테스트 수치와 피부 자극도 0.00% 판정 마크를 깔끔한 카드형 그리드로 구조화",
          imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        },
        {
          id: "sec-4",
          title: "04. MOBILE PREVIEW & PACKAGE OVERVIEW",
          caption: "실제 모바일 뷰포트에서의 시선 흐름과 친환경 산림인증(FSC) 단상자 패키지 컷",
          imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85",
          type: "full"
        }
      ],
      outcome: {
        result: "브랜드 공식 온라인 스토어 및 스마트스토어 메인 상세페이지로 적용",
        details: "런칭 첫 주 목표 대비 210% 판매고 달성 및 리뷰 내 '상세페이지 설명 그대로 순하고 촉촉하다'는 피드백 다수 확인."
      }
    },
    {
      id: "project-sns-cleanbeauty-routine",
      number: "02",
      title: "봄맞이 클린 뷰티 스킨케어 SNS 카드뉴스 & 피드 콘텐츠",
      category: "SNS CONTENT",
      projectType: "sns-content",
      summary: "인스타그램 피드 알고리즘과 넘겨보기(Swipe) 유저 행동에 최적화하여 피부 고민별 루틴을 5단계로 풀어낸 바이럴 카드뉴스 시리즈.",
      coverImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=85",
      tags: ["Instagram Feed", "Card News", "Swipe Carousel", "Beauty Trend"],
      role: "Content Planning / Copywriting / Visual Design",
      period: "2026.03",
      tools: "Photoshop / Illustrator",
      client: "Aube Botanical Lab & Self-Publishing",
      snsSlides: [
        {
          id: "slide-1",
          slideNumber: 1,
          title: "COVER: 봄철 환절기 피부 속건조 탈출 5분 루틴",
          caption: "시선을 사로잡는 강력한 호기심 유발 헤드라인과 산뜻한 제품 메인 연출컷",
          imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85"
        },
        {
          id: "slide-2",
          slideNumber: 2,
          title: "STEP 1: 미온수 세안 & 수분 장벽 진정 토너팩",
          caption: "화장솜에 듬뿍 적셔 3분간 올려두는 쿨링 진정 꿀팁 인포그래픽",
          imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85"
        },
        {
          id: "slide-3",
          slideNumber: 3,
          title: "STEP 2: 고농축 세럼 2중 레이어링 테크닉",
          caption: "볼과 이마를 중심으로 가볍게 롤링 후 흡수시키는 텍스처 강조 컷",
          imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85"
        },
        {
          id: "slide-4",
          slideNumber: 4,
          title: "STEP 3: 수분 잠금 크림 & 비타민 구미 섭취",
          caption: "스킨케어와 이너뷰티의 시너지 효과를 알기 쉬운 체크리스트로 정리",
          imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85"
        },
        {
          id: "slide-5",
          slideNumber: 5,
          title: "OUTRO: 공식몰 1+1 런칭 프로모션 & 저장/공유 유도",
          caption: "‘나중에 보려면 저장’ CTA 및 프로필 링크 구매 유도 클로징 카드",
          imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=85"
        }
      ],
      background: "SNS 유저들이 스크롤을 멈추고 끝까지 넘겨볼 수 있도록, 단순 제품 광고가 아닌 '환절기 스킨케어 꿀팁'이라는 가치 중심 정보형 콘텐츠로 기획되었습니다. 1:1 정방형 규격과 인스타그램 모바일 환경에 맞춘 볼드한 타이포그래피를 적용했습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "첫 장 3초 이탈 방지를 위한 훅 카피라이팅",
          description: "'환절기 속건조 탈출'이라는 타깃 고객의 페인포인트를 굵은 타이틀로 전면에 내세워 클릭률을 높였습니다."
        },
        {
          id: "focus-2",
          title: "슬라이드 간 자연스러운 연결을 돕는 비주얼 흐름",
          description: "각 장마다 하단에 프로그레스 바와 다음 장 넘김 화살표 그래픽을 배치하여 5장 완독률을 극대화했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. 5-CARD CAROUSEL OVERVIEW",
          caption: "인스타그램 피드 5장 카드뉴스 풀세트 그리드",
          imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=85",
          type: "grid"
        },
        {
          id: "sec-2",
          title: "02. INSTAGRAM MOBILE FEED MOCKUP",
          caption: "실제 인스타그램 UI와 결합된 모바일 피드 노출 시뮬레이션",
          imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
          type: "full"
        }
      ],
      outcome: {
        result: "인스타그램 공식 계정 및 뷰티 인플루언서 협업 콘텐츠 발행",
        details: "게시물 저장 수 평균 대비 340% 증가 및 프로필 링크 유입 전환율 18% 기록."
      }
    },
    {
      id: "project-modern-living-banner",
      number: "03",
      title: "모던 리빙 & 가구 시즌오프 쇼핑몰 메인 와이드 배너 & 프로모션 팩",
      category: "MAIN BANNER",
      projectType: "main-banner",
      summary: "자사몰 및 종합몰 메인 히어로 영역을 장식하는 1920px PC 와이드 배너와 모바일 앱 전용 배너, 기획전 팝업 배너 풀 패키지 디자인.",
      coverImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
      tags: ["Main Hero Banner", "E-Commerce", "Responsive Banner", "Promotion"],
      role: "Hero Banner Design / Multi-size Adaptation / CTA Optimization",
      period: "2026.01",
      tools: "Photoshop / Illustrator",
      client: "Maison Blanc Living",
      bannerVariations: [
        {
          id: "banner-1",
          label: "PC 쇼핑몰 메인 히어로 와이드 배너",
          dimension: "1920 x 600 px",
          imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85",
          description: "시즌오프 최대 50% 할인 키카피와 프리미엄 소파 연출컷을 시원한 여백과 함께 구성한 메인 슬라이드 배너"
        },
        {
          id: "banner-2",
          label: "모바일 앱 메인 롤링 배너",
          dimension: "750 x 750 px (1:1)",
          imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85",
          description: "스마트폰 작은 화면에서도 텍스트와 할인율이 또렷하게 인식되도록 대비감을 강화한 모바일 최적화 버전"
        },
        {
          id: "banner-3",
          label: "카테고리 기획전 서브 배너 & 팝업",
          dimension: "1080 x 540 px",
          imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85",
          description: "식탁 & 체어 특별 기획전 클릭을 유도하는 감각적인 인테리어 오브제 강조 서브 배너"
        }
      ],
      background: "온라인 가구 브랜드의 상반기 정기 세일 프로모션을 위한 메인 비주얼 구축 프로젝트입니다. 할인율만을 강조해 저렴해 보이는 것을 지양하고, 고급스러운 인테리어 톤앤매너를 유지하면서도 클릭 전환율(CTR)을 높이는 전략적 배너 세트를 제작했습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "고급스러운 세리프 타이포와 볼드한 숫자 할인율의 조화",
          description: "브랜드의 프리미엄 감성을 해치지 않도록 영문 헤드라인은 우아한 폰트를 채택하고, 'UP TO 50%' 숫자는 높은 명도 대비로 즉각 각인되도록 설계했습니다."
        },
        {
          id: "focus-2",
          title: "디바이스별 해상도와 시선 집중 구도 최적화",
          description: "PC에서는 좌측 텍스트 - 우측 공간감 컷의 2분할 밸런스를, 모바일에서는 중앙 집중형 레이아웃으로 변환하여 모든 기기에서 최적의 비율을 제공했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. PC E-COMMERCE MAIN HERO BANNER (1920x600)",
          caption: "쇼핑몰 메인 페이지 최상단 슬라이드 영역에 적용된 실제 와이드 배너 시뮬레이션",
          imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. MOBILE APP BANNER & SUB PROMOTION SET",
          caption: "모바일 앱 홈 화면과 기획전 탭에 매칭되는 1:1 정방형 배너 및 가로형 서브 배너",
          imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        }
      ],
      outcome: {
        result: "공식 온라인 스토어 메인 슬라이더 1번 구좌 및 네이버 브랜드데이 배너 게재",
        details: "메인 배너 클릭률(CTR) 8.7% 달성 및 기획전 페이지 체류시간 2분 40초 기록."
      }
    },
    {
      id: "project-lip-tint-video-motion",
      number: "04",
      title: "글로우 립 틴트 프로모션 영상 & 모션 그래픽",
      category: "VIDEO & MOTION",
      projectType: "video-motion",
      summary: "탕후루 광택 제형의 유리알 광채와 감각적인 텍스처 움직임을 리듬감 있는 모션 그래픽과 트렌디한 사운드 비트에 맞춘 멀티 포맷 프로모션 비디오 (모바일 숏폼, PC 와이드, SNS 정방형 풀 패키지).",
      coverImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1600&q=85",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4",
      aspectRatio: "9:16",
      videoVariations: [
        {
          id: "var-shortform",
          type: "9:16",
          label: "모바일 숏폼 버전 (9:16)",
          dimension: "1080 x 1920 px (9:16)",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4",
          coverImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85",
          description: "인스타그램 릴스, 유튜브 쇼츠, 틱톡 모바일 세로 풀스크린 최적화 영상. 자막 세이프존 준수 및 빠른 비트 컷전환."
        },
        {
          id: "var-pc",
          type: "16:9",
          label: "PC·웹 와이드 버전 (16:9)",
          dimension: "1920 x 1080 px (16:9)",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4",
          coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85",
          description: "공식 온라인 스토어 메인 비디오 영역 및 브랜드 유튜브 채널용 16:9 와이드 가로형 시네마틱 영상."
        },
        {
          id: "var-square",
          type: "1:1",
          label: "정사각형 타입 (1:1)",
          dimension: "1080 x 1080 px (1:1)",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-lipstick-in-front-of-a-mirror-40762-large.mp4",
          coverImage: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85",
          description: "인스타그램 스폰서드 피드 광고 및 카카오 비즈보드/모바일 배너용 1:1 정방형 영상."
        }
      ],
      tags: ["Short-form 9:16", "PC Wide 16:9", "Square 1:1", "After Effects", "Motion Graphic"],
      role: "Video Planning / Motion Design / Sound Sync / Editing",
      period: "2026.02",
      tools: "After Effects / Premiere Pro / Photoshop",
      client: "Lumière Cosmetics",
      videoKeyframes: [
        {
          timestamp: "00:00 - 00:03",
          title: "01. INTRO HOOK (유리알 광택 클로즈업)",
          description: "화면 가득 차오르는 촉촉한 워터 젤 텍스처와 빛 반사 하이라이트 모션으로 1초 만에 시선 고정",
          imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85"
        },
        {
          timestamp: "00:04 - 00:09",
          title: "02. 5-COLOR SHADE TRANSITION (색상 스위칭 모션)",
          description: "쿨톤/웜톤 5가지 시그니처 쉐이드가 빠르게 교차되는 다이내믹 타이포그래피 및 발색 트랜지션",
          imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85"
        },
        {
          timestamp: "00:10 - 00:15",
          title: "03. OUTRO & CTA (올리브영 단독 특가 안내)",
          description: "‘지금 바로 터치’ 인터랙션 모션과 올리브영 온/오프라인 단독 런칭 특가 자막 애니메이션",
          imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85"
        }
      ],
      background: "틱톡, 인스타그램 릴스, 유튜브 쇼츠 등 숏폼 플랫폼을 주 소비처로 삼는 잘파(Zalpha) 세대를 겨냥한 신제품 프로모션 영상입니다. 지루한 설명 대신 제품의 가장 강력한 시각 요소인 '광채 텍스처'를 감각적인 컷편집과 타이포 모션으로 구현했습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "비트매칭 컷편집과 텍스처 움직임 극대화",
          description: "빠른 템포의 트렌디한 BGM 드롭 구간에 맞춰 립 제품 뚜껑 개봉 및 발색 씬을 싱크 조율하여 강한 중독성을 유도했습니다."
        },
        {
          id: "focus-2",
          title: "모바일 세로형(9:16) 풀스크린 집중도",
          description: "양옆 여백 없이 꽉 찬 풀스크린 화면에 텍스트 자막이 인스타그램 하단 UI에 가려지지 않도록 안전 구역(Safe Zone)을 정밀 계산했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. 9:16 VERTICAL REELS MOTION PREVIEW",
          caption: "모바일 숏폼 풀스크린 재생 화면 및 스토리보드 구성",
          imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. KEYFRAME TIMELINE & MOTION GRAPHIC BREAKDOWN",
          caption: "애프터이펙트 키프레임 그래프와 타이포그래피 모션 레이어 구조",
          imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        }
      ],
      outcome: {
        result: "인스타그램 릴스 및 틱톡 공식 브랜드 광고 캠페인 집행",
        details: "릴스 조회수 45만 회 돌파 및 오가닉 공유 수 2,800건 달성."
      }
    },
    {
      id: "project-coldbrew-dripper",
      number: "05",
      title: "프리미엄 콜드브루 커피 메이커 상세페이지 디자인",
      category: "DETAIL PAGE",
      projectType: "detail-page",
      summary: "미세 점적 추출 메커니즘을 소비자가 한눈에 이해할 수 있도록 분해 구조 그래픽과 감성적 홈카페 무드로 풀어낸 상세페이지.",
      coverImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=85",
      tags: ["Kitchenware", "Detail Page", "Exploded View", "Editorial"],
      role: "Detail Page Design / Layout / Content Structuring",
      period: "2026.01 — 2026.02",
      tools: "Photoshop / Illustrator",
      client: "Atelier Brew Co.",
      background: "초정밀 스테인리스 밸브로 물방울 낙하 주기를 제어하는 프리미엄 콜드브루 기구의 상세페이지입니다. 텍스트 위주의 설명 대신, 사용자가 직접 추출하는 듯한 몰입감을 주는 비주얼 스토리로 기획했습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "정밀 기술 메커니즘의 시각적 분해",
          description: "어렵게 느껴질 수 있는 '초미세 밸브 유량 제어 기술'을 일러스트 분해도와 직관적인 단계별 가이드로 변환하여 제품의 차별화된 가치를 쉽게 납득시켰습니다."
        },
        {
          id: "focus-2",
          title: "오브제로서의 감성을 살린 다크 앤 앰버 톤앤매너",
          description: "주방 인테리어에 자연스럽게 녹아드는 고급스러움을 전달하기 위해 깊은 에스프레소 브라운과 웜 그레이의 차분한 컬러 시스템을 구축했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. KEY VISUAL & EXTRACTION ATMOSPHERE",
          caption: "천천히 떨어지는 커피 한 방울의 미학을 담은 메인 비주얼과 브랜드 철학 헤드라인",
          imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1400&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. PRECISION VALVE & MATERIAL SPEC",
          caption: "내열 유리와 304 스테인리스 스틸 소재의 퀄리티를 보여주는 마크로 줌 컷",
          imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        },
        {
          id: "sec-3",
          title: "03. STEP-BY-STEP BREWING RECIPE",
          caption: "원두 분쇄도부터 얼음 비율까지 초보자도 쉽게 따라 할 수 있는 4단계 직관적 인포그래픽",
          imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        }
      ],
      outcome: {
        result: "와디즈 크라우드 펀딩 및 자사몰 공식 런칭 페이지 적용",
        details: "펀딩 달성률 830% 기록 및 해외 수출용 영문/일문 상세페이지 추가 확장 제작."
      }
    },
    {
      id: "project-mechanical-keyboard",
      number: "06",
      title: "인체공학 슬림 기계식 키보드 상세페이지 디자인",
      category: "DETAIL PAGE",
      projectType: "detail-page",
      summary: "타건감과 스위치별 특성을 개발자 및 크리에이터 관점에서 알기 쉽게 비교 매트릭스로 정리한 데스크테리어 테크 상세페이지.",
      coverImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1600&q=85",
      tags: ["Tech & Gadget", "Detail Page", "Comparison Table", "Deskterior"],
      role: "Detail Page Design / Spec Graphic / Content Design",
      period: "2025.11 — 2025.12",
      tools: "Photoshop / Illustrator",
      client: "HexaGear Labs",
      background: "18mm 초슬림 로우프로파일 기계식 키보드의 신제품 출시를 맞아, 기계식 키보드 입문자부터 하드코어 사용자까지 만족할 수 있는 명확한 스펙 정보와 책상 위 인테리어 감성을 동시에 담아냈습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "스위치 선택 고민을 덜어주는 비교 매트릭스",
          description: "적축, 갈축, 청축 3종의 압력 곡선(Force Curve)과 타건음 사운드 특징을 아이콘과 그래프로 도식화해 구매 전환 결정을 유도했습니다."
        },
        {
          id: "focus-2",
          title: "데스크셋업 감성과 기능성 스펙의 유기적 배치",
          description: "알루미늄 바디의 마감 퀄리티를 강조하는 감성 컷과 블루투스 3채널 멀티페어링 등 기능 설명을 분리하지 않고 자연스러운 사용 씬 속에서 설명했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. DESKTERIOR HERO & PROFILE VIEW",
          caption: "18mm의 경이로운 슬림함과 미니멀 데스크테리어 셋업을 강조한 오프닝 섹션",
          imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. 3-WAY SWITCH SELECT GUIDE",
          caption: "적축(Linear), 갈축(Tactile), 청축(Clicky)의 압력 수치와 추천 사용 환경 매트릭스",
          imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        },
        {
          id: "sec-3",
          title: "03. MAC & WINDOWS SEAMLESS COMPATIBILITY",
          caption: "원터치 토글 스위치와 교체용 키캡 구성을 한눈에 보여주는 하단 스펙 가이드",
          imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        }
      ],
      outcome: {
        result: "얼리어답터 IT 커뮤니티 프리오더 및 공식 스토어 상세페이지 활용",
        details: "사전 예약 수량 1,500대 조기 완판 달성에 기여."
      }
    },
    {
      id: "project-innerbeauty-gummy",
      number: "07",
      title: "올인데이 이너뷰티 비타민 구미 프로모션 배너 & SNS 콘텐츠",
      category: "SNS CONTENT",
      projectType: "sns-content",
      summary: "간식처럼 챙겨 먹는 비타민 구미의 상큼한 과즙감을 비비드한 컬러와 감각적인 인포그래픽으로 풀어낸 프로모션 에셋 세트.",
      coverImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=85",
      heroMockupImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=85",
      tags: ["Healthcare", "SNS Content", "Promotion Banner", "Vibrant Color"],
      role: "Promotion Banner / SNS Card News / Content Planning",
      period: "2025.08 — 2025.09",
      tools: "Photoshop / Illustrator",
      client: "VITA VIBE",
      background: "딱딱한 알약 형태 영양제에 거부감을 느끼는 2030 여성을 타깃으로, 간식처럼 맛있게 즐기는 고함량 멀티비타민 구미의 생동감 넘치는 매력을 전달하고자 기획되었습니다.",
      designFocus: [
        {
          id: "focus-1",
          title: "복잡한 영양 성분표를 직관적인 데일리 체크리스트로 전환",
          description: "글자 크기가 작은 성분 정보를 '하루 2알로 100% 충족하는 비타민 8종'으로 직관화하여 영양소 섭취치를 한눈에 체크하도록 구성했습니다."
        },
        {
          id: "focus-2",
          title: "탱글한 텍스처와 과즙감을 자극하는 생생한 컬러 큐레이션",
          description: "비타민의 활력을 상징하는 탠저린 오렌지와 레몬 옐로우를 키컬러로 적용하고 쫀득한 젤리 식감을 클로즈업 컷으로 극대화했습니다."
        }
      ],
      sections: [
        {
          id: "sec-1",
          title: "01. VIBRANT HERO & BENEFIT HIGHLIGHT",
          caption: "생기 넘치는 과즙 무드와 하루 활력 충전을 약속하는 캐치프레이즈 레이아웃",
          imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=85",
          type: "full"
        },
        {
          id: "sec-2",
          title: "02. DAILY NUTRITION CHECKPOINT",
          caption: "비타민C, B군, 아연 등 필수 영양소 8종의 일일 권장량 충족 지표 인포그래픽",
          imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        },
        {
          id: "sec-3",
          title: "03. SAFE FORMULA & ZERO SUGAR PROOF",
          caption: "식물성 펙틴 사용 및 설탕 제로 포뮬러 인증 마크를 깔끔하게 정리한 신뢰 영역",
          imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=85",
          type: "split"
        }
      ],
      outcome: {
        result: "올리브영 온라인몰 및 카카오톡 선물하기 메인 상세페이지로 런칭",
        details: "선물하기 헬스 카테고리 실시간 베스트 랭킹 3위 진입."
      }
    }
  ],
  approach: {
    sectionNumber: "02",
    sectionTitle: "HOW I DESIGN",
    coreQuote: "디자인은 보기 좋은 것을 만드는 것에서 끝나는 것이 아니라, 필요한 정보를 가장 효과적으로 전달하는 일이라고 생각합니다.",
    quoteSubtext: "화려한 기교보다 상품의 본질을 먼저 파악하고, 소비자가 결정을 내리기까지의 자연스러운 시선 흐름을 설계합니다.",
    steps: [
      {
        step: "01",
        enTitle: "Understand",
        koTitle: "먼저 목적과 본질을 이해합니다.",
        description: "상세페이지, SNS 콘텐츠, 메인 배너, 영상 등 매체의 특성과 타깃 고객의 반응 포인트를 명확히 분석하고 핵심 메시지의 우선순위를 정합니다.",
        points: ["제품 USP(핵심 셀링 포인트) 및 타깃 심리 분석", "매체별(상세페이지/SNS/배너/영상) 소비 호흡 파악", "정보 위계 및 카피라이팅 기획"]
      },
      {
        step: "02",
        enTitle: "Organize",
        koTitle: "정보의 흐름과 구조를 설계합니다.",
        description: "수많은 정보를 한 번에 쏟아내기보다, 보는 사람이 편안하고 자연스럽게 이해할 수 있는 논리적 훅(Hook)-바디-클로징 구조를 만듭니다.",
        points: ["3초 이내 시선을 잡는 인트로 훅 구성", "문제 제기 및 해결책의 설득적 연결", "스크롤 호흡을 고려한 단락 분할"]
      },
      {
        step: "03",
        enTitle: "Visualize",
        koTitle: "최적의 비주얼 언어로 표현합니다.",
        description: "정리된 내용이 가장 돋보일 수 있도록 컬러, 이미지 리터칭, 타이포그래피, 인포그래픽, 모션 요소를 활용해 브랜드 분위기와 신뢰도를 극대화합니다.",
        points: ["브랜드 톤에 맞춘 정교한 컬러 팔레트 구축", "핵심 스펙의 직관적 인포그래픽화", "제품 질감과 디테일을 살린 비주얼 컷 배치"]
      },
      {
        step: "04",
        enTitle: "Refine",
        koTitle: "작은 디테일까지 완벽하게 다듬습니다.",
        description: "자간, 행간, 여백의 그리드, 모바일 뷰포트에서의 가독성, 해상도별 배너 최적화 등 전체적인 완성도를 좌우하는 1px의 디테일까지 점검합니다.",
        points: ["모바일 최적화 텍스트 크기 및 가독성 검수", "픽셀 정렬 및 시각적 무게 균형 조율", "최종 퍼블리싱 가이드 및 산출물 최적화"]
      }
    ]
  },
  about: {
    sectionNumber: "03",
    sectionTitle: "ABOUT ME",
    greeting: "안녕하세요. 기획부터 쇼핑몰 구축·운영, 퍼포먼스 광고 비주얼까지 성과를 만드는 7년차 커머스 웹디자이너 김민경입니다.",
    intro: "하나다이아몬드 메인 웹디자이너 및 과장으로서 카페24 쇼핑몰 오픈/구축부터 스마트스토어·오픈마켓 운영을 총괄하여 네이버 카테고리 1위 및 월매출 1억을 달성했습니다. 이후 한국이텔레콤 웹디자이너를 거쳐, 현재 성형외과·피부과 전문 인하우스 마케팅 대행사인 더블어스에서 병원 이벤트 페이지 기획/제작, 프로모션 랜딩페이지, SNS 콘텐츠 및 광고 소재 전반을 기획·디자인하고 있습니다.",
    strengthsTitle: "MY STRENGTHS",
    strengths: [
      {
        id: "strength-planning",
        title: "100% Direct Planning",
        subtitle: "기획 & 카피라이팅 역량",
        description: "단순 툴 작업을 넘어 시장/타깃 분석, 이벤트 기획, 셀링 훅 카피라이팅까지 직접 1인 주도합니다.",
        tag: "01 / PLANNING"
      },
      {
        id: "strength-store",
        title: "E-Commerce Operation",
        subtitle: "스토어 구축·운영 & 매출 1억 달성",
        description: "카페24 쇼핑몰 구축부터 스마트스토어·오픈마켓 운영을 총괄하며 네이버 1위 및 월 1억 매출을 달성했습니다.",
        tag: "02 / STORE OPS"
      },
      {
        id: "strength-marketing",
        title: "Performance & Conversion",
        subtitle: "인하우스 마케팅 & 광고 소재",
        description: "병원 인하우스 마케팅 대행사에서 이벤트 페이지, 프로모션 랜딩, SNS/영상 광고 소재를 기획·제작합니다.",
        tag: "03 / PERFORMANCE"
      }
    ],
    skills: [
      {
        category: "DESIGN & TOOLS",
        items: [
          "Adobe Photoshop (상세페이지 / 배너 / 합성 / 텍스처 리터칭 / 제품 촬영 보정)",
          "Adobe Illustrator (벡터 그래픽 / 로고 / 인포그래픽 / 프로모션 타이포)",
          "HTML / CSS (카페24 쇼핑몰 레이아웃 커스텀 및 웹 환경 최적화)",
          "상세페이지 & 이벤트 랜딩페이지 기획 및 디자인 제작",
          "SNS 카드뉴스 / 프로모션 배너 / 홍보 인쇄물(포스터·브로슈어)"
        ]
      },
      {
        category: "COMMERCE & MARKETING",
        items: [
          "쇼핑몰 구축 및 운영 (카페24, 네이버 스마트스토어, 쿠팡, 오픈마켓, 소셜커머스)",
          "인하우스 마케팅 & 광고 기획 (병원 이벤트 페이지, 프로모션 캠페인 랜딩페이지)",
          "온라인 광고 소재 기획 및 제작 (배너, 카드뉴스, SNS 콘텐츠, 광고 영상)",
          "성과 데이터 기반 전환율(CVR) 최적화 및 광고 효율 개선",
          "상품 소싱/등록, 가격 비교/조정, SNS 채널 운영 및 고객 반응 분석"
        ]
      }
    ],
    experiences: [
      {
        id: "exp-1",
        year: "2025.02 — 현재 재직중",
        title: "더블어스 (마케팅팀 · 선임 / 웹디자인)",
        role: "병원 전문 인하우스 마케팅 대행 웹디자이너",
        responsibility: "성형외과·피부과 병원 이벤트 페이지 기획 및 디자인 제작, 프로모션·캠페인 랜딩페이지 디자인 및 운영, 온라인 광고 소재(배너, 카드뉴스, SNS 콘텐츠, 간단한 광고 영상) 기획 및 제작, 광고 성과 데이터 기반 전환율 개선",
        project: "병원 이벤트 페이지 & 프로모션 캠페인 랜딩페이지 전담, SNS 광고 소재 기획 및 전환율 최적화"
      },
      {
        id: "exp-2",
        year: "2024.07 — 2024.10",
        title: "한국이텔레콤 (사원 / 웹디자인)",
        role: "웹디자이너",
        responsibility: "MVNO 홈페이지 리뉴얼, 상세페이지 제작, 제품 핸드폰 촬영, 포스터·브로슈어 등 홍보 인쇄물 제작, 사내 교육자료 및 제안서 디자인 제작",
        project: "MVNO 공식 홈페이지 리뉴얼, 통신 서비스 상세페이지 및 홍보 인쇄물 제작"
      },
      {
        id: "exp-3",
        year: "2018.08 — 2022.10 (4년 3개월)",
        title: "하나다이아몬드 (온라인팀 · 과장 / 총괄)",
        role: "메인 웹디자이너, AMD 및 온라인팀 총괄 (과장 승진)",
        responsibility: "카페24 쇼핑몰 오픈/구축 및 HTML/CSS 레이아웃 수정, 쇼핑몰 배너 및 상세페이지 기획/제작 운영, 스마트스토어/오픈마켓/소셜커머스 상품 등록 및 운영, 유튜브/SNS 채널 관리, 모델 캐스팅 및 촬영 장소 섭외, 네이버 쇼핑 가격비교/조정, 인사/총무/국가지원사업 서류 총괄",
        project: "네이버 쇼핑 카테고리 내 인기 브랜드·인기 쇼핑몰 1위 달성 및 월매출 1억 원 달성"
      },
      {
        id: "exp-4",
        year: "2022.06 — 2022.07",
        title: "에스엔패션그룹 (소녀나라)",
        role: "웹디자인 아르바이트",
        responsibility: "여성의류 쇼핑몰 사진 보정 및 1차 기본 상세페이지 제작",
        project: "소녀나라 의류 제품 사진 보정 및 상세페이지 초안 제작"
      }
    ],
    resumeUrl: ""
  },
  contact: {
    sectionNumber: "04",
    sectionTitle: "CONTACT",
    heading: "LET'S WORK TOGETHER.",
    subHeading: "새로운 프로젝트와 좋은 디자인 기회를 기다리고 있습니다.",
    emailNote: "이메일 또는 연락처로 편하게 문의해주시면 확인 후 신속하게 회신드리겠습니다.",
    availableBadgeText: "Available for work"
  }
};
