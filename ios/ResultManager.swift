//
//  ResultManager.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 28.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

class ResultManager {
  static let shared = ResultManager()
  private(set) var oneGameDataResult: [FlankerModel] = []

  func addStepData(data: FlankerModel) {
    oneGameDataResult.append(data)
  }

  func cleanData() {
    oneGameDataResult = []
  }
}
