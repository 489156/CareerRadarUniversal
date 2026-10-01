import 'package:flutter/foundation.dart';
import '../../../../domain/use_cases/scan_labor_risk_use_case.dart';

class ScannerViewModel extends ChangeNotifier {
  final ScanLaborRiskUseCase _scanLaborRiskUseCase;

  String _inputContractText = '';
  LaborRiskResult? _result;
  bool _isScanning = false;

  ScannerViewModel({required ScanLaborRiskUseCase scanLaborRiskUseCase})
      : _scanLaborRiskUseCase = scanLaborRiskUseCase;

  String get inputContractText => _inputContractText;
  LaborRiskResult? get result => _result;
  bool get isScanning => _isScanning;

  void setContractText(String text) {
    _inputContractText = text;
    notifyListeners();
  }

  void scanContract() {
    if (_inputContractText.trim().isEmpty) return;

    _isScanning = true;
    notifyListeners();

    _result = _scanLaborRiskUseCase.execute(_inputContractText);
    _isScanning = false;
    notifyListeners();
  }

  void loadSample(int sampleNumber) {
    if (sampleNumber == 1) {
      _inputContractText = '''
[근로계약서 - 스타트업 샘플]
제5조 (임금 및 제수당)
1. 을의 연봉은 4,800만 원으로 하며, 기본급과 월 32시간분의 고정연장근로수당(포괄임금)이 포함된 것으로 한다.
2. 회사의 사정으로 인한 연장·야간·휴일근로에 대하여는 별도의 가산수당을 청구하지 아니한다.
제9조 (퇴직 및 손해배상)
을이 입사 후 1년 이내에 중도 퇴사할 경우, 회사가 지출한 온보딩 및 교육훈련비 명목으로 500만 원을 위약금으로 반환 배상하여야 한다.
''';
    } else if (sampleNumber == 2) {
      _inputContractText = '''
[연봉계약서 - 퇴직금 분할지급 샘플]
제3조 (임금의 구성)
월 급여 350만 원에는 기본급 280만 원, 식대 20만 원, 퇴직적립금 50만 원이 매월 분할 산입되어 지급된 것으로 본다.
퇴사 시 을은 기지급된 퇴직금에 대하여 추가적인 법정퇴직금을 청구할 수 없다.
''';
    } else {
      _inputContractText = '''
[표준근로계약서 - 정상 공공/대기업 샘플]
제4조 (임금 및 근로조건)
1. 기본급: 월 450만 원 (통상시급 계산 기준)
2. 법정 연장, 야간, 휴일근로는 사전 승인 하에 실시하며 근로기준법 제56조에 따라 50%를 가산하여 실시간 정산 지급한다.
3. 퇴직급여는 근로자퇴직급여보장법에 따라 확정기여형(DC) 퇴직연금 계좌로 매년 정기 납입한다.
''';
    }
    scanContract();
  }
}
