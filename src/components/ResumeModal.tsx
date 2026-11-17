import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { parseResume } from '@/lib/resume';

export function ResumeModal() {
  const isResumeModalOpen = useAppStore((s) => s.isResumeModalOpen);
  const setIsResumeModalOpen = useAppStore((s) => s.setIsResumeModalOpen);
  const resumeText = useAppStore((s) => s.resumeText);
  const setResumeText = useAppStore((s) => s.setResumeText);
  const setPassport = useAppStore((s) => s.setPassport);
  const showToast = useAppStore((s) => s.showToast);

  if (!isResumeModalOpen) return null;

  const handleExtract = () => {
    if (!resumeText.trim()) {
      showToast("⚠️ 이력서 또는 경력기술서 텍스트를 입력해 주세요.");
      return;
    }
    const r = parseResume(resumeText);
    const missingYears = r.yearsSource === "unknown";
    setPassport((prev) => ({
      ...prev,
      occupation: r.occupation,
      canonicalRole: r.canonicalRole,
      skills: r.skills.length > 0 ? r.skills : prev.skills,
      ...(missingYears ? {} : { totalYears: r.totalYears, track: r.track }),
    }));
    setIsResumeModalOpen(false);

    const warnings = [
      !r.domainMatched ? "직군 키워드를 찾지 못해 '기획'으로 임시 설정했습니다. 직군을 직접 확인해 주세요." : "",
      missingYears ? "경력 연차를 찾지 못해 기존 값을 유지했습니다." : "",
    ].filter(Boolean);

    if (warnings.length > 0) {
      showToast(`⚠️ ${warnings.join(" ")}`);
    } else {
      const sourceLabel =
        r.yearsSource === "explicit"
          ? "명시 표기"
          : r.yearsSource === "date-range"
          ? "재직 기간 합산"
          : "신입 키워드";
      showToast(`✨ [${r.domainName}] / ${r.totalYears === 0 ? "신입(0년차)" : `${r.totalYears}년차`} 반영 완료 (${sourceLabel})`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsResumeModalOpen(false);
      }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[#1e273b] pb-3">
          <div>
            <h3 className="font-bold text-white text-base">📄 이력서 / 경력기술서 자동 파싱</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              직군·재직기간(겹침 병합)·핵심 스킬·신입 여부를 추출해 내 커리어 조건에 즉시 반영합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsResumeModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>
        <textarea
          rows={9}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="예: 2021.03 ~ 현재 핀테크 백엔드 개발자 (Java, Spring, Kafka, AWS)..."
          className="w-full bg-[#0a0d14] border border-[#1f293d] rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsResumeModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleExtract}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg transition"
          >
            자동 추출 적용
          </button>
        </div>
      </div>
    </div>
  );
}
