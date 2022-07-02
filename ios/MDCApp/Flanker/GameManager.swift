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
  static let tag: String = "trial"
  static let trialTag: String = "html-button-response"
}

protocol GameManagerProtocol: AnyObject {
  func updateText(text: String, color: UIColor, font: UIFont, isStart: Bool)
  func updateFixations(image: URL?, isStart: Bool)
  func updateTime(time: String)
  func setEnableButton(isEnable: Bool)
  func updateTitleButton(left: String?, right: String?, leftImage: URL?, rightImage: URL?)
  func resultTest(avrgTime: Int?, procentCorrect: Int?, data: FlankerModel?, dataArray: [FlankerModel]?)
}

class GameManager {
  private let resultManager = ResultManager.shared

  private var text: String = ""
  private var responseText: String = ""

  private var timerSetText: Timer?
  private var timeResponse: Timer?

  private var countTest = 0
  private var countAllGame = 0
  private var correctAnswers = 0

  private var timeSpeedGame: TimeInterval = 0.5
  private var isShowGameAnswers = true
  private var startDate: Date?
  private var arrayTimes: [Int] = []

  private var startVisibleImageTime: Date?
  private var endVisibleImageTime: Date?
  private var startGameTime: Date?

  private var isFirst = true

  private var gameParameters: ParameterModel?

  weak var delegate: GameManagerProtocol?

  func startGame(timeSpeed: Float, isShowAnswers: Bool, countGame: Int) {
    countAllGame = countGame
    timeSpeedGame = TimeInterval(timeSpeed)
    isShowGameAnswers = isShowAnswers
    startLogicTimer()
  }

  func parameterGame() {
      guard let parameters = ParameterGameManager.shared.getParameters() else { return }
      gameParameters = parameters
      isShowGameAnswers = parameters.showFeedback
      countAllGame = parameters.trials.count
      delegate?.updateTitleButton(left: parameters.trials[countTest].choices[0].name.en, right: parameters.trials[countTest].choices[1].name.en, leftImage: nil, rightImage: nil)
      resultManager.cleanData()
      countTest = 0
      correctAnswers = 0
      startLogicTimer()
  }

  func stopGame() {
    invalidateTimers()
    if
      let endVisibleImageTime = endVisibleImageTime,
      let startVisibleImageTime = startVisibleImageTime,
      let startGameTime = startGameTime, isShowGameAnswers {
      let resultTime = (Date().timeIntervalSince1970 - startVisibleImageTime.timeIntervalSince1970) * 1000
      let model = FlankerModel(rt: resultTime,
                               stimulus: "<div class=\"mindlogger-message correct\">\(responseText)</div>",
                               button_pressed: nil,
                               image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                               correct: nil,
                               start_timestamp: 0,
                               tag: "feedback",
                               trial_index: countTest + 1,
                               start_time: startGameTime.timeIntervalSince1970 * 1000,
                               response_touch_timestamp: 0)
      delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
      resultManager.addStepData(data: model)
    }
    guard let gameParameters = gameParameters else { return }
    delegate?.updateText(text: gameParameters.fixation, color: .black, font: Constants.bigFont, isStart: false)
  }

  func startLogicTimer() {
    invalidateTimers()
    startDate = Date()
    endVisibleImageTime = Date()
    setDefaultText(isFirst: true)
  }

  func setEndTimeViewingImage(time: Date, isStart: Bool) {
    if isStart {
      startDate = time
    }
    endVisibleImageTime = time

    print("ssss_startGameTime \(startGameTime?.timeIntervalSince1970)")
    print("ssss_endVisibleImageTime \(endVisibleImageTime?.timeIntervalSince1970)")
  }

