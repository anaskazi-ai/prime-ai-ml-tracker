// Prime AI/ML Course Tracker - dj's Mission Control Engine
(function () {
  'use strict';

  // Core State
  let catalog = null;
  let progress = {
    completed_items: {},
    starred_items: {},
    notes: {},
    daily_target: 5,
    pomodoro_history: [],
    study_log: {},
    playback_positions: {},
    last_active: { day_id: 'DAY 01', item_id: null }
  };

  let activeDayId = 'DAY 01';
  let sidebarMode = 'days'; // 'days' (All 62 Days) or 'phases' (By Phase)
  let activeFilterType = 'all';
  let activeSearchFilter = '';
  let noteDebounceTimer = null;
  let videoTimeUpdateTimer = null;
  let currentPlayingItem = null;

  // Pomodoro State
  let pomoDuration = 25 * 60;
  let pomoRemaining = pomoDuration;
  let pomoTimerId = null;
  let pomoRunning = false;
  let pomoModeMins = 25;

  // DOM Elements - Header
  const headerPercent = document.getElementById('header-percent');
  const headerRing = document.getElementById('header-ring');
  const headerVideosDone = document.getElementById('header-videos-done');
  const headerStreak = document.getElementById('header-streak');
  const headerTodayGoal = document.getElementById('header-today-goal');
  const starredCountPill = document.getElementById('starred-count-pill');

  // DOM Elements - Focus Studio & Study Timer
  const pomoTimer = document.getElementById('pomo-timer');
  const pomoToggleBtn = document.getElementById('pomo-toggle-btn');
  const pomoResetBtn = document.getElementById('pomo-reset-btn');
  const pomoModes = document.querySelectorAll('.focus-mode-btn');
  const btnTimeMinus5 = document.getElementById('btn-time-minus-5');
  const btnTimePlus5 = document.getElementById('btn-time-plus-5');
  const btnCustomTime = document.getElementById('btn-custom-time');
  const todayStudyMins = document.getElementById('today-study-mins');

  // DOM Elements - Custom Time Modal
  const customTimeModal = document.getElementById('custom-time-modal');
  const customTimeCloseBtn = document.getElementById('custom-time-close-btn');
  const btnCancelCustomTime = document.getElementById('btn-cancel-custom-time');
  const btnApplyCustomTime = document.getElementById('btn-apply-custom-time');
  const inputCustomMinutes = document.getElementById('input-custom-minutes');
  const btnStepMinus10 = document.getElementById('btn-step-minus-10');
  const btnStepMinus5 = document.getElementById('btn-step-minus-5');
  const btnStepPlus5 = document.getElementById('btn-step-plus-5');
  const btnStepPlus10 = document.getElementById('btn-step-plus-10');
  const chipPresets = document.querySelectorAll('.chip-preset');

  // DOM Elements - Sidebar
  const tabViewDays = document.getElementById('tab-view-days');
  const tabViewPhases = document.getElementById('tab-view-phases');
  const sidebarSearchBox = document.getElementById('sidebar-search-box');
  const sidebarContentRoot = document.getElementById('sidebar-content-root');
  const sidebarExamVaultBtn = document.getElementById('sidebar-exam-vault-btn');
  const contentWorkspace = document.getElementById('content-workspace');

  // DOM Elements - Resume Banner
  const resumeLectureTitle = document.getElementById('resume-lecture-title');
  const resumeDayBadge = document.getElementById('resume-day-badge');
  const resumeTimeBadge = document.getElementById('resume-time-badge');
  const resumeWatchBtn = document.getElementById('resume-watch-btn');

  // DOM Elements - Day Panel
  const dayPhaseName = document.getElementById('day-phase-name');
  const dayNumberLabel = document.getElementById('day-number-label');
  const dayHeading = document.getElementById('day-heading');
  const dayOverview = document.getElementById('day-overview');
  const dayPctLabel = document.getElementById('day-pct-label');
  const dayCountLabel = document.getElementById('day-count-label');
  const dayProgFill = document.getElementById('day-prog-fill');
  const dayStatVids = document.getElementById('day-stat-vids');
  const dayStatDuration = document.getElementById('day-stat-duration');
  const dayStatBooks = document.getElementById('day-stat-books');
  const dayStatSize = document.getElementById('day-stat-size');

  const btnPrevDay = document.getElementById('btn-prev-day');
  const btnNextDay = document.getElementById('btn-next-day');
  const btnToggleDayComplete = document.getElementById('btn-toggle-day-complete');
  const btnToggleDayText = document.getElementById('btn-toggle-day-text');
  const btnOpenDayFolder = document.getElementById('btn-open-day-folder');

  // DOM Elements - Advance Next Day Card
  const dayAdvanceCard = document.getElementById('day-advance-card');
  const advanceNextTitle = document.getElementById('advance-next-title');
  const advanceNextMeta = document.getElementById('advance-next-meta');
  const btnAdvanceNextDay = document.getElementById('btn-advance-next-day');

  // DOM Elements - Day Notes
  const notesBarToggle = document.getElementById('notes-bar-toggle');
  const notesContentArea = document.getElementById('notes-content-area');
  const notesArrow = document.getElementById('notes-arrow');
  const dayNotesInput = document.getElementById('day-notes-input');
  const notesStatusMsg = document.getElementById('notes-status-msg');
  const btnSaveNote = document.getElementById('btn-save-note');
  const notesActiveTag = document.getElementById('notes-active-tag');
  const quickTagBtns = document.querySelectorAll('.quick-tag-btn');

  // DOM Elements - Filters & Lessons
  const filterPills = document.querySelectorAll('.tab-pill');
  const lessonLocalSearch = document.getElementById('lesson-local-search');
  const lessonsCardsStack = document.getElementById('lessons-cards-stack');

  const countAll = document.getElementById('count-all');
  const countVideo = document.getElementById('count-video');
  const countNotebook = document.getElementById('count-notebook');
  const countPdf = document.getElementById('count-pdf');
  const countStarred = document.getElementById('count-starred');

  // DOM Elements - Apna College Classroom Stage
  const classroomStage = document.getElementById('classroom-stage');
  const stageDayBadge = document.getElementById('stage-day-badge');
  const stageLectureTitle = document.getElementById('stage-lecture-title');
  const stageDurationTag = document.getElementById('stage-duration-tag');
  const stageSpeedBtns = document.querySelectorAll('.stage-speed-btn');
  const btnToggleTheaterExpand = document.getElementById('btn-toggle-theater-expand');
  const stageVideo = document.getElementById('stage-video');
  const btnStagePrevLecture = document.getElementById('btn-stage-prev-lecture');
  const btnStageMarkComplete = document.getElementById('btn-stage-mark-complete');
  const stageMarkLabel = document.getElementById('stage-mark-label');
  const btnStageNextLecture = document.getElementById('btn-stage-next-lecture');
  const stageBtnStar = document.getElementById('stage-btn-star');
  const stageBtnVlc = document.getElementById('stage-btn-vlc');
  const stageBtnFolder = document.getElementById('stage-btn-folder');

  // Video Theater Modal
  const videoTheater = document.getElementById('video-theater');
  const theaterVideo = document.getElementById('theater-video');
  const theaterDayBadge = document.getElementById('theater-day-badge');
  const theaterTitle = document.getElementById('theater-title');
  const theaterVlcBtn = document.getElementById('theater-vlc-btn');
  const theaterCloseBtn = document.getElementById('theater-close-btn');
  const theaterNextBtn = document.getElementById('theater-next-btn');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // Modals
  const searchModal = document.getElementById('search-modal');
  const btnOpenSearch = document.getElementById('btn-open-search');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const globalSearchField = document.getElementById('global-search-field');
  const searchModalResults = document.getElementById('search-modal-results');

  const starredModal = document.getElementById('starred-modal');
  const btnOpenStarred = document.getElementById('btn-open-starred');
  const starredCloseBtn = document.getElementById('starred-close-btn');
  const starredItemsBox = document.getElementById('starred-items-box');

  const roadmapModal = document.getElementById('roadmap-modal');
  const btnOpenRoadmap = document.getElementById('btn-open-roadmap');
  const roadmapCloseBtn = document.getElementById('roadmap-close-btn');
  const kpiVideosDone = document.getElementById('kpi-videos-done');
  const kpiDaysDone = document.getElementById('kpi-days-done');
  const kpiHoursTotal = document.getElementById('kpi-hours-total');
  const kpiEstimatedDate = document.getElementById('kpi-estimated-date');
  const roadmapPhasesGrid = document.getElementById('roadmap-phases-grid');

  const settingsModal = document.getElementById('settings-modal');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingDailyTarget = document.getElementById('setting-daily-target');
  const btnSaveTarget = document.getElementById('btn-save-target');
  const btnExportBackup = document.getElementById('btn-export-backup');
  const btnTriggerImport = document.getElementById('btn-trigger-import');
  const fileImportInput = document.getElementById('file-import-input');
  const btnOpenFolder = document.getElementById('btn-open-folder');
  const toastShelf = document.getElementById('toast-shelf');

  // -------------------------------------------------------------
  // Theme Engine (Clean Pearl White ☀️ ⟷ Obsidian Dark 🌙)
  // -------------------------------------------------------------
  let currentTheme = localStorage.getItem('prime_course_theme') || 'light';

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('prime_course_theme', theme);
    } catch (e) {}

    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');

    if (theme === 'light') {
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeLabel) themeLabel.textContent = 'Dark';
    } else {
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeLabel) themeLabel.textContent = 'Light';
    }
  }

  function toggleTheme() {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    toast(`Theme switched to ${nextTheme === 'light' ? 'Clean Pearl White ☀️' : 'Obsidian Dark 🌙'}!`, 'info');
  }

  // Apply saved theme immediately to prevent any visual flicker
  applyTheme(currentTheme);

  // -------------------------------------------------------------
  // Dual Mode Persistence & Startup (SQLite Backend + Static Offline Fallback)
  // -------------------------------------------------------------
  let isStaticMode = false;

  function persistLocalProgress() {
    try {
      localStorage.setItem('prime_course_progress', JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }

  async function startup() {
    bindEvents();
    try {
      let catRes = null;
      let progRes = null;

      try {
        const responses = await Promise.all([
          fetch('/api/catalog').then(r => {
            if (!r.ok) throw new Error('Catalog HTTP ' + r.status);
            return r.json();
          }),
          fetch('/api/progress').then(r => {
            if (!r.ok) throw new Error('Progress HTTP ' + r.status);
            return r.json();
          })
        ]);
        catRes = responses[0];
        progRes = responses[1];
        isStaticMode = false;
      } catch (netErr) {
        console.warn('Backend server not reachable, switching to Static / GitHub Pages mode...', netErr);
        isStaticMode = true;
        // 1. Fetch static bundled course catalog
        catRes = await fetch('./course_catalog.json').then(r => {
          if (!r.ok) throw new Error('Static catalog HTTP ' + r.status);
          return r.json();
        });

        // 2. Fetch or initialize progress from localStorage
        const saved = localStorage.getItem('prime_course_progress');
        if (saved) {
          try { progRes = JSON.parse(saved); } catch (e) {}
        }
        if (!progRes) {
          progRes = {
            completed_items: {},
            starred_items: {},
            notes: {},
            daily_target: 5,
            pomodoro_history: [],
            study_log: {},
            playback_positions: {},
            last_active: { day_id: 'DAY 01', item_id: null }
          };
        }
        toast('🌐 Running in Cloud / Static Mode (Saved to browser)', 'info');
      }

      catalog = catRes;
      progress = progRes;
      persistLocalProgress();

      if (progress.last_active && progress.last_active.day_id) {
        activeDayId = progress.last_active.day_id;
      }

      if (settingDailyTarget) {
        settingDailyTarget.value = progress.daily_target || 5;
      }

      renderSidebar();
      renderActiveDay();
      updateResumeBanner();
      updateTopMetrics();
      initOfflineWatcher();
    } catch (err) {
      console.error('Initialization error:', err);
      toast('Failed to load course details. Ensure backend server or static catalog is available.', 'error');
    }
  }

  // -------------------------------------------------------------
  // Resume Banner Logic
  // -------------------------------------------------------------
  function getNextUncompletedLecture() {
    if (!catalog || !catalog.days) return null;
    const completedMap = progress.completed_items || {};

    // Check active day first
    const currentDay = catalog.days.find(d => d.day_id === activeDayId);
    if (currentDay && currentDay.day_id !== 'FINAL_EXAM') {
      const nextInCurrent = currentDay.items.find(i => i.type === 'video' && !completedMap[i.id]);
      if (nextInCurrent) return { day: currentDay, item: nextInCurrent };
    }

    // Walk days in order
    for (const day of catalog.days) {
      if (day.day_id === 'FINAL_EXAM') continue;
      const nextVid = day.items.find(i => i.type === 'video' && !completedMap[i.id]);
      if (nextVid) return { day, item: nextVid };
    }

    const day1 = catalog.days[0];
    return day1 ? { day: day1, item: day1.items[0] } : null;
  }

  function updateResumeBanner() {
    const next = getNextUncompletedLecture();
    if (!next || !next.item) {
      if (resumeLectureTitle) resumeLectureTitle.textContent = "All lectures completed! 🎉";
      if (resumeDayBadge) resumeDayBadge.textContent = "COMPLETE";
      if (resumeTimeBadge) resumeTimeBadge.textContent = "100%";
      return;
    }

    const { day, item } = next;
    if (resumeLectureTitle) resumeLectureTitle.textContent = item.clean_title;
    if (resumeDayBadge) resumeDayBadge.textContent = day.day_id;
    if (resumeTimeBadge) resumeTimeBadge.textContent = item.duration ? `⏱️ ${item.duration}` : "⏱️ Video";

    if (resumeWatchBtn) {
      resumeWatchBtn.onclick = () => {
        selectDay(day.day_id);
        openVideo(item, day);
      };
    }
  }

  // -------------------------------------------------------------
  // Top Navigation Metrics
  // -------------------------------------------------------------
  function updateTopMetrics() {
    if (!catalog || !catalog.days) return;

    const totalVideos = catalog.total_videos || 818;
    const completedMap = progress.completed_items || {};

    let videosDone = 0;
    let daysDone = 0;

    catalog.days.forEach(day => {
      let dayCompleted = 0;
      day.items.forEach(it => {
        if (completedMap[it.id]) {
          if (it.type === 'video') videosDone++;
          dayCompleted++;
        }
      });
      if (day.items.length > 0 && dayCompleted === day.items.length && day.day_id !== 'FINAL_EXAM') {
        daysDone++;
      }
    });

    const pct = totalVideos > 0 ? Math.round((videosDone / totalVideos) * 100) : 0;
    if (headerPercent) headerPercent.textContent = `${pct}%`;
    if (headerVideosDone) headerVideosDone.textContent = `${videosDone} / ${totalVideos}`;
    if (headerRing) headerRing.setAttribute('stroke-dasharray', `${pct}, 100`);

    const streak = computeStreak();
    if (headerStreak) headerStreak.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = progress.study_log && progress.study_log[todayStr];
    const doneToday = todayLog ? todayLog.items_completed : 0;
    const target = progress.daily_target || 5;
    if (headerTodayGoal) headerTodayGoal.textContent = `${doneToday} / ${target}`;

    const todayMins = todayLog ? (todayLog.minutes || 0) : 0;
    if (todayStudyMins) todayStudyMins.textContent = `${todayMins}m`;
    const sidebarTodayMins = document.getElementById('sidebar-today-mins');
    if (sidebarTodayMins) sidebarTodayMins.textContent = `${todayMins}m`;

    const starCount = Object.keys(progress.starred_items || {}).length;
    if (starredCountPill) starredCountPill.textContent = starCount;
  }

  function computeStreak() {
    if (!progress.study_log) return 1;
    const activeDates = Object.keys(progress.study_log).filter(d => progress.study_log[d].items_completed > 0);
    if (activeDates.length === 0) return 1;

    let streak = 0;
    let cursor = new Date();

    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (activeDates.includes(dStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        if (streak === 0) {
          cursor.setDate(cursor.getDate() - 1);
          const yStr = cursor.toISOString().split('T')[0];
          if (activeDates.includes(yStr)) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return Math.max(1, streak);
  }

  // -------------------------------------------------------------
  // Sidebar Rendering: Dual Mode (All 62 Days vs By Phase)
  // -------------------------------------------------------------
  function renderSidebar() {
    if (!catalog || !catalog.days || !sidebarContentRoot) return;

    sidebarContentRoot.innerHTML = '';
    const query = (sidebarSearchBox ? sidebarSearchBox.value : '').trim().toLowerCase();
    const completedMap = progress.completed_items || {};

    if (sidebarMode === 'days') {
      renderAllDaysView(query, completedMap);
    } else {
      renderPhasesView(query, completedMap);
    }
  }

  // 1. ALL 62 DAYS DIRECT VIEW
  function renderAllDaysView(query, completedMap) {
    const daysToRender = catalog.days.filter(d => {
      if (d.day_id === 'FINAL_EXAM') return false;
      if (!query) return true;
      const topicMatch = d.items.some(i => i.clean_title.toLowerCase().includes(query));
      return d.day_id.toLowerCase().includes(query) || d.phase_badge.toLowerCase().includes(query) || topicMatch;
    });

    if (daysToRender.length === 0) {
      sidebarContentRoot.innerHTML = `<div class="empty-hint" style="padding: 12px; font-size: 11px;">No days match "${query}"</div>`;
      return;
    }

    daysToRender.forEach(day => {
      const total = day.items.length;
      const done = day.items.filter(it => completedMap[it.id]).length;
      const isDone = total > 0 && done === total;
      const isPart = done > 0 && !isDone;

      const firstVid = day.items.find(i => i.type === 'video') || day.items[0];
      const topic = firstVid ? firstVid.clean_title : day.phase_badge;

      const card = document.createElement('div');
      card.className = `sidebar-day-card ${day.day_id === activeDayId ? 'active' : ''}`;
      card.dataset.dayId = day.day_id;
      card.innerHTML = `
        <div class="s-day-left">
          <span class="s-status-icon">${isDone ? '🟢' : isPart ? '🟡' : '⚪'}</span>
          <div class="s-day-meta">
            <div class="s-day-title-row">
              <span class="s-day-num">${day.day_id}</span>
              <span class="s-day-topic">${topic}</span>
            </div>
          </div>
        </div>
        <span class="s-day-badge-cnt">${done}/${total}</span>
      `;

      card.addEventListener('click', () => {
        selectDay(day.day_id);
      });

      sidebarContentRoot.appendChild(card);
    });
  }

  // 2. BY PHASE ACCORDION VIEW
  function renderPhasesView(query, completedMap) {
    catalog.phases.forEach(phase => {
      const phaseDays = catalog.days.filter(d => phase.days.includes(d.day_id));

      const filteredDays = query
        ? phaseDays.filter(d => d.day_id.toLowerCase().includes(query) || d.title.toLowerCase().includes(query) || d.items.some(i => i.clean_title.toLowerCase().includes(query)))
        : phaseDays;

      if (filteredDays.length === 0 && query) return;

      const group = document.createElement('div');
      group.className = 'phase-accordion-card';
      if (phase.days.includes(activeDayId) || query) {
        group.classList.add('open');
      }

      let pTotal = 0;
      let pDone = 0;
      phaseDays.forEach(d => {
        pTotal += d.items.length;
        d.items.forEach(it => {
          if (completedMap[it.id]) pDone++;
        });
      });
      const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

      const head = document.createElement('div');
      head.className = 'phase-accordion-head';
      head.innerHTML = `
        <div class="phase-indicator-dot" style="background: ${phase.color};"></div>
        <div class="phase-head-meta">
          <span class="phase-head-title">${phase.title}</span>
          <span class="phase-head-sub">${pDone}/${pTotal} lessons • ${pPct}%</span>
        </div>
        <span class="phase-toggle-icon">▼</span>
      `;

      head.addEventListener('click', () => {
        group.classList.toggle('open');
      });

      const menu = document.createElement('div');
      menu.className = 'phase-nested-days';

      filteredDays.forEach(day => {
        const total = day.items.length;
        const done = day.items.filter(it => completedMap[it.id]).length;
        const isDone = total > 0 && done === total;
        const isPart = done > 0 && !isDone;

        const firstVid = day.items.find(i => i.type === 'video') || day.items[0];
        const topic = firstVid ? firstVid.clean_title : day.phase_badge;

        const row = document.createElement('div');
        row.className = `sidebar-day-card ${day.day_id === activeDayId ? 'active' : ''}`;
        row.dataset.dayId = day.day_id;
        row.innerHTML = `
          <div class="s-day-left">
            <span class="s-status-icon">${isDone ? '🟢' : isPart ? '🟡' : '⚪'}</span>
            <div class="s-day-meta">
              <div class="s-day-title-row">
                <span class="s-day-num">${day.day_id}</span>
                <span class="s-day-topic">${topic}</span>
              </div>
            </div>
          </div>
          <span class="s-day-badge-cnt">${done}/${total}</span>
        `;

        row.addEventListener('click', () => selectDay(day.day_id));
        menu.appendChild(row);
      });

      group.appendChild(head);
      group.appendChild(menu);
      sidebarContentRoot.appendChild(group);
    });
  }

  // -------------------------------------------------------------
  // Day Selection & Center Workspace Rendering
  // -------------------------------------------------------------
  function selectDay(dayId) {
    activeDayId = dayId;
    renderSidebar();
    renderActiveDay();

    if (contentWorkspace) {
      contentWorkspace.scrollTo({ top: 0, behavior: 'smooth' });
    }

    fetch('/api/progress/last-active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_id: dayId })
    }).catch(() => {});
  }

  function getAdjacentDay(direction) {
    if (!catalog || !catalog.days) return null;
    const realDays = catalog.days.filter(d => d.day_id !== 'FINAL_EXAM');
    const idx = realDays.findIndex(d => d.day_id === activeDayId);
    if (direction === 'prev') {
      return idx > 0 ? realDays[idx - 1] : null;
    } else {
      return idx >= 0 && idx < realDays.length - 1 ? realDays[idx + 1] : null;
    }
  }

  function renderActiveDay() {
    if (!catalog || !catalog.days) return;

    const day = catalog.days.find(d => d.day_id === activeDayId);
    if (!day) return;

    const completedMap = progress.completed_items || {};
    const starredMap = progress.starred_items || {};

    // 1. CALCULATE COUNTS FIRST - GUARANTEES ACCURATE TABS UNDER ALL CONDITIONS
    const total = day.items.length;
    const done = day.items.filter(it => completedMap[it.id]).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const vCount = day.items.filter(i => i.type === 'video').length;
    const nbCount = day.items.filter(i => i.type === 'notebook').length;
    const pdfCount = day.items.filter(i => i.type === 'pdf').length;
    const sCount = day.items.filter(i => starredMap[i.id]).length;

    // UPDATE FILTER TAB COUNTERS IMMEDIATELY
    if (countAll) countAll.textContent = total;
    if (countVideo) countVideo.textContent = vCount;
    if (countNotebook) countNotebook.textContent = nbCount;
    if (countPdf) countPdf.textContent = pdfCount;
    if (countStarred) countStarred.textContent = sCount;

    // UPDATE PROGRESS STRIP & STATS IMMEDIATELY
    if (dayPctLabel) dayPctLabel.textContent = `${pct}%`;
    if (dayCountLabel) dayCountLabel.textContent = `${done} / ${total} Completed`;
    if (dayProgFill) dayProgFill.style.width = `${pct}%`;

    if (dayStatVids) dayStatVids.textContent = `📹 ${day.videos_count} Videos`;
    if (dayStatDuration) dayStatDuration.textContent = `⏱️ ${day.total_duration || '~45m'}`;
    if (dayStatBooks) dayStatBooks.textContent = `📓 ${day.notebooks_count} Notebooks`;
    if (dayStatSize) dayStatSize.textContent = `💾 ${day.total_size_mb} MB`;

    const allDone = total > 0 && done === total;
    if (btnToggleDayText) {
      btnToggleDayText.textContent = allDone ? 'Reset Day Progress' : 'Mark All Completed';
    }

    // Breadcrumb & Hero
    if (dayPhaseName) dayPhaseName.textContent = day.phase_title;
    if (dayNumberLabel) dayNumberLabel.textContent = day.day_id;

    if (day.day_id === 'FINAL_EXAM') {
      if (dayHeading) dayHeading.textContent = "Final Exam & Question Banks Vault";
      if (dayOverview) dayOverview.textContent = "8 Comprehensive Exam Question Banks, OOP MCQs and Unit Revision Guides.";
      if (dayAdvanceCard) dayAdvanceCard.style.display = 'none';
      if (btnPrevDay) btnPrevDay.style.display = 'none';
      if (btnNextDay) btnNextDay.style.display = 'none';
    } else {
      const firstVid = day.items.find(i => i.type === 'video') || day.items[0];
      const preview = firstVid ? firstVid.clean_title : day.folder_name;
      if (dayHeading) dayHeading.textContent = `${day.day_id} • ${preview}`;
      if (dayOverview) dayOverview.textContent = `${day.phase_badge} — Directly indexed from D:\\AI-ML Prime Course\\${day.folder_name}`;
      
      // Update Adjacent Day Buttons
      const prevDay = getAdjacentDay('prev');
      const nextDay = getAdjacentDay('next');

      if (btnPrevDay) {
        btnPrevDay.style.display = prevDay ? 'inline-block' : 'none';
        btnPrevDay.textContent = prevDay ? `◀ ${prevDay.day_id}` : '';
        btnPrevDay.onclick = () => prevDay && selectDay(prevDay.day_id);
      }

      if (btnNextDay) {
        btnNextDay.style.display = nextDay ? 'inline-block' : 'none';
        btnNextDay.textContent = nextDay ? `${nextDay.day_id} ▶` : '';
        btnNextDay.onclick = () => nextDay && selectDay(nextDay.day_id);
      }

      // Bottom Advance Card (SAFELY UPDATING EXISTING CONST ELEMENTS)
      if (nextDay && dayAdvanceCard) {
        dayAdvanceCard.style.display = 'block';
        const nextFirstVid = nextDay.items.find(i => i.type === 'video') || nextDay.items[0];
        if (advanceNextTitle) {
          advanceNextTitle.textContent = `${nextDay.day_id} • ${nextFirstVid ? nextFirstVid.clean_title : nextDay.phase_badge}`;
        }
        if (advanceNextMeta) {
          advanceNextMeta.textContent = `${nextDay.items.length} Lessons • ${nextDay.total_duration || '~45m'}`;
        }
        if (btnAdvanceNextDay) {
          btnAdvanceNextDay.onclick = () => selectDay(nextDay.day_id);
        }
      } else if (dayAdvanceCard) {
        dayAdvanceCard.style.display = 'none';
      }
    }

    // Day Notes
    const dayNote = progress.notes && progress.notes[day.day_id];
    if (dayNotesInput) dayNotesInput.value = (dayNote && dayNote.content) ? dayNote.content : '';
    if (notesActiveTag) notesActiveTag.textContent = (dayNote && dayNote.content) ? 'Has Notes' : '';
    if (notesStatusMsg) notesStatusMsg.textContent = dayNote ? `Last saved: ${formatTimestamp(dayNote.updated_at)}` : 'Auto-saves on typing';

    // Sync Apna College Embedded Classroom Stage
    const dayVideos = day.items.filter(i => i.type === 'video');
    if (dayVideos.length > 0) {
      if (classroomStage) classroomStage.style.display = 'block';
      const belongsToDay = currentPlayingItem && day.items.some(i => i.id === currentPlayingItem.id);
      if (!belongsToDay) {
        const firstUncompleted = dayVideos.find(v => !completedMap[v.id]) || dayVideos[0];
        stageLecture(firstUncompleted, day, false);
      } else {
        updateStageCompleteBtn(currentPlayingItem.id);
        updateStageStarBtn(currentPlayingItem.id);
      }
    } else {
      if (classroomStage) classroomStage.style.display = 'none';
    }

    renderLessonsStack(day);
  }

  function renderLessonsStack(day) {
    if (!lessonsCardsStack) return;
    lessonsCardsStack.innerHTML = '';
    const completedMap = progress.completed_items || {};
    const starredMap = progress.starred_items || {};

    let list = day.items;

    // Filter Type
    if (activeFilterType !== 'all') {
      if (activeFilterType === 'starred') {
        list = list.filter(i => starredMap[i.id]);
      } else {
        list = list.filter(i => i.type === activeFilterType);
      }
    }

    // Local Search Query
    if (activeSearchFilter) {
      list = list.filter(i =>
        i.clean_title.toLowerCase().includes(activeSearchFilter) ||
        i.raw_name.toLowerCase().includes(activeSearchFilter)
      );
    }

    if (list.length === 0) {
      lessonsCardsStack.innerHTML = `<div class="empty-hint">No lessons match the selected filter.</div>`;
      return;
    }

    list.forEach((item, idx) => {
      const isCompleted = !!completedMap[item.id];
      const isStarred = !!starredMap[item.id];

      const card = document.createElement('div');
      card.className = `lecture-card ${isCompleted ? 'done' : ''}`;
      card.dataset.itemId = item.id;

      const numLabel = item.lecture_num !== null ? `#${String(item.lecture_num).padStart(2, '0')}` : `#${idx + 1}`;

      let typeBadgeClass = 'video';
      let typeLabel = '4K Master Video';
      if (item.type === 'notebook') {
        typeBadgeClass = 'notebook';
        typeLabel = 'Jupyter Lab';
      } else if (item.type === 'pdf') {
        typeBadgeClass = 'pdf';
        typeLabel = 'Exam Guide';
      } else if (item.type === 'dataset') {
        typeBadgeClass = 'dataset';
        typeLabel = 'Dataset';
      } else if (item.type === 'code') {
        typeBadgeClass = 'code';
        typeLabel = 'Code Repo';
      }

      const durText = item.duration ? `⏱️ ${item.duration}` : `${item.size_mb} MB`;

      // Check for saved playback position to show real LMS resume bar
      const playback = progress.playback_positions && progress.playback_positions[item.id];
      let resumeSnippet = '';
      if (playback && playback.current_time > 15 && playback.duration > 0) {
        const resumePct = Math.min(100, Math.round((playback.current_time / playback.duration) * 100));
        resumeSnippet = `
          <div class="card-resume-strip" title="Resume from last playback session">
            <div class="card-resume-track">
              <div class="card-resume-fill" style="width: ${resumePct}%"></div>
            </div>
            <span class="card-resume-caption">Resume at ${formatSeconds(playback.current_time)} (${resumePct}%)</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="card-left-group">
          <label class="luxury-checkbox" title="${isCompleted ? 'Mark uncompleted' : 'Mark completed'}">
            <input type="checkbox" ${isCompleted ? 'checked' : ''}>
            <span class="luxury-check-marker">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </label>

          <div class="lecture-seq-pill ${typeBadgeClass}">${numLabel}</div>

          <div class="lecture-text-col">
            <div class="lecture-title-row">
              <span class="lecture-name">${item.clean_title}</span>
            </div>
            <div class="lecture-tags-row">
              <span class="format-badge ${typeBadgeClass}">${typeLabel}</span>
              ${item.duration ? `<span class="badge-duration">${item.duration}</span>` : ''}
              <span class="badge-filesize">${item.size_mb} MB</span>
              <span class="badge-res">HD 1080p</span>
            </div>
            ${resumeSnippet}
          </div>
        </div>

        <div class="card-actions-group">
          <button class="btn-star-mark ${isStarred ? 'active' : ''}" title="Flag for Starred Exam Revision">
            <span class="star-icon">★</span>
            <span class="star-text">Revision</span>
          </button>

          ${item.type === 'video' ? `
            <button class="btn-watch-primary" title="Watch directly in theater player">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Watch</span>
            </button>
          ` : ''}

          <button class="btn-card-tool open-vlc" title="Launch with Laptop Player (VLC / MPC / VS Code)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Launch</span>
          </button>

          <button class="btn-card-tool show-file" title="Show file in Windows Explorer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Folder</span>
          </button>
        </div>
      `;

      const chk = card.querySelector('input[type="checkbox"]');
      chk.addEventListener('change', () => {
        handleToggleItem(item.id, chk.checked, card);
      });

      const starBtn = card.querySelector('.btn-star-mark');
      starBtn.addEventListener('click', () => {
        handleToggleStar(item.id, starBtn);
      });

      const watchBtn = card.querySelector('.btn-watch-primary');
      if (watchBtn) {
        watchBtn.addEventListener('click', () => {
          openVideo(item, day);
        });
      }

      card.querySelector('.open-vlc').addEventListener('click', () => {
        openLaptopApp(item.full_path);
      });

      card.querySelector('.show-file').addEventListener('click', () => {
        revealExplorer(item.full_path);
      });

      lessonsCardsStack.appendChild(card);
    });

    if (currentPlayingItem) {
      highlightActiveLectureCard(currentPlayingItem.id);
    }
  }

  // -------------------------------------------------------------
  // Lesson Actions (Complete, Star, Launch, Reveal)
  // -------------------------------------------------------------
  async function handleToggleItem(itemId, isDone, cardElem) {
    if (cardElem) {
      if (isDone) cardElem.classList.add('done');
      else cardElem.classList.remove('done');
      const chk = cardElem.querySelector('input[type="checkbox"]');
      if (chk) chk.checked = isDone;
    }

    if (isDone) {
      if (!progress.completed_items) progress.completed_items = {};
      progress.completed_items[itemId] = { completed: true, completed_at: new Date().toISOString() };
      const todayStr = new Date().toISOString().split('T')[0];
      if (!progress.study_log) progress.study_log = {};
      if (!progress.study_log[todayStr]) progress.study_log[todayStr] = { items_completed: 0, minutes: 0 };
      progress.study_log[todayStr].items_completed += 1;
    } else {
      if (progress.completed_items) delete progress.completed_items[itemId];
      const todayStr = new Date().toISOString().split('T')[0];
      if (progress.study_log && progress.study_log[todayStr] && progress.study_log[todayStr].items_completed > 0) {
        progress.study_log[todayStr].items_completed -= 1;
      }
    }

    // Keep stage mark complete button in sync if this item is currently on stage
    if (currentPlayingItem && currentPlayingItem.id === itemId) {
      updateStageCompleteBtn(itemId);
    }

    persistLocalProgress();
    updateTopMetrics();
    updateResumeBanner();
    updateDayProgressQuick();
    updateSidebarPillForDay(activeDayId);

    try {
      const res = await fetch('/api/progress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, completed: isDone })
      }).then(r => r.json());

      if (res.success && isDone) {
        if (res.today_log && res.today_log.items_completed === progress.daily_target) {
          toast(`🎯 Target Completed! ${progress.daily_target} lessons finished today!`, 'success');
        }
      }
    } catch (err) {
      // In offline / static mode, local storage is already updated
    }
  }

  function updateDayProgressQuick() {
    const day = catalog.days.find(d => d.day_id === activeDayId);
    if (!day) return;
    const completedMap = progress.completed_items || {};
    const total = day.items.length;
    const done = day.items.filter(i => completedMap[i.id]).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    if (dayPctLabel) dayPctLabel.textContent = `${pct}%`;
    if (dayCountLabel) dayCountLabel.textContent = `${done} / ${total} Completed`;
    if (dayProgFill) dayProgFill.style.width = `${pct}%`;

    const allDone = total > 0 && done === total;
    if (btnToggleDayText) {
      btnToggleDayText.textContent = allDone ? 'Reset Day Progress' : 'Mark All Completed';
    }
  }

  function updateSidebarPillForDay(dayId) {
    if (!catalog || !catalog.days) return;
    const day = catalog.days.find(d => d.day_id === dayId);
    if (!day) return;
    const completedMap = progress.completed_items || {};
    const total = day.items.length;
    const done = day.items.filter(it => completedMap[it.id]).length;
    const isDone = total > 0 && done === total;
    const isPart = done > 0 && !isDone;

    const cards = document.querySelectorAll(`.sidebar-day-card[data-day-id="${dayId}"]`);
    cards.forEach(card => {
      const statusIcon = card.querySelector('.s-status-icon');
      if (statusIcon) statusIcon.textContent = isDone ? '🟢' : isPart ? '🟡' : '⚪';
      const badgeCnt = card.querySelector('.s-day-badge-cnt');
      if (badgeCnt) badgeCnt.textContent = `${done}/${total}`;
    });
  }

  async function handleToggleStar(itemId, btnElem) {
    const currentState = btnElem ? btnElem.classList.contains('active') : !!(progress.starred_items && progress.starred_items[itemId]);
    const newState = !currentState;
    if (btnElem) btnElem.classList.toggle('active', newState);

    if (newState) {
      if (!progress.starred_items) progress.starred_items = {};
      progress.starred_items[itemId] = true;
      toast('Saved to Starred Revision Bank ⭐', 'success');
    } else {
      if (progress.starred_items) delete progress.starred_items[itemId];
    }

    if (currentPlayingItem && currentPlayingItem.id === itemId) {
      updateStageStarBtn(itemId);
    }

    persistLocalProgress();
    // Refresh starred count in header & active day
    updateTopMetrics();
    const day = catalog.days.find(d => d.day_id === activeDayId);
    if (day && countStarred) {
      countStarred.textContent = day.items.filter(i => progress.starred_items && progress.starred_items[i.id]).length;
    }

    fetch('/api/progress/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId })
    }).catch(() => {});
  }

  async function batchToggleActiveDay() {
    const day = catalog.days.find(d => d.day_id === activeDayId);
    if (!day) return;

    const completedMap = progress.completed_items || {};
    const total = day.items.length;
    const done = day.items.filter(i => completedMap[i.id]).length;
    const markAs = done !== total;
    const nowIso = new Date().toISOString();

    day.items.forEach(it => {
      if (markAs) progress.completed_items[it.id] = { completed: true, completed_at: nowIso };
      else delete progress.completed_items[it.id];
    });

    persistLocalProgress();
    renderActiveDay();
    updateSidebarPillForDay(activeDayId);
    updateResumeBanner();
    updateTopMetrics();
    toast(markAs ? `Day marked completed!` : `Day reset!`, 'success');

    try {
      await fetch('/api/progress/batch-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_id: day.day_id, mark_as: markAs })
      });
    } catch (err) {
      // In static / offline mode, local update is already saved
    }
  }

  async function openLaptopApp(filePath) {
    if (isStaticMode) {
      toast('💻 Launch on Laptop: Available when backend is running via Start_Tracker.bat', 'info');
      return;
    }
    toast('Opening on laptop...', 'info');
    try {
      const res = await fetch('/api/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath })
      }).then(r => r.json());

      if (res.error) toast(`Open failed: ${res.error}`, 'error');
    } catch (err) {
      toast('💻 Run Start_Tracker.bat on your laptop to open local files.', 'info');
    }
  }

  async function revealExplorer(filePath) {
    if (isStaticMode) {
      toast('📁 Locate File: Available when running locally on Windows laptop.', 'info');
      return;
    }
    toast('Locating in Windows Explorer...', 'info');
    fetch('/api/reveal-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: filePath })
    }).catch(() => {});
  }

  // -------------------------------------------------------------
  // Apna College Classroom Stage & Video Engine
  // -------------------------------------------------------------
  function stageLecture(item, day, autoPlay = true) {
    if (!item) return;
    currentPlayingItem = item;
    progress.last_active = { day_id: day.day_id, item_id: item.id };
    persistLocalProgress();

    if (stageDayBadge) stageDayBadge.textContent = day.day_id;
    if (stageLectureTitle) stageLectureTitle.textContent = item.clean_title;
    if (stageDurationTag) {
      stageDurationTag.textContent = item.duration ? `⏱️ ${item.duration}` : `${item.size_mb} MB`;
    }

    // Update Stage Buttons
    updateStageCompleteBtn(item.id);
    updateStageStarBtn(item.id);

    if (item.is_mkv) {
      toast('MKV video container detected. Launching in VLC / Windows player is recommended if browser codec is limited.', 'info');
    }

    const staticOverlay = document.getElementById('stage-static-overlay');
    const staticOverlayTitle = document.getElementById('stage-static-overlay-lecture-title');
    const staticFilePath = document.getElementById('static-file-path');

    if (isStaticMode) {
      if (staticOverlay) {
        staticOverlay.style.display = 'flex';
        if (staticOverlayTitle) staticOverlayTitle.textContent = item.clean_title;
        if (staticFilePath) staticFilePath.textContent = item.full_path;
      }
    } else {
      if (staticOverlay) staticOverlay.style.display = 'none';
    }

    if (stageVideo) {
      const streamUrl = `/api/stream?path=${encodeURIComponent(item.full_path)}`;
      if (!stageVideo.src.includes(encodeURIComponent(item.full_path))) {
        stageVideo.src = streamUrl;
      }

      // Resume saved playback position
      const savedPos = progress.playback_positions && progress.playback_positions[item.id];
      if (savedPos && savedPos.current_time > 10 && (savedPos.duration - savedPos.current_time) > 15) {
        stageVideo.currentTime = savedPos.current_time;
        toast(`Resuming from ${formatSeconds(savedPos.current_time)}`, 'info');
      }

      stageVideo.onerror = () => {
        if (staticOverlay) {
          staticOverlay.style.display = 'flex';
          if (staticOverlayTitle) staticOverlayTitle.textContent = item.clean_title;
          if (staticFilePath) staticFilePath.textContent = item.full_path;
        }
      };

      stageVideo.onplaying = () => {
        if (staticOverlay) staticOverlay.style.display = 'none';
      };

      if (autoPlay && !isStaticMode) {
        stageVideo.play().catch(() => {});
      }

      highlightActiveLectureCard(item.id);

      clearInterval(videoTimeUpdateTimer);
      videoTimeUpdateTimer = setInterval(() => {
        if (!stageVideo.paused && stageVideo.currentTime > 0) {
          savePlaybackPosition(item.id, stageVideo.currentTime, stageVideo.duration);
        }
      }, 4000);

      stageVideo.onended = () => {
        handleStageVideoEnded();
      };
    }
  }

  function openVideo(item, day, autoPlay = true) {
    stageLecture(item, day, autoPlay);
    if (classroomStage) {
      classroomStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function closeVideo() {
    clearInterval(videoTimeUpdateTimer);
    if (stageVideo) {
      if (currentPlayingItem && stageVideo.currentTime > 0) {
        savePlaybackPosition(currentPlayingItem.id, stageVideo.currentTime, stageVideo.duration);
      }
      stageVideo.pause();
    }
    if (theaterVideo) {
      theaterVideo.pause();
      theaterVideo.removeAttribute('src');
      if (videoTheater) videoTheater.style.display = 'none';
    }
  }

  function savePlaybackPosition(itemId, curr, dur) {
    if (!progress.playback_positions) progress.playback_positions = {};
    progress.playback_positions[itemId] = { current_time: curr, duration: dur };
    persistLocalProgress();

    fetch('/api/progress/playback-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, current_time: curr, duration: dur })
    }).catch(() => {});
  }

  function updateStageCompleteBtn(itemId) {
    if (!btnStageMarkComplete) return;
    const isDone = !!(progress.completed_items && progress.completed_items[itemId]);
    if (isDone) {
      btnStageMarkComplete.classList.add('completed');
      if (stageMarkLabel) stageMarkLabel.textContent = '✓ Completed';
    } else {
      btnStageMarkComplete.classList.remove('completed');
      if (stageMarkLabel) stageMarkLabel.textContent = 'Mark as Completed';
    }
  }

  function toggleStageLectureComplete() {
    if (!currentPlayingItem) return;
    const itemId = currentPlayingItem.id;
    const wasDone = !!(progress.completed_items && progress.completed_items[itemId]);
    const newStatus = !wasDone;

    const cardElem = document.querySelector(`.lecture-card[data-item-id="${itemId}"]`);
    handleToggleItem(itemId, newStatus, cardElem);
    updateStageCompleteBtn(itemId);

    if (newStatus) {
      toast(`✓ Lecture Completed: "${currentPlayingItem.clean_title}"`, 'success');
    } else {
      toast(`Marked uncompleted: "${currentPlayingItem.clean_title}"`, 'info');
    }
  }

  function updateStageStarBtn(itemId) {
    if (!stageBtnStar) return;
    const isStarred = !!(progress.starred_items && progress.starred_items[itemId]);
    stageBtnStar.classList.toggle('active', isStarred);
  }

  function toggleStageLectureStar() {
    if (!currentPlayingItem) return;
    const itemId = currentPlayingItem.id;
    const cardElem = document.querySelector(`.lecture-card[data-item-id="${itemId}"]`);
    const starBtnInCard = cardElem ? cardElem.querySelector('.btn-star-mark') : null;
    handleToggleStar(itemId, starBtnInCard);
    updateStageStarBtn(itemId);
  }

  function stageNavigateLecture(direction) {
    if (!catalog || !catalog.days) return;
    const day = catalog.days.find(d => d.day_id === activeDayId);
    if (!day) return;
    const videos = day.items.filter(i => i.type === 'video');
    if (!videos.length) return;

    let idx = -1;
    if (currentPlayingItem) {
      idx = videos.findIndex(v => v.id === currentPlayingItem.id);
    }

    if (direction === 'next') {
      if (idx >= 0 && idx < videos.length - 1) {
        const nextVid = videos[idx + 1];
        stageLecture(nextVid, day, true);
        toast(`Playing Next: ${nextVid.clean_title}`, 'info');
      } else {
        const nextDay = getAdjacentDay('next');
        if (nextDay) {
          toast(`Advancing to ${nextDay.day_id}... 🔥`, 'success');
          selectDay(nextDay.day_id);
          const firstVid = nextDay.items.find(i => i.type === 'video') || nextDay.items[0];
          if (firstVid) stageLecture(firstVid, nextDay, true);
        } else {
          toast('You completed the entire course curriculum! Outstanding! 🏆', 'success');
        }
      }
    } else if (direction === 'prev') {
      if (idx > 0) {
        const prevVid = videos[idx - 1];
        stageLecture(prevVid, day, true);
        toast(`Playing: ${prevVid.clean_title}`, 'info');
      } else {
        const prevDay = getAdjacentDay('prev');
        if (prevDay) {
          selectDay(prevDay.day_id);
          const prevVids = prevDay.items.filter(i => i.type === 'video');
          const lastVid = prevVids.length ? prevVids[prevVids.length - 1] : prevDay.items[prevDay.items.length - 1];
          if (lastVid) stageLecture(lastVid, prevDay, true);
        }
      }
    }
  }

  function handleStageVideoEnded() {
    if (!currentPlayingItem) return;
    const itemId = currentPlayingItem.id;
    if (!progress.completed_items[itemId]) {
      const cardElem = document.querySelector(`.lecture-card[data-item-id="${itemId}"]`);
      handleToggleItem(itemId, true, cardElem);
      updateStageCompleteBtn(itemId);
      toast('Lecture finished! Marked completed 🎉', 'success');
    }
    // Seamlessly cue next lecture after 1.5 seconds
    setTimeout(() => {
      stageNavigateLecture('next');
    }, 1500);
  }

  function highlightActiveLectureCard(itemId) {
    if (!itemId) return;
    document.querySelectorAll('.lecture-card').forEach(c => {
      if (c.dataset.itemId === itemId) {
        c.classList.add('currently-playing');
      } else {
        c.classList.remove('currently-playing');
      }
    });
  }

  function playNextLectureInQueue() {
    stageNavigateLecture('next');
  }

  // -------------------------------------------------------------
  // Focus Studio & Study Engine
  // -------------------------------------------------------------
  function playStudyChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // Executive dual-tone bell chime: D5 (587.33Hz) -> A5 (880Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    } catch (e) {}
  }

  function adjustPomoMinutes(deltaMins) {
    const deltaSecs = deltaMins * 60;
    pomoRemaining = Math.max(60, pomoRemaining + deltaSecs);
    pomoDuration = Math.max(60, pomoDuration + deltaSecs);
    pomoModeMins = Math.max(1, Math.round(pomoDuration / 60));
    renderPomoDisplay();
    toast(`⏱️ Timer ${deltaMins > 0 ? '+' : ''}${deltaMins}m adjusted (${Math.round(pomoRemaining / 60)}m left)`, 'info');
  }

  function setCustomPomoDuration(mins) {
    mins = Math.max(1, Math.min(360, parseInt(mins, 10) || 25));
    pomoModeMins = mins;
    pomoDuration = mins * 60;
    pomoRemaining = pomoDuration;
    renderPomoDisplay();

    // Update preset button highlights
    pomoModes.forEach(btn => {
      const bMins = parseInt(btn.dataset.mins, 10);
      btn.classList.toggle('active', bMins === mins);
    });

    if (btnCustomTime) {
      const isStandard = [15, 25, 45, 60, 90].includes(mins);
      btnCustomTime.classList.toggle('active', !isStandard);
      btnCustomTime.textContent = !isStandard ? `${mins}m` : '⏱️ Custom';
    }

    toast(`Focus session configured to ${mins} minutes! 🚀`, 'success');
  }

  function startPomo() {
    if (pomoRunning) return;
    pomoRunning = true;
    if (pomoToggleBtn) {
      pomoToggleBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
    }

    pomoTimerId = setInterval(() => {
      pomoRemaining--;
      renderPomoDisplay();

      if (pomoRemaining <= 0) {
        clearInterval(pomoTimerId);
        pomoRunning = false;
        if (pomoToggleBtn) {
          pomoToggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        }
        finishPomo();
      }
    }, 1000);
  }

  function pausePomo() {
    if (!pomoRunning) return;
    clearInterval(pomoTimerId);
    pomoRunning = false;
    if (pomoToggleBtn) {
      pomoToggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
  }

  function resetPomo() {
    pausePomo();
    pomoRemaining = pomoDuration;
    renderPomoDisplay();
  }

  function renderPomoDisplay() {
    if (!pomoTimer) return;
    const m = Math.floor(pomoRemaining / 60);
    const s = pomoRemaining % 60;
    pomoTimer.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  async function finishPomo() {
    playStudyChime();
    toast(`🏆 Focus session finished! Logged ${pomoModeMins}m study momentum, Kazi Anas.`, 'success');
    const todayStr = new Date().toISOString().split('T')[0];
    if (!progress.study_log) progress.study_log = {};
    if (!progress.study_log[todayStr]) progress.study_log[todayStr] = { items_completed: 0, minutes: 0 };
    progress.study_log[todayStr].minutes = (progress.study_log[todayStr].minutes || 0) + pomoModeMins;
    if (!progress.pomodoro_history) progress.pomodoro_history = [];
    progress.pomodoro_history.unshift({
      date: todayStr,
      minutes: pomoModeMins,
      day_id: activeDayId,
      timestamp: new Date().toISOString()
    });
    persistLocalProgress();
    updateTopMetrics();

    try {
      await fetch('/api/progress/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: pomoModeMins, day_id: activeDayId })
      });
      const updated = await fetch('/api/progress').then(r => r.json());
      if (updated) {
        progress = updated;
        persistLocalProgress();
        updateTopMetrics();
      }
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // Global Search Modal (Ctrl + K)
  // -------------------------------------------------------------
  function searchEverywhere(term) {
    if (!catalog || !catalog.days || !searchModalResults) return;
    term = term.trim().toLowerCase();

    if (!term) {
      searchModalResults.innerHTML = `<div class="empty-hint">Type keywords to search across all 62 Days and 818+ lessons...</div>`;
      return;
    }

    const matches = [];
    catalog.days.forEach(day => {
      day.items.forEach(it => {
        if (it.clean_title.toLowerCase().includes(term) || it.raw_name.toLowerCase().includes(term)) {
          matches.push({ day, item: it });
        }
      });
    });

    if (matches.length === 0) {
      searchModalResults.innerHTML = `<div class="empty-hint">No lessons found matching "${term}"</div>`;
      return;
    }

    searchModalResults.innerHTML = '';
    matches.slice(0, 40).forEach(({ day, item }) => {
      const isDone = !!(progress.completed_items && progress.completed_items[item.id]);

      const row = document.createElement('div');
      row.className = 'search-hit-item';
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${item.type === 'video' ? '📹' : item.type === 'notebook' ? '📓' : '📑'}</span>
          <span class="hit-title ${isDone ? 'done-text' : ''}">${item.clean_title}</span>
        </div>
        <span class="hit-sub">${day.day_id} • ${item.duration || item.ext}</span>
      `;

      row.addEventListener('click', () => {
        searchModal.style.display = 'none';
        selectDay(day.day_id);
        if (item.type === 'video') openVideo(item, day);
      });

      searchModalResults.appendChild(row);
    });
  }

  // -------------------------------------------------------------
  // Starred Revision Modal
  // -------------------------------------------------------------
  function renderStarredModal() {
    if (!catalog || !catalog.days || !starredItemsBox) return;
    const starredMap = progress.starred_items || {};
    const keys = Object.keys(starredMap);

    if (keys.length === 0) {
      starredItemsBox.innerHTML = `<div class="empty-hint">No starred lessons yet. Click the ⭐ button on any lesson card to review it here before exams and interviews.</div>`;
      return;
    }

    starredItemsBox.innerHTML = '';
    catalog.days.forEach(day => {
      const starred = day.items.filter(i => starredMap[i.id]);
      starred.forEach(it => {
        const div = document.createElement('div');
        div.className = 'search-hit-item';
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>⭐</span>
            <span class="hit-title">${it.clean_title}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="hit-sub">${day.day_id} • ${it.duration || it.ext}</span>
            <button class="btn-card-tool" style="padding: 2px 8px;">Open</button>
          </div>
        `;
        div.addEventListener('click', () => {
          starredModal.style.display = 'none';
          selectDay(day.day_id);
          if (it.type === 'video') openVideo(it, day);
        });
        starredItemsBox.appendChild(div);
      });
    });
  }

  // -------------------------------------------------------------
  // Roadmap & Analytics Modal
  // -------------------------------------------------------------
  function renderRoadmapModal() {
    if (!catalog || !catalog.phases || !roadmapPhasesGrid) return;

    const completedMap = progress.completed_items || {};
    let totalDone = 0;
    let daysDone = 0;

    catalog.days.forEach(d => {
      let dDone = 0;
      d.items.forEach(it => {
        if (completedMap[it.id]) {
          totalDone++;
          dDone++;
        }
      });
      if (d.items.length > 0 && dDone === d.items.length && d.day_id !== 'FINAL_EXAM') daysDone++;
    });

    if (kpiVideosDone) kpiVideosDone.textContent = `${totalDone} / ${catalog.total_videos || 818}`;
    if (kpiDaysDone) kpiDaysDone.textContent = `${daysDone} / 62`;
    if (kpiHoursTotal) kpiHoursTotal.textContent = `${catalog.total_hours || 117.1}h`;

    const rem = Math.max(0, (catalog.total_videos || 818) - totalDone);
    const pace = progress.daily_target || 5;
    const daysLeft = Math.ceil(rem / pace);
    const projDate = new Date();
    projDate.setDate(projDate.getDate() + daysLeft);
    if (kpiEstimatedDate) {
      kpiEstimatedDate.textContent = projDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    roadmapPhasesGrid.innerHTML = '';
    catalog.phases.forEach(ph => {
      const daysInPhase = catalog.days.filter(d => ph.days.includes(d.day_id));
      let pTotal = 0;
      let pDone = 0;
      daysInPhase.forEach(d => {
        pTotal += d.items.length;
        d.items.forEach(i => {
          if (completedMap[i.id]) pDone++;
        });
      });
      const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'phase-prog-box';
      card.innerHTML = `
        <div class="prog-box-top">
          <span class="prog-box-title">${ph.badge} (${ph.days.length} Days)</span>
          <span class="prog-box-pct">${pPct}%</span>
        </div>
        <div class="prog-box-track">
          <div class="prog-box-fill" style="width: ${pPct}%; background: ${ph.color};"></div>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">${pDone} of ${pTotal} lessons completed</span>
      `;
      roadmapPhasesGrid.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------
  function bindEvents() {
    if (tabViewDays) {
      tabViewDays.addEventListener('click', () => {
        sidebarMode = 'days';
        tabViewDays.classList.add('active');
        if (tabViewPhases) tabViewPhases.classList.remove('active');
        renderSidebar();
      });
    }

    if (tabViewPhases) {
      tabViewPhases.addEventListener('click', () => {
        sidebarMode = 'phases';
        tabViewPhases.classList.add('active');
        if (tabViewDays) tabViewDays.classList.remove('active');
        renderSidebar();
      });
    }

    if (sidebarSearchBox) {
      sidebarSearchBox.addEventListener('input', renderSidebar);
    }

    if (sidebarExamVaultBtn) {
      sidebarExamVaultBtn.addEventListener('click', () => {
        selectDay('FINAL_EXAM');
      });
    }

    if (notesBarToggle && notesContentArea && notesArrow) {
      notesBarToggle.addEventListener('click', () => {
        const isHidden = notesContentArea.style.display === 'none';
        notesContentArea.style.display = isHidden ? 'flex' : 'none';
        notesArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }

    quickTagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.insert;
        if (dayNotesInput) {
          dayNotesInput.value += (dayNotesInput.value ? '\n' : '') + tag;
          dayNotesInput.focus();
          saveDayNotes();
        }
      });
    });

    if (dayNotesInput) {
      dayNotesInput.addEventListener('input', () => {
        clearTimeout(noteDebounceTimer);
        if (notesStatusMsg) notesStatusMsg.textContent = 'Saving...';
        noteDebounceTimer = setTimeout(saveDayNotes, 800);
      });
    }

    if (btnSaveNote) {
      btnSaveNote.addEventListener('click', saveDayNotes);
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilterType = pill.dataset.type;
        const day = catalog.days.find(d => d.day_id === activeDayId);
        if (day) renderLessonsStack(day);
      });
    });

    if (lessonLocalSearch) {
      lessonLocalSearch.addEventListener('input', (e) => {
        activeSearchFilter = e.target.value.trim().toLowerCase();
        const day = catalog.days.find(d => d.day_id === activeDayId);
        if (day) renderLessonsStack(day);
      });
    }

    if (btnToggleDayComplete) {
      btnToggleDayComplete.addEventListener('click', batchToggleActiveDay);
    }

    if (btnOpenDayFolder) {
      btnOpenDayFolder.addEventListener('click', () => {
        if (isStaticMode) {
          toast(`📁 Local folder access is available when running locally on your laptop.`, 'info');
          return;
        }
        fetch('/api/open-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day_id: activeDayId })
        }).catch(() => {});
        toast(`Opening folder for ${activeDayId}...`, 'info');
      });
    }

    if (btnOpenFolder) {
      btnOpenFolder.addEventListener('click', () => {
        if (isStaticMode) {
          toast('📁 Local folder access is available when running locally on your laptop.', 'info');
          return;
        }
        fetch('/api/open-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day_id: '' })
        }).catch(() => {});
        toast('Opening D:\\AI-ML Prime Course...', 'info');
      });
    }

    if (pomoToggleBtn) {
      pomoToggleBtn.addEventListener('click', () => {
        if (pomoRunning) pausePomo();
        else startPomo();
      });
    }

    if (pomoResetBtn) {
      pomoResetBtn.addEventListener('click', resetPomo);
    }

    if (btnTimeMinus5) {
      btnTimeMinus5.addEventListener('click', () => adjustPomoMinutes(-5));
    }

    if (btnTimePlus5) {
      btnTimePlus5.addEventListener('click', () => adjustPomoMinutes(5));
    }

    const btnToggleFocusDropdown = document.getElementById('btn-toggle-focus-dropdown');
    const focusDropdownPopover = document.getElementById('focus-dropdown-popover');
    if (btnToggleFocusDropdown && focusDropdownPopover) {
      btnToggleFocusDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = focusDropdownPopover.style.display !== 'none';
        focusDropdownPopover.style.display = isShown ? 'none' : 'block';
      });
      document.addEventListener('click', (e) => {
        if (!focusDropdownPopover.contains(e.target) && e.target !== btnToggleFocusDropdown) {
          focusDropdownPopover.style.display = 'none';
        }
      });
    }

    const btnHeaderProgress = document.getElementById('btn-header-progress');
    if (btnHeaderProgress) {
      btnHeaderProgress.addEventListener('click', () => {
        renderRoadmapModal();
        if (roadmapModal) roadmapModal.style.display = 'flex';
      });
    }

    pomoModes.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.dataset.mins, 10);
        if (mins) {
          setCustomPomoDuration(mins);
          resetPomo();
          if (focusDropdownPopover) focusDropdownPopover.style.display = 'none';
        }
      });
    });

    const openCustomTimeDialog = () => {
      if (focusDropdownPopover) focusDropdownPopover.style.display = 'none';
      if (customTimeModal) {
        customTimeModal.style.display = 'flex';
        if (inputCustomMinutes) inputCustomMinutes.value = pomoModeMins;
      }
    };

    if (btnCustomTime) btnCustomTime.addEventListener('click', openCustomTimeDialog);
    if (pomoTimer) pomoTimer.addEventListener('click', openCustomTimeDialog);

    if (btnStepMinus10) {
      btnStepMinus10.addEventListener('click', () => {
        if (inputCustomMinutes) inputCustomMinutes.value = Math.max(1, (parseInt(inputCustomMinutes.value, 10) || 25) - 10);
      });
    }
    if (btnStepMinus5) {
      btnStepMinus5.addEventListener('click', () => {
        if (inputCustomMinutes) inputCustomMinutes.value = Math.max(1, (parseInt(inputCustomMinutes.value, 10) || 25) - 5);
      });
    }
    if (btnStepPlus5) {
      btnStepPlus5.addEventListener('click', () => {
        if (inputCustomMinutes) inputCustomMinutes.value = Math.min(360, (parseInt(inputCustomMinutes.value, 10) || 25) + 5);
      });
    }
    if (btnStepPlus10) {
      btnStepPlus10.addEventListener('click', () => {
        if (inputCustomMinutes) inputCustomMinutes.value = Math.min(360, (parseInt(inputCustomMinutes.value, 10) || 25) + 10);
      });
    }

    chipPresets.forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputCustomMinutes) inputCustomMinutes.value = chip.dataset.min;
      });
    });

    if (btnApplyCustomTime) {
      btnApplyCustomTime.addEventListener('click', () => {
        const mins = parseInt(inputCustomMinutes.value, 10) || 25;
        setCustomPomoDuration(mins);
        resetPomo();
        if (customTimeModal) customTimeModal.style.display = 'none';
      });
    }
    if (btnCancelCustomTime) {
      btnCancelCustomTime.addEventListener('click', () => {
        if (customTimeModal) customTimeModal.style.display = 'none';
      });
    }
    if (customTimeCloseBtn) {
      customTimeCloseBtn.addEventListener('click', () => {
        if (customTimeModal) customTimeModal.style.display = 'none';
      });
    }

    // --- Apna College Classroom Stage Listeners ---
    stageSpeedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stageSpeedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (stageVideo) {
          stageVideo.playbackRate = parseFloat(btn.dataset.spd);
        }
      });
    });

    if (btnToggleTheaterExpand && classroomStage) {
      btnToggleTheaterExpand.addEventListener('click', () => {
        const isExp = classroomStage.classList.toggle('theater-expanded');
        btnToggleTheaterExpand.classList.toggle('active', isExp);
        const txt = btnToggleTheaterExpand.querySelector('span');
        if (txt) txt.textContent = isExp ? 'Exit Theater' : 'Theater';
        if (isExp) document.body.classList.add('theater-active');
        else document.body.classList.remove('theater-active');
      });
    }

    if (btnStageNextLecture) {
      btnStageNextLecture.addEventListener('click', () => stageNavigateLecture('next'));
    }
    if (btnStagePrevLecture) {
      btnStagePrevLecture.addEventListener('click', () => stageNavigateLecture('prev'));
    }
    if (btnStageMarkComplete) {
      btnStageMarkComplete.addEventListener('click', toggleStageLectureComplete);
    }
    if (stageBtnStar) {
      stageBtnStar.addEventListener('click', toggleStageLectureStar);
    }
    if (stageBtnVlc) {
      stageBtnVlc.addEventListener('click', () => {
        if (currentPlayingItem) openLaptopApp(currentPlayingItem.full_path);
      });
    }
    if (stageBtnFolder) {
      stageBtnFolder.addEventListener('click', () => {
        if (currentPlayingItem) revealExplorer(currentPlayingItem.full_path);
      });
    }

    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (theaterVideo) {
          theaterVideo.playbackRate = parseFloat(btn.dataset.spd);
        }
      });
    });

    if (theaterCloseBtn) theaterCloseBtn.addEventListener('click', closeVideo);
    if (theaterNextBtn) theaterNextBtn.addEventListener('click', playNextLectureInQueue);

    if (theaterVlcBtn) {
      theaterVlcBtn.addEventListener('click', () => {
        if (currentPlayingItem) openLaptopApp(currentPlayingItem.full_path);
      });
    }

    if (btnOpenSearch) {
      btnOpenSearch.addEventListener('click', () => {
        if (searchModal) {
          searchModal.style.display = 'flex';
          if (globalSearchField) globalSearchField.focus();
        }
      });
    }

    if (searchCloseBtn) searchCloseBtn.addEventListener('click', () => { if (searchModal) searchModal.style.display = 'none'; });
    if (globalSearchField) globalSearchField.addEventListener('input', (e) => searchEverywhere(e.target.value));

    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    if (btnToggleTheme) {
      btnToggleTheme.addEventListener('click', toggleTheme);
    }

    if (btnOpenStarred) {
      btnOpenStarred.addEventListener('click', () => {
        renderStarredModal();
        if (starredModal) starredModal.style.display = 'flex';
      });
    }
    if (starredCloseBtn) starredCloseBtn.addEventListener('click', () => { if (starredModal) starredModal.style.display = 'none'; });

    if (btnOpenRoadmap) {
      btnOpenRoadmap.addEventListener('click', () => {
        renderRoadmapModal();
        if (roadmapModal) roadmapModal.style.display = 'flex';
      });
    }
    if (roadmapCloseBtn) roadmapCloseBtn.addEventListener('click', () => { if (roadmapModal) roadmapModal.style.display = 'none'; });

    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        if (settingsModal) settingsModal.style.display = 'flex';
      });
    }
    if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', () => { if (settingsModal) settingsModal.style.display = 'none'; });

    if (btnSaveTarget) {
      btnSaveTarget.addEventListener('click', async () => {
        const val = parseInt(settingDailyTarget.value, 10) || 5;
        progress.daily_target = val;
        persistLocalProgress();
        updateTopMetrics();
        toast('Daily target saved!', 'success');

        try {
          await fetch('/api/progress/target', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ daily_target: val })
          });
        } catch (e) {}
      });
    }

    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', async () => {
        let exportPayload = null;
        try {
          exportPayload = await fetch('/api/backup/export').then(r => r.json());
        } catch (e) {
          exportPayload = {
            version: '2.0',
            exported_at: new Date().toISOString(),
            tracker_data: progress
          };
        }

        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Prime_AIML_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Backup JSON exported successfully!', 'success');
      });
    }

    if (btnTriggerImport) {
      btnTriggerImport.addEventListener('click', () => fileImportInput && fileImportInput.click());
    }

    if (fileImportInput) {
      fileImportInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          const payload = json.tracker_data ? json.tracker_data : json;
          progress = payload;
          persistLocalProgress();

          try {
            await fetch('/api/backup/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tracker_data: payload })
            });
          } catch (syncErr) {
            console.warn('Backend sync skipped (static mode)');
          }

          renderSidebar();
          renderActiveDay();
          updateResumeBanner();
          updateTopMetrics();
          if (settingsModal) settingsModal.style.display = 'none';
          toast('Progress restored successfully!', 'success');
        } catch (err) {
          toast('Invalid backup file JSON', 'error');
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModal) {
          searchModal.style.display = 'flex';
          if (globalSearchField) globalSearchField.focus();
        }
      }

      if (e.key === 'Escape') {
        if (classroomStage && classroomStage.classList.contains('theater-expanded')) {
          classroomStage.classList.remove('theater-expanded');
          if (btnToggleTheaterExpand) {
            btnToggleTheaterExpand.classList.remove('active');
            const txt = btnToggleTheaterExpand.querySelector('span');
            if (txt) txt.textContent = 'Theater';
          }
          document.body.classList.remove('theater-active');
        }
        if (videoTheater && videoTheater.style.display === 'flex') closeVideo();
        if (searchModal) searchModal.style.display = 'none';
        if (starredModal) starredModal.style.display = 'none';
        if (roadmapModal) roadmapModal.style.display = 'none';
        if (settingsModal) settingsModal.style.display = 'none';
        if (customTimeModal) customTimeModal.style.display = 'none';
      }

      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (classroomStage && classroomStage.classList.contains('theater-expanded') && e.key.toLowerCase() === 'f') {
          classroomStage.classList.remove('theater-expanded');
          if (btnToggleTheaterExpand) btnToggleTheaterExpand.classList.remove('active');
          document.body.classList.remove('theater-active');
        } else if (videoTheater && videoTheater.style.display === 'flex') {
          if (e.code === 'Space') {
            e.preventDefault();
            if (theaterVideo.paused) theaterVideo.play();
            else theaterVideo.pause();
          }
          if (e.key === 'ArrowRight') {
            theaterVideo.currentTime = Math.min(theaterVideo.duration, theaterVideo.currentTime + 5);
          }
          if (e.key === 'ArrowLeft') {
            theaterVideo.currentTime = Math.max(0, theaterVideo.currentTime - 5);
          }
          if (e.key.toLowerCase() === 'f') {
            if (document.fullscreenElement) document.exitFullscreen();
            else theaterVideo.requestFullscreen();
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  async function saveDayNotes() {
    if (!dayNotesInput) return;
    const content = dayNotesInput.value;
    if (!progress.notes) progress.notes = {};
    progress.notes[activeDayId] = { content, updated_at: new Date().toISOString() };
    persistLocalProgress();

    if (notesStatusMsg) notesStatusMsg.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
    if (notesActiveTag) notesActiveTag.textContent = content.trim() ? 'Has Notes' : '';

    try {
      await fetch('/api/progress/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeDayId, content })
      });
    } catch (e) {
      // LocalStorage already has the note saved
    }
  }

  function formatTimestamp(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function formatSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function toast(msg, type = 'info') {
    if (!toastShelf) return;
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.innerHTML = `<span>${msg}</span>`;
    toastShelf.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function initOfflineWatcher() {
    const badge = document.getElementById('offline-badge');
    const textEl = document.getElementById('offline-badge-text');

    function syncStatus() {
      const isOnline = navigator.onLine;
      if (badge && textEl) {
        if (isOnline) {
          badge.classList.remove('offline-mode');
          textEl.textContent = '100% Offline Ready';
          badge.title = 'App runs 100% offline — local video engine & offline cache active';
        } else {
          badge.classList.add('offline-mode');
          textEl.textContent = '⚡ Offline Mode Active';
          badge.title = 'Running without internet — all local videos & cached data active';
        }
      }
    }

    window.addEventListener('online', () => {
      syncStatus();
      toast('🌐 Network connected — 100% Local Playback Active', 'success');
    });

    window.addEventListener('offline', () => {
      syncStatus();
      toast('⚡ Offline Mode: 100% Local Video Playback Active', 'info');
    });

    syncStatus();

    // Register Service Worker for offline shell & asset caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('[SW] ServiceWorker registered with scope:', reg.scope);
      }).catch((err) => {
        console.log('[SW] ServiceWorker registration info:', err);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', startup);
})();
