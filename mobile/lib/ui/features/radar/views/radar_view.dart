import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../view_models/radar_view_model.dart';
import 'detailed_search_sheet.dart';
import 'job_detail_sheet.dart';

class RadarView extends StatelessWidget {
  final RadarViewModel viewModel;
  final Function(String rawText)? onSendToScanner;

  const RadarView({
    super.key,
    required this.viewModel,
    this.onSendToScanner,
  });

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: viewModel,
      builder: (context, _) {
        if (viewModel.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final jobs = viewModel.filteredJobs;

        return Scaffold(
          appBar: AppBar(
            title: const Row(
              children: [
                Text('📡 Opportunity Radar'),
                SizedBox(width: 8),
                Text(
                  'Closed ATS 실시간',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.emerald,
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                tooltip: '새로고침',
                onPressed: () => viewModel.loadJobs(),
              ),
            ],
          ),
          body: Column(
            children: [
              // Search & Filter Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: '기업명, 직무, 키워드 검색',
                          prefixIcon: const Icon(Icons.search, size: 20),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onChanged: viewModel.setSearchQuery,
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => DetailedSearchSheet(viewModel: viewModel),
                        );
                      },
                      icon: const Icon(Icons.tune, size: 16),
                      label: const Text('조건 검색'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.cardElevated,
                        foregroundColor: AppTheme.textWhite,
                        side: const BorderSide(color: AppTheme.border),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Category Filter Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    _buildTabChip('전체', 'ALL'),
                    _buildTabChip('삼일/딜로이트 (Big4)', 'CONSULTING'),
                    _buildTabChip('대기업/그룹사', 'CONGLOMERATE'),
                    _buildTabChip('공공/기관', 'PUBLIC'),
                    _buildTabChip('단독 공고', 'EXCLUSIVE'),
                  ],
                ),
              ),

              // Hard Filter Status Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.rose.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppTheme.rose.withOpacity(0.3)),
                          ),
                          child: const Row(
                            children: [
                              Text('🛡️ Hard Filter 가동 중',
                                  style: TextStyle(fontSize: 11, color: AppTheme.rose)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${viewModel.totalExcludedCount}건 배제됨',
                          style: const TextStyle(fontSize: 11, color: AppTheme.textDark),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const Text('배제 공고 포함',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        Transform.scale(
                          scale: 0.7,
                          child: Switch(
                            value: viewModel.showExcluded,
                            onChanged: viewModel.toggleShowExcluded,
                            activeColor: AppTheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Job List
              Expanded(
                child: jobs.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.filter_alt_off, size: 48, color: AppTheme.textDark),
                            const SizedBox(height: 12),
                            const Text('조건에 일치하는 채용공고가 없습니다.',
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
                            const SizedBox(height: 6),
                            TextButton(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (_) => DetailedSearchSheet(viewModel: viewModel),
                                );
                              },
                              child: const Text('상세 검색 조건 완화하기'),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: jobs.length,
                        itemBuilder: (context, index) {
                          final item = jobs[index];
                          return _buildJobCard(context, item);
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTabChip(String label, String key) {
    final isSelected = viewModel.activeCategoryTab == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => viewModel.setActiveCategoryTab(key),
        selectedColor: AppTheme.primary,
        backgroundColor: AppTheme.cardElevated,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppTheme.textMuted,
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.border),
        ),
      ),
    );
  }

  Widget _buildJobCard(BuildContext context, ScoredJobItem item) {
    final job = item.job;
    final match = item.matchScore;
    final isExcluded = item.isExcluded;

    Color badgeColor = AppTheme.emerald;
    if (match.totalScore < 70) {
      badgeColor = AppTheme.amber;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => JobDetailSheet(
              item: item,
              onSendToScanner: onSendToScanner != null
                  ? () {
                      Navigator.pop(context);
                      onSendToScanner!(job.rawText ?? '${job.title}\n${job.company}');
                    }
                  : null,
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Company & Score
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        job.company,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.accent,
                        ),
                      ),
                      if (job.isCompanyExclusive) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('단독',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary)),
                        ),
                      ],
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: badgeColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: badgeColor.withOpacity(0.4)),
                    ),
                    child: Text(
                      '${match.totalScore}% 적합',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: badgeColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Title
              Text(
                job.title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: isExcluded ? AppTheme.textMuted : AppTheme.textWhite,
                  decoration: isExcluded ? TextDecoration.lineThrough : null,
                ),
              ),
              const SizedBox(height: 8),

              // Sub info
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    '${job.location} (${job.commuteMinutes}분)',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.work_history_outlined, size: 14, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    '${job.minYears}~${job.maxYears}년차',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Tags
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: job.tags.take(3).map((tag) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.cardElevated,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Text(tag,
                        style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  );
                }).toList(),
              ),

              // Excluded Reason (if excluded)
              if (isExcluded) ...[
                const SizedBox(height: 8),
                Text(
                  '배제 사유: ${item.hardFilterResult.reasons.join(", ")}',
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.rose, fontStyle: FontStyle.italic),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
