//
//  CustomText.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 08.07.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

class CustomText: UILabel {
  var closureDate: ((CFTimeInterval) -> Void)? = nil

  override func draw(_ rect: CGRect) {
    let date = CACurrentMediaTime()
    print("Marker: layerWillDraw: time captured: \(date)")
    closureDate?(date)
    if #available(iOS 10.0, *) {
      super.draw(rect)
    }
  }
}
