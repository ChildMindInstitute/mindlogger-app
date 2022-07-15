//
//  CustomButton.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 12.07.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

class CustomButton: UIButton {
  var closureDate: ((CFTimeInterval) -> Void)? = nil

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    let arrayTouch = event?.coalescedTouches(for: touches.first!)
    if let timeInterval = arrayTouch?.first?.timestamp {
      closureDate?(timeInterval)
    } else {
      closureDate?(CACurrentMediaTime())
    }
    super.touchesBegan(touches, with: event)
    tintColor = .black
    isSelected = true
    setTitleColor(.gray, for: .normal)
  }

  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    isSelected = false
    setTitleColor(.white, for: .normal)
  }
}
