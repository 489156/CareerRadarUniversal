import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add SVG favicon in <head> to prevent 404
if (!html.includes('rel="icon"')) {
  html = html.replace(
    '<title>Career Radar Universal',
    '<link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>📡</text></svg>">\n  <title>Career Radar Universal'
  );
}

// 2. Add label for= and aria-labels across form elements in index.html

// p_occupation
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">직군 (Occupation)</label>\n              <select id="p_occupation"',
  '<label for="p_occupation" class="block text-xs font-medium text-slate-200 mb-1">직군 (Occupation)</label>\n              <select id="p_occupation" aria-label="직군 (Occupation)"'
);

// p_role
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">현재/희망 직무 (Role)</label>\n              <input type="text" id="p_role"',
  '<label for="p_role" class="block text-xs font-medium text-slate-200 mb-1">현재/희망 직무 (Role)</label>\n              <input type="text" id="p_role" aria-label="현재 및 희망 직무 (Role)"'
);

// p_years
html = html.replace(
  '<label class="text-xs font-medium text-slate-200">총 경력 연수</label>\n                <span id="yearsVal"',
  '<label for="p_years" class="text-xs font-medium text-slate-200">총 경력 연수</label>\n                <span id="yearsVal"'
);
html = html.replace(
  '<input type="range" id="p_years"',
  '<input type="range" id="p_years" aria-label="총 경력 연수"'
);

// p_companyType
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">현재 회사 규모/형태</label>\n              <select id="p_companyType"',
  '<label for="p_companyType" class="block text-xs font-medium text-slate-200 mb-1">현재 회사 규모/형태</label>\n              <select id="p_companyType" aria-label="현재 회사 규모 및 형태"'
);

// p_baseSalary
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">기본급 (연간)</label>\n              <div class="relative">\n                <input type="number" id="p_baseSalary"',
  '<label for="p_baseSalary" class="block text-xs font-medium text-slate-200 mb-1">기본급 (연간)</label>\n              <div class="relative">\n                <input type="number" id="p_baseSalary" aria-label="기본급 연간"'
);

// p_allowance
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">고정수당 / 식대 (연간)</label>\n              <div class="relative">\n                <input type="number" id="p_allowance"',
  '<label for="p_allowance" class="block text-xs font-medium text-slate-200 mb-1">고정수당 / 식대 (연간)</label>\n              <div class="relative">\n                <input type="number" id="p_allowance" aria-label="고정수당 및 식대 연간"'
);

// p_bonus
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">경영성과급 / 인센티브 (직전연도 기준)</label>\n              <div class="relative">\n                <input type="number" id="p_bonus"',
  '<label for="p_bonus" class="block text-xs font-medium text-slate-200 mb-1">경영성과급 / 인센티브 (직전연도 기준)</label>\n              <div class="relative">\n                <input type="number" id="p_bonus" aria-label="경영성과급 및 인센티브"'
);

// p_hasFixedOT
html = html.replace(
  '<input type="checkbox" id="p_hasFixedOT"',
  '<input type="checkbox" id="p_hasFixedOT" aria-label="고정 연장근로수당 포함 계약 여부"'
);

// p_location
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">현재 거주지</label>\n              <input type="text" id="p_location"',
  '<label for="p_location" class="block text-xs font-medium text-slate-200 mb-1">현재 거주지</label>\n              <input type="text" id="p_location" aria-label="현재 거주지"'
);

// p_commuteTol
html = html.replace(
  '<label class="text-xs font-medium text-slate-200">편도 최대 허용 통근 시간</label>\n                <span id="commuteVal"',
  '<label for="p_commuteTol" class="text-xs font-medium text-slate-200">편도 최대 허용 통근 시간</label>\n                <span id="commuteVal"'
);
html = html.replace(
  '<input type="range" id="p_commuteTol"',
  '<input type="range" id="p_commuteTol" aria-label="편도 최대 허용 통근 시간"'
);

// p_skills
html = html.replace(
  '<label class="block text-xs font-medium text-slate-200 mb-1">보유 핵심 스킬셋 (쉼표로 구분)</label>\n              <textarea id="p_skills"',
  '<label for="p_skills" class="block text-xs font-medium text-slate-200 mb-1">보유 핵심 스킬셋 (쉼표로 구분)</label>\n              <textarea id="p_skills" aria-label="보유 핵심 스킬셋"'
);

// radarSearchInput
html = html.replace(
  '<input type="text" id="radarSearchInput"',
  '<input type="text" id="radarSearchInput" aria-label="기업명, 직무, 기술스택 검색"'
);

// scannerInput
html = html.replace(
  '<textarea id="scannerInput"',
  '<textarea id="scannerInput" aria-label="채용공고 본문 텍스트 입력"'
);

