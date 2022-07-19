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

enum TypeTimeStamps {
  case fixations
  case trial
  case feedback
  case response
}

protocol GameManagerProtocol: AnyObject {
  func updateText(text: String, color: UIColor, font: UIFont, isStart: Bool, typeTime: TypeTimeStamps)
  func updateFixations(image: URL?, isStart: Bool, typeTime: TypeTimeStamps)
  func updateTime(time: String)
  func setEnableButton(isEnable: Bool)
  func updateTitleButton(left: String?, right: String?, leftImage: URL?, rightImage: URL?, countButton: Int)
  func resultTest(avrgTime: Int?, procentCorrect: Int?, data: FlankerModel?, dataArray: [FlankerModel]?, isShowResults: Bool, minAccuracy: Int)
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
  private var isShowFeedback = true
  private var isShowFixations = true
  private var isShowResults = true
  private var arrayTimes: [Int] = []

  private var startFixationsTimestamp: Double?
  private var endFixationsTimestamp: Double?
  private var startTrialTimestamp: Double?
  private var endTrialTimestamp: Double?
  private var startFeedbackTimestamp: Double?
  private var endFeedbackTimestamp: Double?
  private var respondTouchButton: Double?


  private var isFirst = true

  private var gameParameters: ParameterModel?

  weak var delegate: GameManagerProtocol?

  func startGame(timeSpeed: Float, isShowAnswers: Bool, countGame: Int) {
    countAllGame = countGame
    timeSpeedGame = TimeInterval(timeSpeed)
    isShowFeedback = isShowAnswers
    startLogicTimer()
  }

  func parameterGame() {
    guard let parameters = ParameterGameManager.shared.getParameters() else { return }
    gameParameters = parameters
    isShowFeedback = parameters.showFeedback
    isShowFixations = parameters.showFixation
    isShowResults = parameters.showResults
    countAllGame = parameters.trials.count
    updateButtonTitle()
    resultManager.cleanData()
    countTest = 0
    correctAnswers = 0
    startLogicTimer()
  }

  func startLogicTimer() {
    invalidateTimers()
    setDefaultText(isFirst: true)
  }

  func setEndTimeViewingImage(time: Double, isStart: Bool, type: TypeTimeStamps) {
    if isStart {
      switch type {
      case .fixations:
        startFixationsTimestamp = time

        if
          let startFeedbackTimestamp = startFeedbackTimestamp,
          let endFeedbackTimestamp = endFeedbackTimestamp,
          let gameParameters = gameParameters,
          gameParameters.showFeedback {
          let resultTime = (time - startFeedbackTimestamp) * 1000
          let model = FlankerModel(rt: resultTime,
                                   stimulus: "<div class=\"mindlogger-message correct\">\(responseText)</div>",
                                   button_pressed: nil,
                                   image_time: endFeedbackTimestamp * 1000,
                                   correct: nil,
                                   start_timestamp: 0,
                                   tag: "feedback",
                                   trial_index: countTest,
                                   start_time: startFeedbackTimestamp * 1000,
                                   response_touch_timestamp: 0)
          delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
          resultManager.addStepData(data: model)
        }
      case .trial:
        startTrialTimestamp = time

        if
          let startFixationsTimestamp = startFixationsTimestamp,
          let endFixationsTimestamp = endFixationsTimestamp,
          let gameParameters = gameParameters,
          gameParameters.showFixation {
          let resultTime = (time - startFixationsTimestamp) * 1000
          let model = FlankerModel(rt: resultTime,
                                   stimulus: "<div class=\"mindlogger-fixation\">-----</div>",
                                   button_pressed: nil,
                                   image_time: endFixationsTimestamp * 1000,
                                   correct: nil,
                                   start_timestamp: 0,
                                   tag: "fixation",
                                   trial_index: countTest + 1,
                                   start_time: startFixationsTimestamp * 1000,
                                   response_touch_timestamp: 0)
          delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
          resultManager.addStepData(data: model)
        } else if
          let startFeedbackTimestamp = startFeedbackTimestamp,
          let endFeedbackTimestamp = endFeedbackTimestamp,
          let gameParameters = gameParameters,
          gameParameters.showFeedback,
          !gameParameters.showFixation {
          let resultTime = (time - startFeedbackTimestamp) * 1000
          let model = FlankerModel(rt: resultTime,
                                   stimulus: "<div class=\"mindlogger-message correct\">\(responseText)</div>",
                                   button_pressed: nil,
                                   image_time: endFeedbackTimestamp * 1000,
                                   correct: nil,
                                   start_timestamp: 0,
                                   tag: "feedback",
                                   trial_index: countTest,
                                   start_time: startFeedbackTimestamp * 1000,
                                   response_touch_timestamp: 0)
          delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
          resultManager.addStepData(data: model)
        }
      case .feedback:
        startFeedbackTimestamp = time
      case .response: break
      }
    } else {
      switch type {
      case .fixations:
        endFixationsTimestamp = time
      case .trial:
        endTrialTimestamp = time
      case .feedback:
        endFeedbackTimestamp = time
      case .response:
        respondTouchButton = time
      }
    }
  }

