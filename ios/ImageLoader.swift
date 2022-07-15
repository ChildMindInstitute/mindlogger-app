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

    var imageURL: URL?

    let activityIndicator = UIActivityIndicatorView()

    var closureDate: ((CFTimeInterval) -> Void)? = nil

    var image: UIImage?  {
        didSet {
            self.setNeedsDisplay()
        }
    }

  override func draw(_ rect: CGRect) {




    print("Marker Draw Start: \(CACurrentMediaTime())")
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
      UIGraphicsEndImageContext()

      if #available(iOS 10.0, *) {
        super.draw(rect)
        print("MarkerDate: endDraw: \(CACurrentMediaTime())")
      }
      DispatchQueue.main.async {
        print("Marker Draw End: \(CACurrentMediaTime())")
      }
    }

    let date = CACurrentMediaTime()

    closureDate?(date)

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
