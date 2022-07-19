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
  var isShowPixel: Bool = false
  
  private lazy var pixelView: UIView = {
    let view = UIView()
    view.translatesAutoresizingMaskIntoConstraints = false
    view.backgroundColor = .gray
    view.isHidden = true
    return view
  }()

  override func draw(_ rect: CGRect) {
    let date = CACurrentMediaTime()
    print("Marker: layerWillDraw: time captured: \(date)")
    closureDate?(date)
    if #available(iOS 10.0, *) {
      super.draw(rect)
    }
    if isShowPixel {
      pixelView.frame = CGRect(x: bounds.minX, y: bounds.maxY, width: 15, height: 15)
      pixelView.backgroundColor = UIColor.gray.withAlphaComponent(CGFloat.random(in: 0.1..<1.0))
      pixelView.isHidden = false
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    configureConstraint()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  func hidePixel() {
    pixelView.isHidden = true
  }

  private func configureConstraint() {
    self.addSubview(pixelView)
//    NSLayoutConstraint.activate([
//      pixelView.topAnchor.constraint(equalTo: self.bottomAnchor),
//      pixelView.leftAnchor.constraint(equalTo: self.leftAnchor),
//      pixelView.widthAnchor.constraint(equalToConstant: 5),
//      pixelView.heightAnchor.constraint(equalToConstant: 5)
//    ])
  }
}
