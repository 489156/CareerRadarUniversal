import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateSkillGapTracks } from '@/lib/matcher';
import { IconClose, IconExternal } from './Icons';

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
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSkillGapModalOpen(false);
      }}
    >
      <div className="bg-[#111113] border border-white/[0.1] rounded-[12px] max-w-4xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
              <span>{passport.occupation} 직군</span>
              <span>·</span>
              <span className="tabular-nums text-zinc-200">+{totalExpanded} 확장 포지션</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-1 tracking-[-0.02em]">
              스킬 갭 보완 시 확장 시장 (+{totalExpanded}건) & 요구 역량
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSkillGapModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150"
          >
            <IconClose />
          </button>
        </div>

        <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-[8px] text-xs text-zinc-300 leading-relaxed">
          현재 커리어(<span className="text-zinc-100 font-medium">{passport.canonicalRole}</span>,{" "}
          {passport.track === "ENTRY" || passport.totalYears === 0 ? "신입 트랙" : `${passport.totalYears}년차`})에 아래
          3개 역량 트랙 중 하나를 보강하면 지원 가능 포지션이 <span className="font-mono text-zinc-100">+{totalExpanded}건</span> 확장됩니다.
        </div>

        <div className="flex space-x-1.5 border-b border-white/[0.08] pb-2.5 text-xs overflow-x-auto">
          {expandedTracks.map((track, idx) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setActiveSkillTrackId(track.id)}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 whitespace-nowrap ${
                selectedTrack.id === track.id
                  ? "bg-[#FAFAFA] text-[#0A0A0B]"
                  : "bg-[#18181B] text-zinc-300 hover:bg-[#222226] border border-white/[0.08]"
              }`}
            >
              {idx + 1}. {track.name} <span className="font-mono tabular-nums opacity-75">({track.expandedCount})</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-[#0A0A0B] p-4 rounded-[8px] border border-white/[0.08] space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-semibold text-zinc-100 text-sm">{selectedTrack.name}</div>
              <div className="text-emerald-400 font-mono tabular-nums font-medium">{selectedTrack.expectedSalaryRange}</div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">핵심 스킬셋</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-200">
                {selectedTrack.skills.map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">실행 액션 아이템</span>
              <div className="space-y-1 text-zinc-300">
                {selectedTrack.actionItems.map((a, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="font-mono text-zinc-500 text-[11px]">{idx + 1}.</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-white/[0.08] rounded-[8px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
                <tr>
                  <th className="py-2 px-3 font-medium whitespace-nowrap">기업명</th>
                  <th className="py-2 px-3 font-medium whitespace-nowrap">타깃 포지션</th>
                  <th className="py-2 px-3 font-medium whitespace-nowrap">근무지</th>
                  <th className="py-2 px-3 font-medium whitespace-nowrap">예상 연봉</th>
                  <th className="py-2 px-3 text-right font-medium whitespace-nowrap">채용관</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {selectedTrack.jobs.map((j, idx) => (
                  <tr key={idx} className="hover:bg-[#18181B]/60 transition-colors duration-150">
                    <td className="py-2.5 px-3 font-medium text-zinc-100 whitespace-nowrap">{j.company}</td>
                    <td className="py-2.5 px-3 text-zinc-300 min-w-[180px]">{j.title}</td>
                    <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">{j.location}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-zinc-200 whitespace-nowrap">{j.salary}</td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-[11px] font-medium text-zinc-200 transition-colors duration-150"
                      >
                        <span>원문</span>
                        <IconExternal className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setIsSkillGapModalOpen(false)}
            className="px-4 py-2 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
