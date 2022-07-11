//
//  TestView.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 21.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import UIKit

class FlankerView: UIView {
  static let shared = FlankerView()
  private lazy var textLabel: CustomText = {
    let label = CustomText()
    label.translatesAutoresizingMaskIntoConstraints = false
    label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    label.textAlignment = .center
    label.textColor = .black
    label.font = .systemFont(ofSize: 50.0, weight: .regular)
    label.text = "-----"
    label.closureDate = { date in
      guard let typeTimeStamp = self.typeTimeStamp else { return }
      self.testStart = date
    }
    return label
  }()

  private lazy var timeLabel: UILabel = {
    let label = UILabel()
    label.translatesAutoresizingMaskIntoConstraints = false
    label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    label.textAlignment = .center
    label.font = .systemFont(ofSize: 50.0, weight: .regular)
    label.text = "0"
    label.textColor = .black
    return label
  }()

  private lazy var fixationImage: ImageLoader = {
    let imageView = ImageLoader()
    imageView.translatesAutoresizingMaskIntoConstraints = false
    imageView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    imageView.contentMode = .scaleAspectFit
    imageView.layer.cornerRadius = 5.0
    imageView.closureDate = { date in
      guard let typeTimeStamp = self.typeTimeStamp else { return }
      self.testStart = date
    }
    return imageView
  }()

