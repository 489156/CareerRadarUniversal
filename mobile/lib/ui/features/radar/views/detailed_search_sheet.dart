import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../view_models/radar_view_model.dart';

class DetailedSearchSheet extends StatefulWidget {
  final RadarViewModel viewModel;

  const DetailedSearchSheet({super.key, required this.viewModel});

  @override
  State<DetailedSearchSheet> createState() => _DetailedSearchSheetState();
}

class _DetailedSearchSheetState extends State<DetailedSearchSheet> {
  late bool onlyPermanent;
  late bool onlyCapitalArea;
  late bool noHeavyFixedOT;
  late TextEditingController minSalaryController;
  late TextEditingController maxCommuteController;
  late TextEditingController keywordController;
  late List<String> customKeywords;

  @override
  void initState() {
    super.initState();
    final f = widget.viewModel.currentPassport.hardFilters;
    onlyPermanent = f.onlyPermanent;
    onlyCapitalArea = f.onlyCapitalArea;
    noHeavyFixedOT = f.noHeavyFixedOT;
    minSalaryController = TextEditingController(
      text: f.minSalaryManwon != null ? f.minSalaryManwon.toString() : '',
    );
    maxCommuteController = TextEditingController(
      text: f.maxCommuteMinutes != null ? f.maxCommuteMinutes.toString() : '60',
    );
    keywordController = TextEditingController();
    customKeywords = List.from(f.customKeywords);
  }

  @override
  void dispose() {
    minSalaryController.dispose();
    maxCommuteController.dispose();
    keywordController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    final minSal = int.tryParse(minSalaryController.text.trim());
    final maxCom = int.tryParse(maxCommuteController.text.trim()) ?? 60;

    final updated = widget.viewModel.currentPassport.hardFilters.copyWith(
      onlyPermanent: onlyPermanent,
      onlyCapitalArea: onlyCapitalArea,
      noHeavyFixedOT: noHeavyFixedOT,
      minSalaryManwon: minSal,
      maxCommuteMinutes: maxCom,
      customKeywords: customKeywords,
    );

    widget.viewModel.updateHardFilters(updated);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '⚙️ 채용공고 상세검색 (Hard Filter)',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textWhite,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, color: AppTheme.textMuted),
                ),
              ],
            ),
            const Text(
              '절대 배제할 조건이나 필수 조건을 설정합니다. 이 조건에 맞지 않는 공고는 매칭에서 완전 배제됩니다.',
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 20),

            // Checkbox 1: 고용형태
            _buildSectionHeader('고용형태 (필수)'),
            CheckboxListTile(
              value: onlyPermanent,
              onChanged: (val) => setState(() => onlyPermanent = val ?? true),
              title: const Text('정규직 공고만 보기 (계약직/인턴 제외)',
                  style: TextStyle(fontSize: 14, color: AppTheme.textWhite)),
              activeColor: AppTheme.primary,
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),

            // Checkbox 2: 지역
            _buildSectionHeader('근무지역 (필수)'),
            CheckboxListTile(
              value: onlyCapitalArea,
              onChanged: (val) => setState(() => onlyCapitalArea = val ?? true),
              title: const Text('수도권(서울/경기/인천)만 보기 (지방 제외)',
                  style: TextStyle(fontSize: 14, color: AppTheme.textWhite)),
              activeColor: AppTheme.primary,
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),

            // Checkbox 3: 포괄임금제 배제
            _buildSectionHeader('근로조건 안심 필터'),
            CheckboxListTile(
              value: noHeavyFixedOT,
              onChanged: (val) => setState(() => noHeavyFixedOT = val ?? true),
              title: const Text('과도한 고정OT(20시간 초과) 포괄임금 배제',
                  style: TextStyle(fontSize: 14, color: AppTheme.textWhite)),
              activeColor: AppTheme.primary,
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 12),

            // Text Inputs: 최소 연봉 및 통근시간
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('최소 희망 연봉'),
                      TextField(
                        controller: minSalaryController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: '예: 6000',
                          suffixText: '만원',
                          isDense: true,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('최대 통근 허용'),
                      TextField(
                        controller: maxCommuteController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: '예: 60',
                          suffixText: '분',
                          isDense: true,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Keyword Exclusions
            _buildSectionHeader('사용자 정의 배제 키워드'),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: keywordController,
                    decoration: const InputDecoration(
                      hintText: '배제할 단어 (예: 야간, 교대, 출장)',
                      isDense: true,
                    ),
                    onSubmitted: (val) {
                      if (val.trim().isNotEmpty) {
                        setState(() {
                          customKeywords.add(val.trim());
                          keywordController.clear();
                        });
                      }
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    if (keywordController.text.trim().isNotEmpty) {
                      setState(() {
                        customKeywords.add(keywordController.text.trim());
                        keywordController.clear();
                      });
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.cardElevated,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: const Text('추가'),
                ),
              ],
            ),
            if (customKeywords.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: customKeywords.map((kw) {
                  return Chip(
                    label: Text(kw, style: const TextStyle(fontSize: 12)),
                    deleteIcon: const Icon(Icons.close, size: 14),
                    onDeleted: () {
                      setState(() => customKeywords.remove(kw));
                    },
                    backgroundColor: AppTheme.cardElevated,
                    side: const BorderSide(color: AppTheme.border),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _applyFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  '검색 조건 저장 및 레이더에 즉시 적용',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: AppTheme.accent,
        ),
      ),
    );
  }
}
