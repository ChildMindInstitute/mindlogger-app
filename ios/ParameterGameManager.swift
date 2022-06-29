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
  var fixationImage: UIImageView?

  func setJsonWithParameters(json: String) {
    guard
      let jsonData = json.data(using: .utf8),
      let parameters: ParameterModel = try? JSONDecoder().decode(ParameterModel.self, from: jsonData)
    else { return }
    allParameters = parameters
    loadAllImage()
  }

  func getParameters() -> ParameterModel? {
    return allParameters
  }

//  func handleImageFixations() {
//    guard let allParameters = allParameters, let url = URL(string: allParameters.fixation) else { return }
//
//    self.fixationImage = UIImageView()
//    fixationImage?.downloaded(from: url)
//  }

  func loadAllImage() {
    guard let allParameters = allParameters else { return }

    if let url = URL(string: allParameters.fixation) {
      ImageLoader().loadImageWithUrl(url)
    }

    allParameters.trials.forEach { trial in
      if let url = URL(string: trial.stimulus.en) {
        ImageLoader().loadImageWithUrl(url)
      }
      trial.choices.forEach { choice in
        if let url = URL(string: choice.name.en) {
          ImageLoader().loadImageWithUrl(url)
        }
      }
    }
  }
}
