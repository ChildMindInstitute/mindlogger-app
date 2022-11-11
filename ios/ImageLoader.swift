//
//  ImageLoader.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 29.06.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import UIKit
import Foundation

let imageCache = NSCache<AnyObject, AnyObject>()

class ImageLoader: UIView {
  var isShowPixel: Bool = false

  private lazy var pixelView: UIView = {
    let view = UIView()
    view.translatesAutoresizingMaskIntoConstraints = false
    view.backgroundColor = .gray

    view.isHidden = true
    return view
  }()

  var imageURL: URL?

  let activityIndicator = UIActivityIndicatorView()

  var closureDate: ((CFTimeInterval) -> Void)? = nil

  var image: UIImage?  {
    didSet {
      self.setNeedsDisplay()
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    self.addSubview(pixelView)
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  override func draw(_ rect: CGRect) {
    guard let ctx = UIGraphicsGetCurrentContext() else { return }

    ctx.addRect(bounds)
    ctx.setFillColor(UIColor.white.cgColor)
    ctx.fillPath()

    if let im = image {
      let scale: CGFloat
      if im.size.width >= im.size.height {
        scale = bounds.width / im.size.width
      } else {
        scale = bounds.height / im.size.height
      }

      let size = CGSize(width: im.size.width * scale, height: im.size.height * scale)

      UIGraphicsBeginImageContextWithOptions(size, true, 1)
      guard let imgCtx = UIGraphicsGetCurrentContext() else { return }

      imgCtx.setFillColor(UIColor.white.cgColor)
      UIColor.white.setFill()
      imgCtx.fill(rect)
      im.draw(in: CGRect(x: 0, y: 0, width: size.width, height: size.height))

      guard let cgImg = imgCtx.makeImage() else { return }
      ctx.scaleBy(x: 1, y: -1)
      ctx.translateBy(x: 0, y: -bounds.height)
      ctx.setFillColor(UIColor.white.cgColor)
      ctx.fillPath()
      ctx.draw(cgImg, in: CGRect(x: (bounds.width - size.width) / 2, y: (bounds.height - size.height) / 2, width: size.width, height: size.height))

      if isShowPixel {
        pixelView.frame = CGRect(x: bounds.minX, y: ((bounds.height - size.height) / 2) + size.height, width: 15, height: 15)
        pixelView.backgroundColor = UIColor.gray.withAlphaComponent(CGFloat.random(in: 0.1..<1.0))
        pixelView.isHidden = false
      }
      
      UIGraphicsEndImageContext()

      if #available(iOS 10.0, *) {
        super.draw(rect)
      }
    }

    let date = CACurrentMediaTime()

    closureDate?(date)

  }

  func hidePixel() {
    pixelView.isHidden = true
  }

  func loadImageWithUrl(_ url: URL) {
    // setup activityIndicator...
    activityIndicator.color = .darkGray

    addSubview(activityIndicator)
    activityIndicator.translatesAutoresizingMaskIntoConstraints = false
    activityIndicator.centerXAnchor.constraint(equalTo: centerXAnchor).isActive = true
    activityIndicator.centerYAnchor.constraint(equalTo: centerYAnchor).isActive = true

    imageURL = url

    image = nil
    activityIndicator.startAnimating()

    // retrieves image if already available in cache
    if let imageFromCache = imageCache.object(forKey: url as AnyObject) as? UIImage {

      self.image = imageFromCache
      activityIndicator.stopAnimating()
      return
    }

    // image does not available in cache.. so retrieving it from url...
    URLSession.shared.dataTask(with: url, completionHandler: { (data, response, error) in

      if error != nil {
        print(error as Any)
        DispatchQueue.main.async(execute: {
          self.activityIndicator.stopAnimating()
        })
        return
      }
      
      DispatchQueue.main.async(execute: {

        if let unwrappedData = data, let imageToCache = UIImage(data: unwrappedData) {

          if self.imageURL == url {
            self.image = imageToCache
          }

          imageCache.setObject(imageToCache, forKey: url as AnyObject)
        }
        self.activityIndicator.stopAnimating()
      })
    }).resume()
  }
}
