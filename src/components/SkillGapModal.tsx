import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateSkillGapTracks } from '@/lib/matcher';

export function SkillGapModal() {
  const isSkillGapModalOpen = useAppStore((s) => s.isSkillGapModalOpen);
  const setIsSkillGapModalOpen = useAppStore((s) => s.setIsSkillGapModalOpen);
  const activeSkillTrackId = useAppStore((s) => s.activeSkillTrackId);
  const setActiveSkillTrackId = useAppStore((s) => s.setActiveSkillTrackId);
  const passport = useAppStore((s) => s.passport);

  if (!isSkillGapModalOpen) return null;

  const expandedTracks = calculateSkillGapTracks(passport);
  const selectedTrack =
    expandedTracks.find((t) => t.id === activeSkillTrackId) || expandedTracks[0];
  const totalExpanded = expandedTracks.reduce((acc, t) => acc + t.expandedCount, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSkillGapModalOpen(false);
      }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-3 border-b border-[#1e273b]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold font-mono">
                +{totalExpanded} Opportunities
              </span>
              <span className="text-xs text-slate-400">{passport.occupation} 직군 3대 전략 스킬 로드맵</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              스킬 갭 보완 시 확장 시장 (+{totalExpanded}건) & 요구 역량 상세
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSkillGapModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 leading-relaxed">
          현재 커리어(<strong className="text-white">{passport.canonicalRole}</strong>,{" "}
          {passport.track === "ENTRY" || passport.totalYears === 0 ? "신입 트랙" : `${passport.totalYears}년차`})에 아래{" "}
          <strong className="text-white">3대 고부가가치 스킬셋</strong> 중 하나를 보강할 경우 지원 가능 포지션이{" "}
          <strong className="text-white">+{totalExpanded}건</strong> 확장되며 연봉 상승 프리미엄을 기대할 수 있습니다.
        </div>

        {/* 3 Track Selector Tabs */}
        <div className="flex space-x-2 border-b border-[#233252] pb-2 text-xs overflow-x-auto">
          {expandedTracks.map((track, idx) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setActiveSkillTrackId(track.id)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                selectedTrack.id === track.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-[#152038] text-slate-300 hover:bg-[#1d2c4e]"
              }`}
            >
              {idx + 1}. {track.name} ({track.expandedCount}건)
            </button>
          ))}
        </div>

        {/* Track Content */}
        <div className="space-y-4">
          <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#192235] space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-bold text-white text-sm">{selectedTrack.name}</div>
              <div className="text-emerald-400 font-mono font-bold">{selectedTrack.expectedSalaryRange}</div>
            </div>

            <div className="space-y-1 pt-1 border-t border-[#1a2336]">
              <span className="text-indigo-400 font-bold block">🎯 확보해야 할 구체적 스킬셋:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-200">
                {selectedTrack.skills.map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span>•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-[#1a2336]">
              <span className="text-sky-400 font-bold block">📌 추천 실행 액션 아이템:</span>
              <div className="space-y-1 text-slate-300">
                {selectedTrack.actionItems.map((a, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span>👉</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>대표 타깃 채용 기업 ({selectedTrack.jobs.length}곳)</span>
              <span className="text-[11px] text-slate-400 font-normal">공식 채용관 링크로 이동 가능</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#233252] text-slate-400">
                    <th className="py-2 px-2.5">기업명</th>
                    <th className="py-2 px-2.5">타깃 포지션</th>
                    <th className="py-2 px-2.5">근무지</th>
                    <th className="py-2 px-2.5">예상 연봉</th>
                    <th className="py-2 px-2.5 text-right">공식 채용관</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18233a] font-mono">
                  {selectedTrack.jobs.map((j, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-2.5 font-sans font-bold text-white">{j.company}</td>
                      <td className="py-2.5 px-2.5 font-sans text-slate-200">{j.title}</td>
                      <td className="py-2.5 px-2.5 font-sans text-slate-400 text-[11px]">{j.location}</td>
                      <td className="py-2.5 px-2.5 text-emerald-400 font-bold">{j.salary}</td>
                      <td className="py-2.5 px-2.5 text-right font-sans">
                        <a
                          href={j.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/60 text-sky-200 border border-sky-500/40 text-[11px] font-semibold inline-flex items-center space-x-1 transition"
                        >
                          <span>채용관 ↗</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1e273b]">
          <button
            type="button"
            onClick={() => setIsSkillGapModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}
