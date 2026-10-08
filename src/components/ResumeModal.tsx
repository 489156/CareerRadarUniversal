import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export function ResumeModal() {
  const isResumeModalOpen = useAppStore(state => state.isResumeModalOpen);
  const setIsResumeModalOpen = useAppStore(state => state.setIsResumeModalOpen);
  const resumeText = useAppStore(state => state.resumeText);
  const setResumeText = useAppStore(state => state.setResumeText);

  if (!isResumeModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setIsResumeModalOpen(false); }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-[#1e273b] pb-3">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>AI 이력서 / JD 정합성 분석</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Gemini 1.5 Pro</span>
          </h3>
          <button onClick={() => setIsResumeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <p className="text-xs text-slate-400">
          본인의 이력서(텍스트)를 붙여넣으시면, 선택한 채용공고(JD)와의 정합성을 AI가 분석하여 부족한 역량과 이력서 수정 방향을 제안합니다.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="이력서 또는 경력기술서를 텍스트로 붙여넣으세요..."
          className="w-full h-48 bg-[#0a0e17] border border-[#1b253b] rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 transition"
        />
        <div className="flex justify-end space-x-2 pt-2">
          <button onClick={() => setIsResumeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition">취소</button>
          <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg transition">AI 분석 시작 (STUB)</button>
        </div>
      </div>
    </div>
  );
}
