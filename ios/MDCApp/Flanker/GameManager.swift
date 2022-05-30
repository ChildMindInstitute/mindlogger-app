//
//  GameManager.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 21.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

enum SelectedButton {
  case left
  case right
}

enum Constants {
  static let lowTimeInterval: TimeInterval = 0.5
  static let moreTimeInterval: TimeInterval = 3
  static let blueColor: UIColor = UIColor(red: 37, green: 95, blue: 158)
  static let greenColor: UIColor = UIColor(red: 68, green: 133, blue: 87)
  static let redColor: UIColor = UIColor(red: 199, green: 20, blue: 20)
  static let correctText: String = "Correct!"
  static let inCorrectText: String = "Incorrect"
  static let timeRespondText: String = "Respond faster"
  static let bigFont: UIFont = .systemFont(ofSize: 50.0, weight: .bold)
  static let smallFont: UIFont = .systemFont(ofSize: 30.0, weight: .bold)
}

protocol GameManagerProtocol: AnyObject {
  func updateText(text: String, color: UIColor, font: UIFont)
  func updateTime(time: String)
  func setEnableButton(isEnable: Bool)
  func resultTest(avrgTime: Int?, procentCorrect: Int?, data: FlankerModel?, dataArray: [FlankerModel]?)
}

class GameManager {
  private let resultManager = ResultManager.shared

  private var text: String = ""

  private var timerSetText: Timer?
  private var timeResponse: Timer?

  private var countTest = 0
  private var countAllGame = 0
  private var correctAnswers = 0

  private var timeSpeedGame: TimeInterval = 0.5
  private var isShowGameAnswers = true
  private var startDate: Date?
  private var arrayTimes: [Int] = []

  private var isFirst = true

  weak var delegate: GameManagerProtocol?

  func startGame(timeSpeed: Float, isShowAnswers: Bool, countGame: Int) {
    countAllGame = countGame
    timeSpeedGame = TimeInterval(timeSpeed)
    isShowGameAnswers = isShowAnswers
    startLogicTimer()
  }

  func parameterGame(isShowAnswers: Bool, countGame: Int) {
    isShowGameAnswers = isShowAnswers
    countAllGame = countGame
    countTest = 0
    correctAnswers = 0
    startLogicTimer()
  }

  func stopGame() {
    timeResponse?.invalidate()
    timerSetText?.invalidate()
    delegate?.updateText(text: "-----", color: .black, font: Constants.bigFont)
  }

