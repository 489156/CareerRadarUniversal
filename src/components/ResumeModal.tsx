import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { parseResume } from '@/lib/resume';
import { IconClose } from './Icons';

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
      showToast("이력서 또는 경력기술서 텍스트를 입력해 주세요.");
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
      !r.domainMatched ? "직군 키워드를 찾지 못해 '기획'으로 임시 설정했습니다." : "",
      missingYears ? "경력 연차를 찾지 못해 기존 연차를 유지했습니다." : "",
    ].filter(Boolean);

    if (warnings.length > 0) {
      showToast(warnings.join(" "));
    } else {
      const sourceLabel =
        r.yearsSource === "explicit"
          ? "명시 표기"
          : r.yearsSource === "date-range"
          ? "재직 기간 합산"
          : "신입 키워드";
      showToast(`${r.domainName} · ${r.totalYears === 0 ? "신입(0년차)" : `${r.totalYears}년차`} 반영 (${sourceLabel})`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsResumeModalOpen(false);
      }}
    >
      <div className="bg-[#111113] border border-white/[0.1] rounded-[12px] max-w-xl w-full p-5 space-y-4">
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm tracking-[-0.02em]">이력서 자동 파싱</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              직군·재직기간(겹침 병합)·보유 스킬을 추출해 내 조건에 반영합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsResumeModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150"
          >
            <IconClose />
          </button>
        </div>

        <textarea
          rows={9}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="예: 2021.03 ~ 현재 핀테크 백엔드 개발자 (Java, Spring, Kafka, AWS)"
          className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsResumeModalOpen(false)}
            className="px-3.5 py-2 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-colors duration-150"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleExtract}
            className="px-4 py-2 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150"
          >
            자동 추출 적용
          </button>
        </div>
      </div>
    </div>
  );
}