  func checkedAnswer(button: SelectedButton) {
    invalidateTimers()
    delegate?.setEnableButton(isEnable: false)
    guard let gameParameters = gameParameters else { return }
    guard
      let startDate = startDate,
      let endVisibleImageTime = endVisibleImageTime,
      let startGameTime = startGameTime
    else { return }
    let endDate = Date()
    let resultTime = (endDate.timeIntervalSince1970 - startDate.timeIntervalSince1970) * 1000
    arrayTimes.append(resultTime.convertToInt())
    self.startDate = nil
    delegate?.updateTime(time: String(format: "%.3f", resultTime))
    let textArray = Array(text)
    switch button {
    case .left:
      if gameParameters.trials[countTest].correctChoice == 0 {
        correctAnswers += 1
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "0",
                                 image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                                 correct: true,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startGameTime.timeIntervalSince1970 * 1000,
                                 response_touch_timestamp: startDate.timeIntervalSince1970 * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont, isStart: false)
        }
        responseText = Constants.correctText
      } else {
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "0",
                                 image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                                 correct: false,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startGameTime.timeIntervalSince1970 * 1000,
                                 response_touch_timestamp: startDate.timeIntervalSince1970 * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont, isStart: false)
        }
        responseText = Constants.inCorrectText
      }
    case .right:
      if gameParameters.trials[countTest].correctChoice == 1 {
        correctAnswers += 1
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "1",
                                 image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                                 correct: true,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startGameTime.timeIntervalSince1970 * 1000,
                                 response_touch_timestamp: startDate.timeIntervalSince1970 * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont, isStart: false)
        }
        responseText = Constants.correctText
      } else {
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "1",
                                 image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                                 correct: false,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startGameTime.timeIntervalSince1970 * 1000,
                                 response_touch_timestamp: startDate.timeIntervalSince1970 * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
        if isShowGameAnswers {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont, isStart: false)
        }
        responseText = Constants.inCorrectText
      }
    }
    

    if isShowGameAnswers {
      self.startVisibleImageTime = Date()
      Timer.scheduledTimer(timeInterval: gameParameters.fixationDuration / 1000, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
    } else {
      setDefaultText(isFirst: false)
    }
  }

  @objc func setDefaultText(isFirst: Bool) {
    if
      let endVisibleImageTime = endVisibleImageTime,
      let startVisibleImageTime = startVisibleImageTime,
      let startGameTime = startGameTime, isShowGameAnswers,
      !isFirst {

      let resultTime = (Date().timeIntervalSince1970 - startVisibleImageTime.timeIntervalSince1970) * 1000
      let model = FlankerModel(rt: resultTime,
                               stimulus: "<div class=\"mindlogger-message correct\">\(responseText)</div>",
                               button_pressed: nil,
                               image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                               correct: nil,
                               start_timestamp: 0,
                               tag: "feedback",
                               trial_index: countTest + 1,
                               start_time: startGameTime.timeIntervalSince1970 * 1000,
                               response_touch_timestamp: 0)
      delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
      resultManager.addStepData(data: model)
      countTest += 1
    } else if !isFirst, !isShowGameAnswers {
      countTest += 1
    }
    if isEndGame() { return }
    invalidateTimers()

    startVisibleImageTime = Date()
    guard let gameParameters = gameParameters else { return }
    if let image = URL(string: gameParameters.fixation), gameParameters.fixation.contains("https") {
      startGameTime = Date()
      delegate?.updateFixations(image: image, isStart: false)
    } else {
      startGameTime = Date()
      delegate?.updateText(text: gameParameters.fixation, color: .black, font: Constants.bigFont, isStart: false)
    }

    if
      let leftImage = URL(string: gameParameters.trials[countTest].choices[0].name.en),
      let rightImage = URL(string: gameParameters.trials[countTest].choices[1].name.en),
      gameParameters.trials[countTest].choices[0].name.en.contains("https"),
      gameParameters.trials[countTest].choices[1].name.en.contains("https") {
      delegate?.updateTitleButton(left: nil, right: nil, leftImage: leftImage, rightImage: rightImage)
    } else {
      delegate?.updateTitleButton(left: gameParameters.trials[countTest].choices[0].name.en, right: gameParameters.trials[countTest].choices[1].name.en, leftImage: nil, rightImage: nil)
    }
    
    timerSetText = Timer.scheduledTimer(timeInterval: gameParameters.fixationDuration / 1000, target: self, selector: #selector(setText), userInfo: nil, repeats: false)
  }

  @objc func setText() {
    if
      let endVisibleImageTime = endVisibleImageTime,
      let startVisibleImageTime = startVisibleImageTime,
      let startGameTime = startGameTime {
      let resultTime = (Date().timeIntervalSince1970 - startVisibleImageTime.timeIntervalSince1970) * 1000
      let model = FlankerModel(rt: resultTime,
                               stimulus: "<div class=\"mindlogger-fixation\">-----</div>",
                               button_pressed: nil,
                               image_time: endVisibleImageTime.timeIntervalSince1970 * 1000,
                               correct: nil,
                               start_timestamp: 0,
                               tag: "fixation",
                               trial_index: countTest + 1,
                               start_time: startGameTime.timeIntervalSince1970 * 1000,
                               response_touch_timestamp: 0)
      delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
      resultManager.addStepData(data: model)
    }
    guard let gameParameters = gameParameters else { return }
    delegate?.setEnableButton(isEnable: true)
    text = gameParameters.trials[countTest].stimulus.en

    startVisibleImageTime = Date()
    if let image = URL(string: text), text.contains("https") {
      startGameTime = Date()
      delegate?.updateFixations(image: image, isStart: true)
    } else {
      startGameTime = Date()
      delegate?.updateText(text: text, color: .black, font: Constants.bigFont, isStart: true)
    }

    timeResponse = Timer.scheduledTimer(timeInterval: gameParameters.trialDuration / 1000, target: self, selector: #selector(self.timeResponseFailed), userInfo: nil, repeats: false)
  }

  @objc func timeResponseFailed() {
    delegate?.setEnableButton(isEnable: false)
    if isShowGameAnswers {
      self.startGameTime = Date()
      delegate?.updateText(text: Constants.timeRespondText, color: .black, font: Constants.smallFont, isStart: false)
    }

    guard
      let startDate = startDate,
      let endVisibleImageTime = endVisibleImageTime,
      let startVisibleImageTime = startVisibleImageTime,
      let startGameTime = startGameTime
    else { return }

    let endDate = Date()
    let resultTime = (endDate.timeIntervalSince1970 - startDate.timeIntervalSince1970) * 1000
    arrayTimes.append(resultTime.convertToInt())

    let model = FlankerModel(rt: resultTime,
                             stimulus: text,
                             button_pressed: nil,
                             image_time: endVisibleImageTime.timeIntervalSince1970 * 1000, // має намалювати
                             correct: false,
                             start_timestamp: 0, // вже намальовано
                             tag: Constants.tag,
                             trial_index: countTest + 1,
                             start_time: startGameTime.timeIntervalSince1970 * 1000,
                             response_touch_timestamp: 0)

    resultManager.addStepData(data: model)
    delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil)
      self.startVisibleImageTime = Date()
      responseText = Constants.timeRespondText
    guard let gameParameters = gameParameters else { return }
    Timer.scheduledTimer(timeInterval: gameParameters.fixationDuration / 1000, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
  }
}

private extension GameManager {
  func randomString(length: Int = 5) -> String {
    let letters = "<>"
    let lettersArray = Array(letters)
    let symbolArray = [">>", "<<", "--"]

    let randSymbol = arc4random_uniform(UInt32(symbolArray.count))
    let randLetters = arc4random_uniform(UInt32(lettersArray.count))

    return symbolArray[Int(randSymbol)] + String(lettersArray[Int(randLetters)]) + symbolArray[Int(randSymbol)]
  }

  func isEndGame() -> Bool {
    guard let gameParameters = gameParameters else { return false}
    
    if countTest == gameParameters.trials.count {
      let sumArray = arrayTimes.reduce(0, +)
      let avrgArray = sumArray / arrayTimes.count
      delegate?.updateText(text: gameParameters.fixation, color: .black, font: Constants.bigFont, isStart: false)
      let procentsCorrect = Float(correctAnswers) / Float(countAllGame) * 100
      delegate?.resultTest(avrgTime: avrgArray, procentCorrect: Int(procentsCorrect), data: nil, dataArray: resultManager.oneGameDataResult)
      clearData()
      return true
    } else {
      return false
    }
  }

  func clearData() {
    resultManager.cleanData()
    countTest = 0
    correctAnswers = 0
    arrayTimes = []
    invalidateTimers()
  }

  func invalidateTimers() {
    timeResponse?.invalidate()
    timerSetText?.invalidate()
  }
}
