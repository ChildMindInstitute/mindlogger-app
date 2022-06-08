//
//  FlankerModel.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 28.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

struct FlankerModel: Codable {
  var button_pressed: Int?
  var correct: Bool
  var correctChoice: Int
  var endTime: Int
  var image_time: Int
  var internal_node_id: String
  var rt: Int
  var start_time: Int
  var start_timestamp: Int
  var stimulus: String
  var tag: String
  var time_elapsed: Int
  var trial_index: Int
  var trial_type: String
}
