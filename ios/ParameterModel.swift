//
//  ParameterModel.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 28.06.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

struct ParameterModel: Decodable {
  let fixationDuration: Double
  let fixation: String
  let showFixation: Bool
  let showFeedback: Bool
  let showResults: Bool
  let trialDuration: Double
  let samplingMethod: String
  let samplingSize: Int
  let buttonLabel: String
  let continueText: [String]
  let restartText: [String]
  let trials: [TrialsModel]
}

struct TrialsModel: Decodable {
  let id: String
  let stimulus: StimulusModel
  let correctChoice: Int
  let weight: Int
  let choices: [ChoicesModel]
}

struct StimulusModel: Decodable {
  let en: String
}

struct ChoicesModel: Decodable {
  let value: Int
  let name: StimulusModel
}
