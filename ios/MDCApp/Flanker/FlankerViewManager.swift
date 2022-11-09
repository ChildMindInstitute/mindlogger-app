import Foundation

@objc(RCTFlankerViewManager)
class FlankerViewManager: RCTViewManager {
  private let resultManeger = ResultManager.shared
  private var flankerView: FlankerView? = nil
    
  override func view() -> UIView! {
    flankerView = FlankerView()
    return flankerView
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func setGameParameters(_ json: String) {
    ParameterGameManager.shared.setJsonWithParameters(json: json)
  }

  @objc
  func preloadGameImages(_ json: String) {
    ParameterGameManager.shared.loadAllImage(dataJson: json)
  }

  @objc
  func startGame(_ isFirst: Bool, isLast: Bool) {
    if isFirst {
      flankerView!.typeResult = .ok
      flankerView!.isLast = false // todo - review if we need to use this
    } else if isLast {
      flankerView!.typeResult = .finish
    } else {
      flankerView!.typeResult = .next
    }
    flankerView!.parameterGame()
  }
}