  func checkedAnswer(button: SelectedButton) {
    invalidateTimers()
    delegate?.setEnableButton(isEnable: false)
    guard let gameParameters = gameParameters else { return }
    guard
      let startTrialTimestamp = startTrialTimestamp,
      let endTrialTimestamp = endTrialTimestamp,
      let respondTouchButton = respondTouchButton
    else { return }
    let resultTime = (respondTouchButton - startTrialTimestamp) * 1000
    arrayTimes.append(resultTime.convertToInt())
    delegate?.updateTime(time: String(format: "%.3f", resultTime))
    switch button {
    case .left:
      if gameParameters.trials[countTest].correctChoice == 0 {
        correctAnswers += 1
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "0",
                                 image_time: endTrialTimestamp * 1000,
                                 correct: true,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startTrialTimestamp * 1000,
                                 response_touch_timestamp: respondTouchButton * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
        if gameParameters.showFeedback {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont, isStart: false, typeTime: .feedback)
        }
        responseText = Constants.correctText
      } else {
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "0",
                                 image_time: endTrialTimestamp * 1000,
                                 correct: false,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startTrialTimestamp * 1000,
                                 response_touch_timestamp: respondTouchButton * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
        if gameParameters.showFeedback {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont, isStart: false, typeTime: .feedback)
        }
        responseText = Constants.inCorrectText
      }
    case .right:
      if gameParameters.trials[countTest].correctChoice == 1 {
        correctAnswers += 1
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "1",
                                 image_time: endTrialTimestamp * 1000,
                                 correct: true,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startTrialTimestamp * 1000,
                                 response_touch_timestamp: respondTouchButton * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
        if gameParameters.showFeedback {
          delegate?.updateText(text: Constants.correctText, color: Constants.greenColor, font: Constants.smallFont, isStart: false, typeTime: .feedback)
        }
        responseText = Constants.correctText
      } else {
        let model = FlankerModel(rt: resultTime,
                                 stimulus: text,
                                 button_pressed: "1",
                                 image_time: endTrialTimestamp * 1000,
                                 correct: false,
                                 start_timestamp: 0,
                                 tag: Constants.tag,
                                 trial_index: countTest + 1,
                                 start_time: startTrialTimestamp * 1000,
                                 response_touch_timestamp: respondTouchButton * 1000)

        resultManager.addStepData(data: model)
        delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
        if gameParameters.showFeedback {
          delegate?.updateText(text: Constants.inCorrectText, color: Constants.redColor, font: Constants.smallFont, isStart: false, typeTime: .feedback)
        }
        responseText = Constants.inCorrectText
      }
    }
    

    if gameParameters.showFeedback {
      Timer.scheduledTimer(timeInterval: Constants.lowTimeInterval, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
    } else {
      setDefaultText(isFirst: false)
    }
  }

  @objc func setDefaultText(isFirst: Bool) {
    guard let gameParameters = gameParameters else { return }

    if !isFirst {
      countTest += 1
    }


    if gameParameters.showFixation {
      if let image = URL(string: gameParameters.fixation), gameParameters.fixation.contains("https") {
        delegate?.updateFixations(image: image, isStart: false, typeTime: .fixations)
      } else {
        delegate?.updateText(text: gameParameters.fixation, color: .black, font: Constants.bigFont, isStart: false, typeTime: .fixations)
      }
    }

    if isEndGame() { return }
    invalidateTimers()
    updateButtonTitle()

    if gameParameters.showFixation {
      timerSetText = Timer.scheduledTimer(timeInterval: gameParameters.fixationDuration / 1000, target: self, selector: #selector(setText), userInfo: nil, repeats: false)
    } else {
      setText()
    }
  }

  @objc func setText() {
    guard let gameParameters = gameParameters else { return }

    delegate?.setEnableButton(isEnable: true)
    text = gameParameters.trials[countTest].stimulus.en

    if let image = URL(string: text), text.contains("https") {
      delegate?.updateFixations(image: image, isStart: true, typeTime: .trial)
    } else {
      delegate?.updateText(text: text, color: .black, font: Constants.bigFont, isStart: true, typeTime: .trial)
    }

    timeResponse = Timer.scheduledTimer(timeInterval: gameParameters.trialDuration / 1000, target: self, selector: #selector(self.timeResponseFailed), userInfo: nil, repeats: false)
  }

  @objc func timeResponseFailed() {
    guard let gameParameters = gameParameters else { return }

    delegate?.setEnableButton(isEnable: false)
    if gameParameters.showFeedback {
      delegate?.updateText(text: Constants.timeRespondText, color: .black, font: Constants.smallFont, isStart: false, typeTime: .feedback)
    }

    guard
      let startTrialTimestamp = startTrialTimestamp,
      let endTrialTimestamp = endTrialTimestamp
    else { return }

    let model = FlankerModel(rt: 0.0,
                             stimulus: text,
                             button_pressed: nil,
                             image_time: endTrialTimestamp * 1000, // має намалювати
                             correct: false,
                             start_timestamp: 0, // вже намальовано
                             tag: Constants.tag,
                             trial_index: countTest + 1,
                             start_time: startTrialTimestamp * 1000,
                             response_touch_timestamp: 0)

    resultManager.addStepData(data: model)
    delegate?.resultTest(avrgTime: nil, procentCorrect: nil, data: model, dataArray: nil, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
    responseText = Constants.timeRespondText

    Timer.scheduledTimer(timeInterval: Constants.lowTimeInterval, target: self, selector: #selector(self.setDefaultText), userInfo: nil, repeats: false)
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
    guard let gameParameters = gameParameters else { return false }
    
    if countTest == gameParameters.trials.count {
      let sumArray = arrayTimes.reduce(0, +)
      let avrgArray = sumArray / arrayTimes.count
      let procentsCorrect = Float(correctAnswers) / Float(countAllGame) * 100
      if !gameParameters.showFixation {
        setEndTimeViewingImage(time: CACurrentMediaTime(), isStart: true, type: .fixations)
      }
      delegate?.resultTest(avrgTime: avrgArray, procentCorrect: Int(procentsCorrect), data: nil, dataArray: resultManager.oneGameDataResult, isShowResults: gameParameters.showResults, minAccuracy: gameParameters.minimumAccuracy)
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

  func updateButtonTitle() {
    guard let gameParameters = gameParameters else { return }

    if gameParameters.trials[countTest].choices.count == 2 {
      if
        let leftImage = URL(string: gameParameters.trials[countTest].choices[0].name.en),
        let rightImage = URL(string: gameParameters.trials[countTest].choices[1].name.en),
        gameParameters.trials[countTest].choices[0].name.en.contains("https"),
        gameParameters.trials[countTest].choices[1].name.en.contains("https") {
        delegate?.updateTitleButton(left: nil, right: nil, leftImage: leftImage, rightImage: rightImage, countButton: 2)
      } else {
        delegate?.updateTitleButton(left: gameParameters.trials[countTest].choices[0].name.en, right: gameParameters.trials[countTest].choices[1].name.en, leftImage: nil, rightImage: nil, countButton: 2)
      }
    } else {
      if
        let leftImage = URL(string: gameParameters.trials[countTest].choices[0].name.en),
        gameParameters.trials[countTest].choices[0].name.en.contains("https") {
        delegate?.updateTitleButton(left: nil, right: nil, leftImage: leftImage, rightImage: nil, countButton: 1)
      } else {
        delegate?.updateTitleButton(left: gameParameters.trials[countTest].choices[0].name.en, right: nil, leftImage: nil, rightImage: nil, countButton: 1)
      }
    }
  }
}
