import '../../domain/models/job_posting.dart';
import '../services/job_api_service.dart';

class JobRepository {
  final JobApiService _apiService;
  List<JobPosting>? _cachedJobs;

  JobRepository({required JobApiService apiService}) : _apiService = apiService;

  Future<List<JobPosting>> getJobs({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedJobs != null && _cachedJobs!.isNotEmpty) {
      return _cachedJobs!;
    }
    _cachedJobs = await _apiService.fetchAllJobs();
    return _cachedJobs!;
  }

  Future<JobPosting?> getJobById(String id) async {
    final jobs = await getJobs();
    try {
      return jobs.firstWhere((j) => j.id == id);
    } catch (_) {
      return null;
    }
  }
}
