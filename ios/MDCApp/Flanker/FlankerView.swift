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
  private lazy var textLabel: UILabel = {
    let label = UILabel()
    label.translatesAutoresizingMaskIntoConstraints = false
    label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    label.textAlignment = .center
    label.textColor = .black
    label.font = .systemFont(ofSize: 50.0, weight: .regular)
    label.text = "-----"
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

  private lazy var leftButton: UIButton = {
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    button.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
    button.layer.cornerRadius = 5.0
    button.setTitle("<", for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: 50.0, weight: .regular)
    button.addTarget(self, action: #selector(leftButtonAction), for: .touchDown)
    button.setTitleColor(.gray, for: .highlighted)
    button.isEnabled = false
    return button
  }()
  
  private lazy var rightButton: UIButton = {
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    button.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
    button.layer.cornerRadius = 5.0
    button.setTitle(">", for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: 50.0, weight: .regular)
    button.addTarget(self, action: #selector(rightButtonAction), for: .touchDown)
    button.setTitleColor(.gray, for: .highlighted)
    button.isEnabled = false
    return button
  }()

  private lazy var finishView: ResultView = {
    let view = ResultView()
    view.translatesAutoresizingMaskIntoConstraints = false
    return view
  }()
  private let gameManager = GameManager()
  var typeResult: ButtonType = .ok
  var isLast: Bool = false
  @objc var onEndGame: RCTBubblingEventBlock?
  @objc var onUpdate: RCTDirectEventBlock?

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupConstraint()
    timeLabel.isHidden = true
    finishView.isHidden = true
    gameManager.delegate = self
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  func parameterGame() {
    DispatchQueue.main.async {
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
    self.addSubview(textLabel)
    self.addSubview(timeLabel)
    self.addSubview(leftButton)
    self.addSubview(rightButton)
    self.addSubview(finishView)

    NSLayoutConstraint.activate([
      timeLabel.topAnchor.constraint(equalTo: self.topAnchor, constant: 50),
      timeLabel.centerXAnchor.constraint(equalTo: self.centerXAnchor),

      textLabel.leftAnchor.constraint(equalTo: self.leftAnchor),
      textLabel.rightAnchor.constraint(equalTo: self.rightAnchor),
      textLabel.centerYAnchor.constraint(equalTo: self.centerYAnchor),

      leftButton.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -50),
      leftButton.rightAnchor.constraint(equalTo: self.centerXAnchor, constant: -10),
      leftButton.leftAnchor.constraint(equalTo: self.leftAnchor, constant: 50),
      leftButton.heightAnchor.constraint(equalToConstant: 90),

      rightButton.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -50),
      rightButton.leftAnchor.constraint(equalTo: self.centerXAnchor, constant: 10),
      rightButton.rightAnchor.constraint(equalTo: self.rightAnchor, constant: -50),
      rightButton.heightAnchor.constraint(equalToConstant: 90),

      finishView.leadingAnchor.constraint(equalTo: self.leadingAnchor),
      finishView.trailingAnchor.constraint(equalTo: self.trailingAnchor),
      finishView.topAnchor.constraint(equalTo: self.topAnchor),
      finishView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
    ])
  }

  @objc func leftButtonAction(sender: UIButton!) {
    gameManager.checkedAnswer(button: .left)
  }

  @objc func rightButtonAction(sender: UIButton!) {
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

  func updateText(text: String, color: UIColor, font: UIFont, isStart: Bool) {
    textLabel.font = font
    textLabel.text = text
    textLabel.textColor = color
    gameManager.setEndTimeViewingImage(time: Date(), isStart: isStart)
  }

  func updateTitleButton(left: String, right: String) {
    leftButton.setTitle(left, for: .normal)
    rightButton.setTitle(right, for: .normal)
  }

  func resultTest(avrgTime: Int?, procentCorrect: Int?, data: FlankerModel?, dataArray: [FlankerModel]?) {
    guard let onEndGame = self.onEndGame else { return }
    if let data = data {
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
      gameManager.stopGame()
      finishView.configureView(text: "nvklfsdnblkvndflbnlkdfn", typeButton: typeResult, avrgTime: avrgTime, procentCorrect: procentCorrect, isLast: isLast) {
        guard
          let jsonData = try? JSONEncoder().encode(dataArray),
          let json = String(data: jsonData, encoding: .utf8)
        else { return }

        let result: [String: Any] = ["type": "finish", "data": json, "correctAnswers": procentCorrect]
        onEndGame(result)
      }
      finishView.isHidden = false
    }
  }
}
