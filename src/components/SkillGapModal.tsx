import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EXPANDED_SKILL_GAP_TRACKS } from '@/lib/matcher';

export function SkillGapModal() {
  const isSkillGapModalOpen = useAppStore(state => state.isSkillGapModalOpen);
  const setIsSkillGapModalOpen = useAppStore(state => state.setIsSkillGapModalOpen);
  const activeSkillTrackId = useAppStore(state => state.activeSkillTrackId);
  const setActiveSkillTrackId = useAppStore(state => state.setActiveSkillTrackId);

  const selectedTrack = EXPANDED_SKILL_GAP_TRACKS.find((t) => t.id === activeSkillTrackId) || EXPANDED_SKILL_GAP_TRACKS[0];

  if (!isSkillGapModalOpen) return null;

  return (
    <>
      {/* Skill Gap & 28 Expanded Opportunities Modal */}
      
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSkillGapModalOpen(false); }}
        >
          <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-[#1e273b]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold font-mono">+28 Opportunities</span>
                  <span className="text-xs text-slate-400">3대 전략 스킬 브릿징 로드맵</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">스킬 갭 보완 시 확장 시장 (+28건) & 요구 역량 상세</h3>
              </div>
              <button onClick={() => setIsSkillGapModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 leading-relaxed">
              전통적 인사기획(제도·평가·보상 7년차)의 역량에 아래 <strong className="text-white">3대 고부가가치 스킬셋</strong> 중 하나를 추가 확보할 경우, 수도권 채용 시장에서 즉시 지원 가능 풀(Pool)이 <strong className="text-white">+28건</strong> 확장되며, 연봉 밴드는 평균 <strong className="text-emerald-400">+15~30% 프리미엄</strong>이 형성됩니다.
            </div>

            {/* 3 Track Selector Tabs */}
            <div className="flex space-x-2 border-b border-[#233252] pb-2 text-xs overflow-x-auto">
              {EXPANDED_SKILL_GAP_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setActiveSkillTrackId(track.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    activeSkillTrackId === track.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-[#152038] text-slate-300 hover:bg-[#1d2c4e]"
                  }`}
                >
                  {track.id === "track-analytics" ? "📊 1. People Analytics (14건)" : track.id === "track-global" ? "🌐 2. 글로벌 HR & 영어 (8건)" : "🤖 3. HR AX / 테크 혁신 (6건)"}
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
                  <span className="text-indigo-400 font-bold block">🎯 극복해야 할 구체적 스킬셋:</span>
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
                  <span>확장되는 타깃 채용 공고 ({selectedTrack.jobs.length}건)</span>
                  <span className="text-[11px] text-slate-400 font-normal">공식 링크로 원천 공고 확인 가능</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#233252] text-slate-400">
                        <th className="py-2 px-2.5">기업명</th>
                        <th className="py-2 px-2.5">채용 포지션</th>
                        <th className="py-2 px-2.5">근무지</th>
                        <th className="py-2 px-2.5">예상 연봉</th>
                        <th className="py-2 px-2.5 text-right">공고 원문</th>
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
                              <span>원문 ↗</span>
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
                onClick={() => setIsSkillGapModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>

    </>
  );
}