  private lazy var leftButton: UIButton = {
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    button.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
    button.layer.cornerRadius = 5.0
    button.setTitle("<", for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: UIDevice.current.userInterfaceIdiom == .phone ? 25.0 : 35.0, weight: .regular)
    button.addTarget(self, action: #selector(leftButtonAction), for: .touchDown)
    button.setTitleColor(.gray, for: .highlighted)
    button.isEnabled = false
    button.contentHorizontalAlignment = .fill
    button.contentVerticalAlignment = .fill
    return button
  }()
  
  private lazy var rightButton: UIButton = {
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    button.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
    button.layer.cornerRadius = 5.0
    button.setTitle(">", for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: UIDevice.current.userInterfaceIdiom == .phone ? 25.0 : 35.0, weight: .regular)
    button.addTarget(self, action: #selector(rightButtonAction), for: .touchDown)
    button.setTitleColor(.gray, for: .highlighted)
    button.isEnabled = false
    button.contentHorizontalAlignment = .fill
    button.contentVerticalAlignment = .fill
    return button
  }()

  private lazy var buttonStackView: UIStackView = {
    let stackView = UIStackView()
    stackView.axis = .horizontal
    stackView.translatesAutoresizingMaskIntoConstraints = false
    stackView.backgroundColor = .clear
    stackView.addArrangedSubview(leftButton)
    stackView.addArrangedSubview(rightButton)
    stackView.spacing = 20
    stackView.distribution = .fillEqually
    return stackView
  }()

  private lazy var finishView: ResultView = {
    let view = ResultView()
    view.translatesAutoresizingMaskIntoConstraints = false
    return view
  }()
  private let gameManager = GameManager()
  private var typeTimeStamp: TypeTimeStamps?
  private var lastTimeStamp: Double?
  private var displayLink: CADisplayLink?
  var typeResult: ButtonType = .ok
  var isLast: Bool = false
  @objc var onEndGame: RCTBubblingEventBlock?
  @objc var onUpdate: RCTDirectEventBlock?

  var testStart: CFTimeInterval?

  @objc var dataJson: NSString? {
    didSet {
      ParameterGameManager.shared.loadAllImage(dataJson: String(dataJson ?? ""))
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupConstraint()
    timeLabel.isHidden = true
    finishView.isHidden = true
    leftButton.isHidden = true
    rightButton.isHidden = true
    textLabel.isHidden = true
    gameManager.delegate = self
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  func createDisplayLink() {
    displayLink = CADisplayLink(target: self, selector: #selector(step))
    displayLink?.isPaused = true
    displayLink?.add(to: .current, forMode: RunLoop.Mode.default)
  }

  @objc func step(displaylink: CADisplayLink) {
    guard let displayLink = displayLink, let testStart = testStart, let typeTimeStamp = typeTimeStamp else { return }
    if #available(iOS 10.0, *) {
      let delta = displayLink.timestamp - testStart
      if delta < 0 { return }
      if delta < displaylink.duration {
        self.displayLink?.isPaused = true
        self.gameManager.setEndTimeViewingImage(time: testStart, isStart: true, type: typeTimeStamp)
        self.gameManager.setEndTimeViewingImage(time: displayLink.targetTimestamp, isStart: false, type: typeTimeStamp)
      } else {
        self.displayLink?.isPaused = true
        self.gameManager.setEndTimeViewingImage(time: testStart, isStart: true, type: typeTimeStamp)
        self.gameManager.setEndTimeViewingImage(time: displayLink.timestamp, isStart: false, type: typeTimeStamp)
      }
    }
  }


  func parameterGame() {
    DispatchQueue.main.async {
      self.createDisplayLink()
      self.finishView.isHidden = true
      self.gameManager.parameterGame()
    }
  }
  
  func setText(text: String, color: UIColor = .black) {
    textLabel.text = text
    textLabel.textColor = color
  }

  func setTime(text: String) {
    timeLabel.text = text
  }

  func isEnableButton(isEnable: Bool) {
    leftButton.isEnabled = isEnable
    rightButton.isEnabled = isEnable
  }

  private func setupConstraint() {
    addSubview(textLabel)
    addSubview(timeLabel)
    addSubview(buttonStackView)
    addSubview(finishView)
    addSubview(fixationImage)

    NSLayoutConstraint.activate([
      timeLabel.topAnchor.constraint(equalTo: self.topAnchor, constant: 50),
      timeLabel.centerXAnchor.constraint(equalTo: self.centerXAnchor),

      textLabel.leftAnchor.constraint(equalTo: self.leftAnchor),
      textLabel.rightAnchor.constraint(equalTo: self.rightAnchor),
      textLabel.bottomAnchor.constraint(equalTo: leftButton.topAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? -60: -120),
      textLabel.topAnchor.constraint(equalTo: self.topAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? 60 : 120),

      fixationImage.leftAnchor.constraint(equalTo: self.leftAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? 60 : 120),
      fixationImage.trailingAnchor.constraint(equalTo: self.trailingAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? -60: -120),
      fixationImage.bottomAnchor.constraint(equalTo: leftButton.topAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? -60: -120),
      fixationImage.topAnchor.constraint(equalTo: self.topAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? 60 : 120),

      buttonStackView.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -50),
      buttonStackView.rightAnchor.constraint(equalTo: self.rightAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? -30 : -100),
      buttonStackView.leftAnchor.constraint(equalTo: self.leftAnchor, constant: UIDevice.current.userInterfaceIdiom == .phone ? 30 : 100),
      buttonStackView.heightAnchor.constraint(equalToConstant: UIDevice.current.userInterfaceIdiom == .phone ? 50 : 90),

      finishView.leadingAnchor.constraint(equalTo: self.leadingAnchor),
      finishView.trailingAnchor.constraint(equalTo: self.trailingAnchor),
      finishView.topAnchor.constraint(equalTo: self.topAnchor),
      finishView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
    ])
  }

  @objc func leftButtonAction(sender: UIButton!) {
    gameManager.setEndTimeViewingImage(time: CACurrentMediaTime(), isStart: false, type: .response)
    gameManager.checkedAnswer(button: .left)
  }

  @objc func rightButtonAction(sender: UIButton!) {
    gameManager.setEndTimeViewingImage(time: CACurrentMediaTime(), isStart: false, type: .response)
    gameManager.checkedAnswer(button: .right)
  }
}

extension FlankerView: GameManagerProtocol {
  func setEnableButton(isEnable: Bool) {
    leftButton.isEnabled = isEnable
    rightButton.isEnabled = isEnable
  }

  func updateTime(time: String) {
    timeLabel.text = time
  }

  func updateText(text: String, color: UIColor, font: UIFont, isStart: Bool, typeTime: TypeTimeStamps) {
    typeTimeStamp = typeTime
    textLabel.font = font
    textLabel.text = text
    textLabel.textColor = color
    textLabel.setNeedsDisplay()
    displayLink?.isPaused = false
    textLabel.isHidden = false
    fixationImage.isHidden = true
  }

  func updateTitleButton(left: String?, right: String?, leftImage: URL?, rightImage: URL?, countButton: Int) {
    leftButton.isHidden = false
    if countButton == 2 {
      rightButton.isHidden = false

      if let left = left, let right = right {
        leftButton.setImage(nil, for: .normal)
        rightButton.setImage(nil, for: .normal)
        leftButton.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
        rightButton.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
        leftButton.setTitle(left, for: .normal)
        leftButton.titleLabel?.textAlignment = .center
        rightButton.setTitle(right, for: .normal)
        rightButton.titleLabel?.textAlignment = .center
      } else if let leftImage = leftImage, let rightImage = rightImage {
        let left = ImageLoader()
        left.loadImageWithUrl(leftImage)
        let right = ImageLoader()
        right.loadImageWithUrl(rightImage)
        leftButton.setTitle(nil, for: .normal)
        leftButton.backgroundColor = .clear
        leftButton.setImage(left.image, for: .normal)
        leftButton.setImage(left.image, for: .disabled)
        leftButton.imageView?.contentMode = .scaleAspectFill
        leftButton.imageView?.layer.cornerRadius = 5.0

        rightButton.setTitle(nil, for: .normal)
        rightButton.backgroundColor = .clear
        rightButton.setImage(right.image, for: .normal)
        rightButton.setImage(right.image, for: .disabled)
        rightButton.imageView?.contentMode = .scaleAspectFill
        rightButton.imageView?.layer.cornerRadius = 5.0
      }
    } else {
      if let left = left {
        leftButton.setImage(nil, for: .normal)
        leftButton.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
        leftButton.setTitle(left, for: .normal)
        leftButton.titleLabel?.textAlignment = .center
      } else if let leftImage = leftImage {
        let left = ImageLoader()
        left.loadImageWithUrl(leftImage)
        leftButton.setTitle(nil, for: .normal)
        leftButton.backgroundColor = .clear
        leftButton.setImage(left.image, for: .normal)
        leftButton.setImage(left.image, for: .disabled)
        leftButton.imageView?.contentMode = .scaleAspectFit
        leftButton.imageView?.layer.cornerRadius = 5.0
      }
    }
  }

  func updateFixations(image: URL?, isStart: Bool, typeTime: TypeTimeStamps) {
    if let url = image {
      typeTimeStamp = typeTime
      textLabel.isHidden = true
      textLabel.setNeedsDisplay()
      displayLink?.isPaused = false
      fixationImage.isHidden = false
      fixationImage.loadImageWithUrl(url)
    }
  }

  func resultTest(avrgTime: Int?, procentCorrect: Int?, data: FlankerModel?, dataArray: [FlankerModel]?, isShowResults: Bool, minAccuracy: Int) {
    guard let onEndGame = self.onEndGame else { return }
    if let data = data {
      print("DataTest: \(data)")
      guard
        let jsonData = try? JSONEncoder().encode(data),
        let json = String(data: jsonData, encoding: .utf8)
      else { return }

      let result: [String: Any] = ["type": "response", "data": json]
      onEndGame(result)
    } else if
      let dataArray = dataArray,
      let avrgTime = avrgTime,
      let procentCorrect = procentCorrect {
      if isShowResults {
        fixationImage.isHidden = true
        finishView.configureView(text: "nvklfsdnblkvndflbnlkdfn", typeButton: typeResult, avrgTime: avrgTime, procentCorrect: procentCorrect, minAccuracy: minAccuracy, isLast: isLast) {
          guard
            let jsonData = try? JSONEncoder().encode(dataArray),
            let json = String(data: jsonData, encoding: .utf8)
          else { return }

          let result: [String: Any] = ["type": "finish", "data": json, "correctAnswers": procentCorrect]
          onEndGame(result)
        }
        finishView.isHidden = false
      } else {
        guard
          let jsonData = try? JSONEncoder().encode(dataArray),
          let json = String(data: jsonData, encoding: .utf8)
        else { return }

        let result: [String: Any] = ["type": "finish", "data": json, "correctAnswers": procentCorrect]
        onEndGame(result)
      }
    }
  }
}
