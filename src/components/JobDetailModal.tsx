import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { diagnoseJobRisks } from '@/lib/scanner';

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

  const handleSendToScanner = () => {
    const textToScan =
      selectedJob.rawText ||
      `${selectedJob.company} - ${selectedJob.title}\n급여: ${selectedJob.salaryDisplay}\n${selectedJob.tags.join(', ')}`;
    setScannerText(textToScan);
    setScanResult(diagnoseJobRisks(textToScan));
    setSelectedJob(null);
    setSelectedJobHf(null);
    setActiveTab('scanner');
    showToast(`⚖️ ${selectedJob.company} 공고 원문이 근로계약 위험 진단으로 전송되었습니다.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedJob(null);
          setSelectedJobHf(null);
        }
      }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#1e273b] pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400">{selectedJob.company}</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedJob.title}</h3>
            <p className="text-xs text-indigo-400 font-mono mt-0.5">표준 직무: {selectedJob.canonicalRole}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedJob(null);
              setSelectedJobHf(null);
            }}
            className="text-slate-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {selectedJobHf && selectedJobHf.isExcluded && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold flex items-start space-x-2.5">
            <span className="text-base flex-shrink-0">🚫</span>
            <div>
              <span className="font-bold text-rose-400">[절대 배제 기준 위반]</span>
              <div className="mt-1 space-y-0.5 text-rose-200">
                {selectedJobHf.exclusionReasons.map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs bg-[#0a0e17] p-4 rounded-xl border border-[#182338]">
          <div>
            <span className="text-slate-400">보상 기준</span>
            <div className="font-bold text-slate-100 font-mono text-sm mt-0.5">{selectedJob.salaryDisplay}</div>
          </div>
          <div>
            <span className="text-slate-400">통근 소요 (수도권 기준)</span>
            <div className="font-bold text-sky-400 font-mono text-sm mt-0.5">편도 {selectedJob.commuteMinutes}분</div>
          </div>
          <div>
            <span className="text-slate-400">포괄임금 체계</span>
            <div className="font-bold text-slate-100 mt-0.5">
              {selectedJob.hasFixedOT ? `고정OT ${selectedJob.fixedOTHours}시간 포함` : "비포괄 (수당 100% 별도)"}
            </div>
          </div>
          <div>
            <span className="text-slate-400">적합도 점수</span>
            <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{selectedJobMatch.totalScore}%</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">공고 원문 (Raw Posting)</h4>
          <pre className="bg-[#070a10] border border-[#1b253b] rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {selectedJob.rawText || "공고 본문 데이터가 로드되었습니다."}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-[#1e273b]">
          <a
            href={selectedJob.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg transition flex items-center justify-center space-x-1"
          >
            <span>🔗 채용공고 원문 바로가기 ↗</span>
          </a>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setSelectedJob(null);
                setSelectedJobHf(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSendToScanner}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg transition"
            >
              ⚖️ 근로계약 위험 진단 전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
