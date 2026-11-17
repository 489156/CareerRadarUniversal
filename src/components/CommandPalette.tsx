import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, TabId } from '@/store/useAppStore';
import { calculateDynamicJobMatch, evaluateHardFilters } from '@/lib/matcher';
import { IconSearch, IconClose } from './Icons';

export function CommandPalette() {
  const isCommandOpen = useAppStore((s) => s.isCommandOpen);
  const setIsCommandOpen = useAppStore((s) => s.setIsCommandOpen);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setIsResumeModalOpen = useAppStore((s) => s.setIsResumeModalOpen);
  const setIsMarketValueModalOpen = useAppStore((s) => s.setIsMarketValueModalOpen);
  const setIsSkillGapModalOpen = useAppStore((s) => s.setIsSkillGapModalOpen);
  const setIsCrawlerModalOpen = useAppStore((s) => s.setIsCrawlerModalOpen);
  const jobsDatabase = useAppStore((s) => s.jobsDatabase);
  const passport = useAppStore((s) => s.passport);
  const setSelectedJob = useAppStore((s) => s.setSelectedJob);
  const setSelectedJobMatch = useAppStore((s) => s.setSelectedJobMatch);
  const setSelectedJobHf = useAppStore((s) => s.setSelectedJobHf);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isCommandOpen]);

  if (!isCommandOpen) return null;

  const q = query.trim().toLowerCase();

  const commands: Array<{ id: string; group: string; label: string; kbd: string; run: () => void }> = [
    { id: 't-passport', group: '화면 이동', label: '1. 내 조건 설정 (Passport)', kbd: '1', run: () => setActiveTab('passport') },
    { id: 't-radar', group: '화면 이동', label: '2. 맞춤 공고 탐색 (Radar)', kbd: '2', run: () => setActiveTab('radar') },
    { id: 't-scanner', group: '화면 이동', label: '3. 근로계약 위험 진단 (Scanner)', kbd: '3', run: () => setActiveTab('scanner') },
    { id: 't-calculator', group: '화면 이동', label: '4. 실질 체감 시급 (Calculator)', kbd: '4', run: () => setActiveTab('calculator') },
    { id: 't-matrix', group: '화면 이동', label: '5. 이직처 비교 (Offer Matrix)', kbd: '5', run: () => setActiveTab('matrix') },
    { id: 't-ledger', group: '화면 이동', label: '6. 기업별 연봉 실태 (Ledger)', kbd: '6', run: () => setActiveTab('ledger') },
    { id: 'm-resume', group: '빠른 실행', label: '이력서 / 경력기술서 자동 파싱 열기', kbd: 'R', run: () => setIsResumeModalOpen(true) },
    { id: 'm-market', group: '빠른 실행', label: '내 시장 가치 추정(P10-P90) 산출 근거', kbd: 'M', run: () => setIsMarketValueModalOpen(true) },
    { id: 'm-skill', group: '빠른 실행', label: '스킬 갭 보완 로드맵 열기', kbd: 'S', run: () => setIsSkillGapModalOpen(true) },
    { id: 'm-crawler', group: '빠른 실행', label: '수집 채널 네트워크 현황 보기', kbd: 'C', run: () => setIsCrawlerModalOpen(true) },
  ];

  const matchedCommands = commands.filter(
    (c) => !q || c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
  );

  const matchedJobs = (q
    ? jobsDatabase.filter((j) => `${j.company} ${j.title} ${j.canonicalRole} ${j.occupation}`.toLowerCase().includes(q))
    : jobsDatabase
  ).slice(0, 5);

  const exec = (fn: () => void) => {
    setIsCommandOpen(false);
    fn();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-24 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCommandOpen(false);
      }}
    >
      <div className="bg-[#111113] border border-white/[0.12] rounded-[12px] max-w-xl w-full overflow-hidden">
        <div className="flex items-center px-3.5 py-3 border-b border-white/[0.08] gap-2.5">
          <IconSearch className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="화면 이동, 기능 실행 또는 기업·공고 검색..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsCommandOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150"
          >
            <IconClose />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-white/[0.06]">
          {matchedCommands.length > 0 && (
            <div className="pb-1.5">
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">명령어</div>
              {matchedCommands.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => exec(c.run)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-zinc-200 hover:bg-[#1C1C1F] transition-colors duration-150 text-left"
                >
                  <span>{c.label}</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#18181B] border border-white/[0.08] rounded text-zinc-400">
                    {c.kbd}
                  </kbd>
                </button>
              ))}
            </div>
          )}

          {matchedJobs.length > 0 && (
            <div className="pt-1.5">
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">채용 공고 바로 열기</div>
              {matchedJobs.map((job) => {
                const match = calculateDynamicJobMatch(passport, job);
                const hf = evaluateHardFilters(passport, job);
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() =>
                      exec(() => {
                        setActiveTab('radar' as TabId);
                        setSelectedJob(job);
                        setSelectedJobMatch(match);
                        setSelectedJobHf(hf);
                      })
                    }
                    className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-md text-xs hover:bg-[#1C1C1F] transition-colors duration-150 text-left"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-zinc-100">{job.company}</span>
                      <span className="text-zinc-400 ml-2 truncate">{job.title}</span>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] text-zinc-300 shrink-0">{match.totalScore}%</span>
                  </button>
                );
              })}
            </div>
          )}

          {matchedCommands.length === 0 && matchedJobs.length === 0 && (
            <div className="py-10 text-center text-xs text-zinc-500">일치하는 명령어나 공고가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
