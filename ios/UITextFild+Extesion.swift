//
//  UITextFild+Extesion.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 27.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

extension UITextView {
  func centerVertically() {
    let fittingSize = CGSize(width: bounds.width, height: CGFloat.greatestFiniteMagnitude)
    let size = sizeThatFits(fittingSize)
    let topOffset = (bounds.size.height - size.height * zoomScale) / 2
    let positiveTopOffset = max(1, topOffset)
    textContainerInset.top = positiveTopOffset
  }
}
