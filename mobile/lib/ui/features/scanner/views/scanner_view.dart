import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../view_models/scanner_view_model.dart';

class ScannerView extends StatefulWidget {
  final ScannerViewModel viewModel;

  const ScannerView({super.key, required this.viewModel});

  @override
  State<ScannerView> createState() => _ScannerViewState();
}

class _ScannerViewState extends State<ScannerView> {
  late TextEditingController textController;

  @override
  void initState() {
    super.initState();
    textController = TextEditingController(text: widget.viewModel.inputContractText);
  }

  @override
  void dispose() {
    textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.viewModel,
      builder: (context, _) {
        if (textController.text != widget.viewModel.inputContractText) {
          textController.text = widget.viewModel.inputContractText;
        }

        final result = widget.viewModel.result;

        return Scaffold(
          appBar: AppBar(
            title: const Text('⚖️ Labor Risk Scanner'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '근로계약서 / 채용공고 독소조항 정밀 진단',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textWhite,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '포괄임금제, 퇴직금 분할지급, 위약금 조항 등 근로기준법 위반 및 위험 요소를 스캔합니다.',
                  style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
                const SizedBox(height: 12),

                // Sample Buttons
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      OutlinedButton(
                        onPressed: () => widget.viewModel.loadSample(1),
                        child: const Text('샘플: 포괄임금+위약금'),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton(
                        onPressed: () => widget.viewModel.loadSample(2),
                        child: const Text('샘플: 퇴직금 분할'),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton(
                        onPressed: () => widget.viewModel.loadSample(3),
                        child: const Text('샘플: 정상 공공/대기업'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Text Field
                TextField(
                  controller: textController,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    hintText: '공고 본문이나 근로계약서 텍스트를 붙여넣으세요...',
                  ),
                  onChanged: widget.viewModel.setContractText,
                ),
                const SizedBox(height: 12),

                // Scan Button
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: widget.viewModel.scanContract,
                    icon: const Icon(Icons.security, size: 18),
                    label: const Text('계약 위험 진단 실행'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.rose,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Results
                if (result != null) ...[
                  Card(
                    color: AppTheme.surface,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                result.isClean ? '✅ 안심 계약' : '⚠️ 독소 조항 주의',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: result.isClean ? AppTheme.emerald : AppTheme.rose,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: (result.isClean ? AppTheme.emerald : AppTheme.rose)
                                      .withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '위험도 점수: ${result.riskScore}점',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: result.isClean ? AppTheme.emerald : AppTheme.rose,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (result.items.isEmpty)
                            const Text(
                              '감지된 대표적인 법적 독소조항이 없습니다. 표준 근로조건에 부합합니다.',
                              style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                            )
                          else
                            ...result.items.map((item) {
                              Color c = AppTheme.amber;
                              if (item.level == 'DANGER') c = AppTheme.rose;
                              if (item.level == 'INFO') c = AppTheme.accent;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppTheme.cardElevated,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: c.withOpacity(0.4)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(Icons.warning_amber_rounded, size: 16, color: c),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: c,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.description,
                                      style: const TextStyle(
                                          fontSize: 12, color: AppTheme.textWhite),
                                    ),
                                  ],
                                ),
                              );
                            }),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
