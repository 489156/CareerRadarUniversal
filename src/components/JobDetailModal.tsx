import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { diagnoseJobRisks } from '@/lib/scanner';
import { IconClose, IconExternal } from './Icons';

export function JobDetailModal() {
  const selectedJob = useAppStore((s) => s.selectedJob);
  const setSelectedJob = useAppStore((s) => s.setSelectedJob);
  const selectedJobMatch = useAppStore((s) => s.selectedJobMatch);
  const selectedJobHf = useAppStore((s) => s.selectedJobHf);
  const setSelectedJobHf = useAppStore((s) => s.setSelectedJobHf);

  const setScannerText = useAppStore((s) => s.setScannerText);
  const setScanResult = useAppStore((s) => s.setScanResult);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const showToast = useAppStore((s) => s.showToast);

  if (!selectedJob || !selectedJobMatch) return null;

  const close = () => {
    setSelectedJob(null);
    setSelectedJobHf(null);
  };

  const handleSendToScanner = () => {
    const textToScan =
      selectedJob.rawText ||
      `${selectedJob.company} - ${selectedJob.title}\n급여: ${selectedJob.salaryDisplay}\n${selectedJob.tags.join(', ')}`;
    setScannerText(textToScan);
    setScanResult(diagnoseJobRisks(textToScan));
    close();
    setActiveTab('scanner');
    showToast(`${selectedJob.company} 공고 원문이 3. 계약 진단으로 전송되었습니다.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Right Slide-Over Detail Drawer (Linear / Raycast Style) */}
      <aside className="bg-[#111113] border-l border-white/[0.1] max-w-xl w-full h-full flex flex-col justify-between overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-200">{selectedJob.company}</span>
              <span>·</span>
              <span className="font-mono text-[11px]">{selectedJob.occupation}</span>
              {selectedJob.isEntryLevel && (
                <>
                  <span>·</span>
                  <span className="text-zinc-300">신입/인턴</span>
                </>
              )}
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-1 tracking-[-0.02em]">
              {selectedJob.title}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedJob.canonicalRole}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150 shrink-0"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {selectedJobHf && selectedJobHf.isExcluded && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[8px] text-rose-300 text-xs space-y-1">
              <div className="font-semibold text-rose-400">절대 배제 기준 위반</div>
              {selectedJobHf.exclusionReasons.map((r, i) => (
                <div key={i}>· {r}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 bg-[#18181B] border border-white/[0.08] rounded-[8px] divide-x divide-y divide-white/[0.06] text-xs">
            <div className="p-3">
              <span className="text-[11px] text-zinc-500 block">예상 보상</span>
              <span className="font-mono tabular-nums text-zinc-100 font-semibold mt-0.5 block">
                {selectedJob.salaryDisplay}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-zinc-500 block">편도 통근</span>
              <span className="font-mono tabular-nums text-zinc-100 font-semibold mt-0.5 block">
                {selectedJob.commuteMinutes}분
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-zinc-500 block">임금 형태</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">
                {selectedJob.hasFixedOT ? `포괄OT ${selectedJob.fixedOTHours}h 포함` : "비포괄 (수당 별도)"}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-zinc-500 block">종합 적합도</span>
              <span
                className={`font-mono tabular-nums font-semibold mt-0.5 block ${
                  selectedJobMatch.totalScore >= 88 ? "text-emerald-400" : "text-zinc-100"
                }`}
              >
                {selectedJobMatch.totalScore}% ({selectedJobMatch.verdict})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: "직무", val: selectedJobMatch.roleFit },
              { label: "연차", val: selectedJobMatch.seniorityFit },
              { label: "통근", val: selectedJobMatch.commuteFit },
              { label: "보상", val: selectedJobMatch.salaryFit },
            ].map((m) => (
              <div key={m.label} className="bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] py-2">
                <span className="text-[10px] text-zinc-500 block">{m.label}</span>
                <span className="font-mono tabular-nums text-zinc-200 font-medium">{m.val}%</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            <h4 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">매칭 근거 및 유의점</h4>
            <div className="bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] p-3 space-y-1.5">
              {selectedJobMatch.matchedReasons.map((r, i) => (
                <div key={i} className="text-zinc-300 flex items-start space-x-2">
                  <span className="text-emerald-400 font-mono">+</span>
                  <span>{r}</span>
                </div>
              ))}
              {selectedJobMatch.gapReasons.map((g, i) => (
                <div key={i} className="text-zinc-400 flex items-start space-x-2">
                  <span className="text-amber-400 font-mono">-</span>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">공고 원문 (Raw Posting)</h4>
            <pre className="bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] p-3.5 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {selectedJob.rawText || "공고 원문 텍스트가 등록되어 있습니다."}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.08] bg-[#0A0A0B] flex flex-wrap justify-between items-center gap-2">
          <a
            href={selectedJob.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-200 inline-flex items-center space-x-1.5 transition-colors duration-150"
          >
            <span>지원 원문 이동</span>
            <IconExternal className="w-3.5 h-3.5" />
          </a>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={close}
              className="px-3.5 py-2 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-300 transition-colors duration-150"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSendToScanner}
              className="px-4 py-2 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150"
            >
              근로계약 위험 진단 전송
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
