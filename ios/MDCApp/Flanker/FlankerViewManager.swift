//
//  TestViewManager.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 21.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

@objc(RCTFlankerViewManager)
class FlankerViewManager: RCTViewManager {
  private let resultManeger = ResultManager.shared
  private var viewTest1: FlankerView?
  private var viewTest2: FlankerView?
  private var viewTest3: FlankerView?
  private var viewTest4: FlankerView?
  var count = 1
  var countDelegate = 1
  override func view() -> UIView! {
    if count >= 5 { count = 1 }
    let view = FlankerView()
    switch count {
    case 1:
      viewTest1 = view
      count += 1
      countDelegate = 1
    case 2:
      viewTest2 = view
      count += 1
    case 3:
      viewTest3 = view
      count += 1
    case 4:
      viewTest4 = view
      count += 1
    default:
      break
    }

    return view
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func parameterGame(_ isShowAnswers: Bool, countGame: Int, index: Int) {
    if index == 1 && countDelegate >= 7 { countDelegate = 1}
    if index == 1 && countDelegate > 1 && countDelegate < 4 { countDelegate = 4}
    switch countDelegate {
    case 1...3:
      viewTest4?.typeResult = .ok
      viewTest4?.parameterGame(isShowAnswers: isShowAnswers, countGame: 30)
      countDelegate += 1
    case 4:
      viewTest3?.typeResult = .next
      viewTest3?.parameterGame(isShowAnswers: false, countGame: 120)
      countDelegate += 1
    case 5:
      viewTest2?.typeResult = .next
      viewTest2?.parameterGame(isShowAnswers: false, countGame: 120)
      countDelegate += 1
    case 6:
      viewTest1?.typeResult = .next
      viewTest1?.parameterGame(isShowAnswers: false, countGame: 120)
      countDelegate += 1
    default:
      break
    }
  }
}
