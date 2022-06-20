//
//  FlankerModel.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 28.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

struct FlankerModel: Codable {
  var rt: Double
  var stimulus: String
  var button_pressed: String?
  var image_time: Double
  var correct: Bool?
  var start_timestamp: Double
  var tag: String
  var trial_index: Int
  var start_time: Double
}
