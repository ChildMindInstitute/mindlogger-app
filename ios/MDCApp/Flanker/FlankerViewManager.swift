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
  private var arrayPages: [FlankerView] = []
  private var count = 1
  private var countDelegate = 1
  private var lastIndex = 1
  private var lastType = 0
  private var countType = 0
  private var isUpdate = false
  
  override func view() -> UIView! {
    countDelegate = 1
    lastIndex = 1
    lastType = 0
    countType = 0
    isUpdate = false
    let view = FlankerView()
    if count == 1 { arrayPages = [] }
    arrayPages.append(view)
    count += 1
    return view
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func parameterGameType(_ blockType: Int, json: String) {
    print("BlockType: \(blockType)")
    ParameterGameManager.shared.setJsonWithParameters(json: json)

    if lastType == blockType {
      countType += 1
    } else {
      isUpdate = true
    }
    lastType = blockType
  }

  @objc
  func parameterGame(_ isShowAnswers: Bool, countGame: Int, index: Int) {

    count = 1

    var indexPath = arrayPages.count - countDelegate
    if isUpdate && countDelegate < 4 {
      isUpdate = false
      indexPath = 2
      countDelegate = arrayPages.count - indexPath
    }
    if lastIndex < index {
      indexPath += 1
    } else {
      countDelegate += 1
    }

    let view  = arrayPages[indexPath]
    var isShowFeedback = true
    if lastType == 1 { isShowFeedback = false }
    if indexPath + 1 == arrayPages.count || lastIndex < index {
      view.typeResult = .ok
      index == 3 ? (view.isLast = true) : (view.isLast = false)
    } else if indexPath == 0 {
      view.typeResult = .finish
    } else if lastType == 0 &&  indexPath == 4 {
      view.typeResult = .ok
    } else {
      view.typeResult = .next
    }
    view.parameterGame()
    lastIndex = index
  }
}