// Calculator inputs (c_cash, c_commute, c_cost, c_remote, c_hours)
html = html.replace(
  '<span>확정 연간 현금 (기본급 + 고정수당)</span>\n                <span id="calc_cash_label"',
  '<label for="c_cash">확정 연간 현금 (기본급 + 고정수당)</label>\n                <span id="calc_cash_label"'
);
html = html.replace(
  '<input type="range" id="c_cash"',
  '<input type="range" id="c_cash" aria-label="확정 연간 현금"'
);

html = html.replace(
  '<span>편도 통근 시간 (집 → 회사)</span>\n                <span id="calc_commute_label"',
  '<label for="c_commute">편도 통근 시간 (집 → 회사)</label>\n                <span id="calc_commute_label"'
);
html = html.replace(
  '<input type="range" id="c_commute"',
  '<input type="range" id="c_commute" aria-label="편도 통근 시간"'
);

html = html.replace(
  '<span>월 예상 교통비 (대중교통 / 유류비)</span>\n                <span id="calc_cost_label"',
  '<label for="c_cost">월 예상 교통비 (대중교통 / 유류비)</label>\n                <span id="calc_cost_label"'
);
html = html.replace(
  '<input type="range" id="c_cost"',
  '<input type="range" id="c_cost" aria-label="월 예상 교통비"'
);

html = html.replace(
  '<span>주간 재택 / 원격근무 일수</span>\n                <span id="calc_remote_label"',
  '<label for="c_remote">주간 재택 / 원격근무 일수</label>\n                <span id="calc_remote_label"'
);
html = html.replace(
  '<input type="range" id="c_remote"',
  '<input type="range" id="c_remote" aria-label="주간 재택 원격근무 일수"'
);

html = html.replace(
  '<span>주당 실제 근로시간 (포괄 고정OT 포함)</span>\n                <span id="calc_hours_label"',
  '<label for="c_hours">주당 실제 근로시간 (포괄 고정OT 포함)</label>\n                <span id="calc_hours_label"'
);
html = html.replace(
  '<input type="range" id="c_hours"',
  '<input type="range" id="c_hours" aria-label="주당 실제 근로시간"'
);

// hf_customInput
html = html.replace(
  '<input type="text" id="hf_customInput"',
  '<input type="text" id="hf_customInput" aria-label="배제할 단어 입력"'
);

// resumeInputText
html = html.replace(
  '<textarea id="resumeInputText"',
  '<textarea id="resumeInputText" aria-label="이력서 또는 경력기술서 원문 텍스트"'
);

// ledgerSearch
if (html.includes('id="ledgerSearch"') && !html.includes('id="ledgerSearch" oninput="filterLedger()" placeholder="기업명, 직무, 출처 검색..." aria-label')) {
  html = html.replace(
    'id="ledgerSearch" oninput="filterLedger()" placeholder="기업명, 직무, 출처 검색..."',
    'id="ledgerSearch" oninput="filterLedger()" placeholder="기업명, 직무, 출처 검색..." aria-label="공식 공시 실측 원장 기업명, 직무, 출처 검색"'
  );
}

// ds_min_salary
html = html.replace(
  '<label class="text-xs text-slate-400 block mb-1">최소 희망 연봉 (만원)</label>\n              <input type="number" id="ds_min_salary"',
  '<label for="ds_min_salary" class="text-xs text-slate-400 block mb-1">최소 희망 연봉 (만원)</label>\n              <input type="number" id="ds_min_salary" aria-label="최소 희망 연봉 (만원)"'
);

// ds_max_commute
html = html.replace(
  '<label class="text-xs text-slate-400 block mb-1">최대 출퇴근 허용 시간 (분)</label>\n              <input type="number" id="ds_max_commute"',
  '<label for="ds_max_commute" class="text-xs text-slate-400 block mb-1">최대 출퇴근 허용 시간 (분)</label>\n              <input type="number" id="ds_max_commute" aria-label="최대 출퇴근 허용 시간 (분)"'
);

// Hard filter checkboxes
const hfBoxes = [
  ['hf_permanent', '정규직만 허용 체크박스'],
  ['hf_capital', '수도권만 허용 체크박스'],
  ['hf_commute', '통근 허용 초과 배제 체크박스'],
  ['hf_fixedOT', '고정OT 20h 초과 배제 체크박스'],
  ['hf_salary', '현재 보상 미만 배제 체크박스'],
  ['hf_relocation', '지방 이전 순환 기관 배제 체크박스'],
  ['showExcludedCheckbox', '배제된 공고 포함하여 보기 토글']
];

hfBoxes.forEach(([id, label]) => {
  const target = `id="${id}"`;
  if (html.includes(target) && !html.includes(`${target} aria-label`)) {
    html = html.replace(target, `${target} aria-label="${label}"`);
  }
});

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Self-healing successfully applied to index.html!');