  func startLogicTimer() {
    timeResponse?.invalidate()
    timerSetText?.invalidate()
    timerSetText = Timer.scheduledTimer(timeInterval: Constants.lowTimeInterval, target: self, selector: #selector(setText), userInfo: nil, repeats: false)
  }

  private func randomString(length: Int = 5) -> String {
    let letters: NSString = "<>"
    let len = UInt32(letters.length)

    var randomString = ""

    for _ in 0 ..< length {
      let rand = arc4random_uniform(len)
      var nextChar = letters.character(at: Int(rand))
      randomString += NSString(characters: &nextChar, length: 1) as String
    }

    return randomString
  }

  func checkedAnswer(button: SelectedButton) {
    timeResponse?.invalidate()
    timerSetText?.invalidate()
    delegate?.setEnableButton(isEnable: false)
    guard let startDate = startDate else { return }
    let endDate = Date()
    let resultTime = (endDate.timeIntervalSince1970 - startDate.timeIntervalSince1970) * 1000
    arrayTimes.append(Int(resultTime))
    self.startDate = nil
    delegate?.updateTime(time: String(format: "%.3f", resultTime))


    let textArray = Array(text)
    switch button {
    case .left:
      if textArray[2] == "<" {
        correctAnswers += 1
        let model = FlankerModel(endTime: Int(endDate.timeIntervalSince1970),
                                 image_time: 0,
                                 internal_node_id: "",
                                 key_press: nil,
                                 rt: Int(resultTime),
                                 start_time: Int(startDate.timeIntervalSince1970),
                                 start_timestamp: 0,
                                 stimulus: "Correcr",
                                 tag: "feedback",
                                 time_elapsed: 0,
                                 trial_index: countTest,
                                 trial_type: "")
        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont)
        }
      } else {
        let model = FlankerModel(endTime: Int(endDate.timeIntervalSince1970),
                                 image_time: 0,
                                 internal_node_id: "",
                                 key_press: nil,
                                 rt: Int(resultTime),
                                 start_time: Int(startDate.timeIntervalSince1970),
                                 start_timestamp: 0,
                                 stimulus: "Incorrect",
                                 tag: "feedback",
                                 time_elapsed: 0,
                                 trial_index: countTest,
                                 trial_type: "")
        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont)
        }
      }
    case .right:
      if textArray[2] == ">" {
        correctAnswers += 1
        let model = FlankerModel(endTime: Int(endDate.timeIntervalSince1970),
                                 image_time: 0,
                                 internal_node_id: "",
                                 key_press: nil,
                                 rt: Int(resultTime),
                                 start_time: Int(startDate.timeIntervalSince1970),
                                 start_timestamp: 0,
                                 stimulus: "Correcr",
                                 tag: "feedback",
                                 time_elapsed: 0,
                                 trial_index: countTest,
                                 trial_type: "")
        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont)
        }
      } else {
        let model = FlankerModel(endTime: Int(endDate.timeIntervalSince1970),
                                 image_time: 0,
                                 internal_node_id: "",
                                 key_press: nil,
                                 rt: Int(resultTime),
                                 start_time: Int(startDate.timeIntervalSince1970),
                                 start_timestamp: 0,
                                 stimulus: "Incorrect",
                                 tag: "feedback",
                                 time_elapsed: 0,
                                 trial_index: countTest,
                                 trial_type: "")
        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont)
        }
      }
    }
    

    if isShowGameAnswers {
      Timer.scheduledTimer(timeInterval: Constants.lowTimeInterval, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
    } else {
      setDefaultText()
    }
  }

  private func isEndGame() -> Bool{
    if countTest == countAllGame {
      let sumArray = arrayTimes.reduce(0, +)
      let avrgArray = sumArray / arrayTimes.count
      delegate?.updateText(text: "-----", color: .black, font: Constants.bigFont)
      let procentsCorrect = Float(correctAnswers) / Float(countAllGame) * 100
      delegate?.resultTest(avrgTime: avrgArray, procentCorrect: Int(procentsCorrect), data: nil, dataArray: resultManager.oneGameDataResult)
      resultManager.cleanData()
      countTest = 0
      correctAnswers = 0
      timeResponse?.invalidate()
      timerSetText?.invalidate()
      arrayTimes = []
      return true
    } else {
      return false
    }
  }

  @objc func setDefaultText() {
    if isEndGame() { return }
    delegate?.updateText(text: "-----", color: .black, font: Constants.bigFont)
    startLogicTimer()
  }

  @objc func setText() {
    delegate?.setEnableButton(isEnable: true)
    text = randomString()
    delegate?.updateText(text: text, color: .black, font: Constants.bigFont)
    countTest += 1
    startDate = Date()
    timeResponse = Timer.scheduledTimer(timeInterval: Constants.moreTimeInterval, target: self, selector: #selector(self.timeResponseFailed), userInfo: nil, repeats: false)
  }

  @objc func timeResponseFailed() {
    delegate?.setEnableButton(isEnable: false)
    delegate?.updateText(text: Constants.timeRespondText, color: .black, font: Constants.smallFont)
    guard let startDate = startDate else { return }
    let endDate = Date()
    let resultTime = (endDate.timeIntervalSince1970 - startDate.timeIntervalSince1970) * 1000
    arrayTimes.append(Int(resultTime))
    let model = FlankerModel(endTime: Int(endDate.timeIntervalSince1970),
                             image_time: 0,
                             internal_node_id: "",
                             key_press: nil,
                             rt: Int(resultTime),
                             start_time: Int(startDate.timeIntervalSince1970),
                             start_timestamp: 0,
                             stimulus: "Respond faster",
                             tag: "feedback",
                             time_elapsed: 0,
                             trial_index: countTest,
                             trial_type: "")
    resultManager.addStepData(data: model)
    delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
    if !isEndGame() {
      Timer.scheduledTimer(timeInterval: Constants.lowTimeInterval, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
    }
  }
}
