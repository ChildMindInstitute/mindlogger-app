//
//  ParameterGameManager.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 28.06.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

class ParameterGameManager {
  static let shared = ParameterGameManager()
  private var allParameters: ParameterModel?

  func setJsonWithParameters(json: String) {
    guard
      let jsonData = json.data(using: .utf8),
      let parameters: ParameterModel = try? JSONDecoder().decode(ParameterModel.self, from: jsonData)
    else { return }
    allParameters = parameters
  }

  func getParameters() -> ParameterModel? {
    return allParameters
  }
}
