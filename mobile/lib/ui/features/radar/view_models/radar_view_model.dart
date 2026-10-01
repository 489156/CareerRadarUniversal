import 'package:flutter/foundation.dart';
import '../../../../data/repositories/job_repository.dart';
import '../../../../domain/models/career_passport.dart';
import '../../../../domain/models/hard_filters.dart';
import '../../../../domain/models/job_posting.dart';
import '../../../../domain/models/match_score.dart';
import '../../../../domain/use_cases/evaluate_hard_filters_use_case.dart';
import '../../../../domain/use_cases/match_job_fit_use_case.dart';
import '../../passport/view_models/passport_view_model.dart';

class ScoredJobItem {
  final JobPosting job;
  final DynamicMatchScore matchScore;
  final HardFilterResult hardFilterResult;

  const ScoredJobItem({
    required this.job,
    required this.matchScore,
    required this.hardFilterResult,
  });

  bool get isExcluded => hardFilterResult.isExcluded;
}

class RadarViewModel extends ChangeNotifier {
  final JobRepository _jobRepository;
  final PassportViewModel _passportViewModel;
  final MatchJobFitUseCase _matchJobFitUseCase;
  final EvaluateHardFiltersUseCase _evaluateHardFiltersUseCase;

  List<JobPosting> _allJobs = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String _activeCategoryTab = 'ALL'; // ALL, CONSULTING, PUBLIC, CONGLOMERATE, EXCLUSIVE
  bool _showExcluded = false;

  RadarViewModel({
    required JobRepository jobRepository,
    required PassportViewModel passportViewModel,
    required MatchJobFitUseCase matchJobFitUseCase,
    required EvaluateHardFiltersUseCase evaluateHardFiltersUseCase,
  })  : _jobRepository = jobRepository,
        _passportViewModel = passportViewModel,
        _matchJobFitUseCase = matchJobFitUseCase,
        _evaluateHardFiltersUseCase = evaluateHardFiltersUseCase {
    _passportViewModel.addListener(_onPassportChanged);
    loadJobs();
  }

  @override
  void dispose() {
    _passportViewModel.removeListener(_onPassportChanged);
    super.dispose();
  }

  void _onPassportChanged() {
    notifyListeners();
  }

  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String get activeCategoryTab => _activeCategoryTab;
  bool get showExcluded => _showExcluded;
  CareerPassport get currentPassport => _passportViewModel.passport;

  void setSearchQuery(String q) {
    _searchQuery = q.trim().toLowerCase();
    notifyListeners();
  }

  void setActiveCategoryTab(String tab) {
    _activeCategoryTab = tab;
    notifyListeners();
  }

  void toggleShowExcluded(bool val) {
    _showExcluded = val;
    notifyListeners();
  }

  Future<void> updateHardFilters(HardFilters newFilters) async {
    await _passportViewModel.updateHardFilters(newFilters);
    notifyListeners();
  }

  Future<void> loadJobs() async {
    _isLoading = true;
    notifyListeners();

    try {
      _allJobs = await _jobRepository.getJobs();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<ScoredJobItem> get filteredJobs {
    final passport = currentPassport;

    final scored = _allJobs.map((job) {
      final match = _matchJobFitUseCase.execute(passport, job);
      final hf = _evaluateHardFiltersUseCase.execute(passport, job);
      return ScoredJobItem(
        job: job,
        matchScore: match,
        hardFilterResult: hf,
      );
    }).toList();

    return scored.where((item) {
      // 1. Excluded check
      if (!_showExcluded && item.isExcluded) {
        return false;
      }

      // 2. Category Tab check
      if (_activeCategoryTab == 'CONSULTING' &&
          item.job.sourceCategory != SourceCategory.consulting) {
        return false;
      }
      if (_activeCategoryTab == 'PUBLIC' &&
          item.job.sourceCategory != SourceCategory.publicSector) {
        return false;
      }
      if (_activeCategoryTab == 'CONGLOMERATE' &&
          item.job.sourceCategory != SourceCategory.conglomerate) {
        return false;
      }
      if (_activeCategoryTab == 'EXCLUSIVE' && !item.job.isCompanyExclusive) {
        return false;
      }

      // 3. Search query check
      if (_searchQuery.isNotEmpty) {
        final content =
            '${item.job.company} ${item.job.title} ${item.job.canonicalRole} ${item.job.location} ${item.job.tags.join(" ")}'
                .toLowerCase();
        if (!content.contains(_searchQuery)) {
          return false;
        }
      }

      return true;
    }).toList()
      ..sort((a, b) => b.matchScore.totalScore.compareTo(a.matchScore.totalScore));
  }

  int get totalExcludedCount {
    final passport = currentPassport;
    return _allJobs.where((j) {
      return _evaluateHardFiltersUseCase.execute(passport, j).isExcluded;
    }).length;
  }
}
