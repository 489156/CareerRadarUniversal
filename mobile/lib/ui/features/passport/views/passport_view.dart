import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/models/career_passport.dart';
import '../view_models/passport_view_model.dart';

class PassportView extends StatefulWidget {
  final PassportViewModel viewModel;

  const PassportView({super.key, required this.viewModel});

  @override
  State<PassportView> createState() => _PassportViewState();
}

class _PassportViewState extends State<PassportView> {
  late TextEditingController roleController;
  late TextEditingController yearsController;
  late TextEditingController baseSalaryController;
  late TextEditingController allowanceController;
  late TextEditingController locationController;

  @override
  void initState() {
    super.initState();
    _initControllers();
  }

  void _initControllers() {
    final p = widget.viewModel.passport;
    roleController = TextEditingController(text: p.canonicalRole);
    yearsController = TextEditingController(text: p.totalYears.toString());
    baseSalaryController = TextEditingController(text: p.baseSalary.toString());
    allowanceController = TextEditingController(text: p.fixedAllowance.toString());
    locationController = TextEditingController(text: p.homeLocation);
  }

  @override
  void dispose() {
    roleController.dispose();
    yearsController.dispose();
    baseSalaryController.dispose();
    allowanceController.dispose();
    locationController.dispose();
    super.dispose();
  }

  void _save() {
    final p = widget.viewModel.passport;
    final updated = p.copyWith(
      canonicalRole: roleController.text.trim(),
      totalYears: int.tryParse(yearsController.text.trim()) ?? p.totalYears,
      baseSalary: int.tryParse(baseSalaryController.text.trim()) ?? p.baseSalary,
      fixedAllowance: int.tryParse(allowanceController.text.trim()) ?? p.fixedAllowance,
      homeLocation: locationController.text.trim(),
    );
    widget.viewModel.updatePassport(updated);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Career Passport가 저장되었습니다.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.viewModel,
      builder: (context, _) {
        final p = widget.viewModel.passport;
        final mv = widget.viewModel.marketValue;

        return Scaffold(
          appBar: AppBar(
            title: const Text('🪪 Career Passport'),
            actions: [
              IconButton(
                icon: const Icon(Icons.check, color: AppTheme.emerald),
                tooltip: '저장',
                onPressed: _save,
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Market Value Card (Estimated Market Value with basis)
                if (mv != null) ...[
                  Card(
                    color: AppTheme.surface,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: AppTheme.primary, width: 1.2),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Text(
                                    '💰 내 시장 가치 추정 (P25~P75)',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.accent,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  '산정 근거 포함',
                                  style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primary),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            mv.rangeDisplay,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textWhite,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            mv.cohortDescription,
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                          const Divider(color: AppTheme.border, height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildPercentileItem('P10 (하위)', '${mv.p10}만'),
                              _buildPercentileItem('P25 (중하)', '${mv.p25}만'),
                              _buildPercentileItem('P50 (중위)', '${mv.p50}만'),
                              _buildPercentileItem('P75 (상위)', '${mv.p75}만'),
                              _buildPercentileItem('P90 (최상위)', '${mv.p90}만'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Profile Edit Section
                const Text(
                  '기본 경력 및 보상 원장',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textWhite,
                  ),
                ),
                const SizedBox(height: 12),

                // Occupation Selector
                DropdownButtonFormField<OccupationType>(
                  value: p.occupation,
                  decoration: const InputDecoration(labelText: '직군 (Occupation)'),
                  dropdownColor: AppTheme.cardElevated,
                  items: OccupationType.values.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(type.label, style: const TextStyle(color: AppTheme.textWhite)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      widget.viewModel.updatePassport(p.copyWith(occupation: val));
                    }
                  },
                ),
                const SizedBox(height: 12),

                // Role
                TextField(
                  controller: roleController,
                  decoration: const InputDecoration(labelText: '세부 직무 (Role)'),
                ),
                const SizedBox(height: 12),

                // Years
                TextField(
                  controller: yearsController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: '총 경력 연차',
                    suffixText: '년차',
                  ),
                ),
                const SizedBox(height: 12),

                // Base Salary & Allowance
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: baseSalaryController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: '기본급 (만 원)',
                          suffixText: '만원',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: allowanceController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: '고정 수당 (만 원)',
                          suffixText: '만원',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Home Location
                TextField(
                  controller: locationController,
                  decoration: const InputDecoration(labelText: '거주지 (통근 계산 기준)'),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      '패스포트 저장 및 레이더 동기화',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPercentileItem(String title, String val) {
    return Column(
      children: [
        Text(title, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        const SizedBox(height: 2),
        Text(
          val,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppTheme.textWhite,
          ),
        ),
      ],
    );
  }
}
