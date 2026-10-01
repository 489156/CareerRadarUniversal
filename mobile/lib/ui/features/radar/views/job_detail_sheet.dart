import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_theme.dart';
import '../view_models/radar_view_model.dart';

class JobDetailSheet extends StatelessWidget {
  final ScoredJobItem item;
  final VoidCallback? onSendToScanner;

  const JobDetailSheet({
    super.key,
    required this.item,
    this.onSendToScanner,
  });

  Future<void> _openJobUrl(BuildContext context) async {
    final uri = Uri.parse(item.job.jobUrl);
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('링크를 열 수 없습니다: ${item.job.jobUrl}')),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('URL 실행 실패: ${item.job.jobUrl}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final job = item.job;
    final match = item.matchScore;

    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(20),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
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

            // Header: Company & Title
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.company,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.accent,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        job.title,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textWhite,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primary.withOpacity(0.5)),
                  ),
                  child: Column(
                    children: [
                      const Text('적합도',
                          style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      Text(
                        '${match.totalScore}%',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textWhite,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Match Breakdown Grid
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.cardElevated,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSubScore('직무 적합', '${match.roleFit}%'),
                  _buildSubScore('연차 적합', '${match.seniorityFit}%'),
                  _buildSubScore('통근 적합', '${job.commuteMinutes}분'),
                  _buildSubScore('보상 적합', '${match.salaryFit}%'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Info Details
            _buildInfoRow('🏢 출처 시스템', '${job.sourceName} (${job.sourceSystem ?? "ATS"})'),
            _buildInfoRow('📍 근무 지역', job.location),
            _buildInfoRow('💰 추정 연봉', '${job.salaryMinManwon} ~ ${job.salaryMaxManwon}만 원 (${job.salaryDisplay})'),
            _buildInfoRow('⏳ 요구 연차', '${job.minYears} ~ ${job.maxYears}년차'),
            if (job.hasFixedOT)
              _buildInfoRow('⚠️ 포괄임금제', '월 ${job.fixedOTHours}시간 고정OT 포함'),

            const SizedBox(height: 16),

            // Pros
            if (match.matchedReasons.isNotEmpty) ...[
              const Text('✨ 매칭 강점 요인',
                  style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.emerald)),
              const SizedBox(height: 6),
              ...match.matchedReasons.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text('• $r',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textWhite)),
                  )),
              const SizedBox(height: 12),
            ],

            // Gaps
            if (match.gapReasons.isNotEmpty) ...[
              const Text('🔍 스킬 & 조건 갭',
                  style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.amber)),
              const SizedBox(height: 6),
              ...match.gapReasons.map((g) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text('• $g',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textWhite)),
                  )),
              const SizedBox(height: 16),
            ],

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openJobUrl(context),
                    icon: const Icon(Icons.open_in_new, size: 16),
                    label: const Text('원문 공고 바로가기'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                if (onSendToScanner != null) ...[
                  const SizedBox(width: 8),
                  IconButton.filledTonal(
                    onPressed: onSendToScanner,
                    icon: const Icon(Icons.shield_outlined),
                    tooltip: 'Labor Scanner로 정밀 검사',
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.rose.withOpacity(0.2),
                      foregroundColor: AppTheme.rose,
                      padding: const EdgeInsets.all(14),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubScore(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        const SizedBox(height: 2),
        Text(value,
            style: const TextStyle(
                fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontSize: 12, color: AppTheme.textWhite)),
          ),
        ],
      ),
    );
  }
}
