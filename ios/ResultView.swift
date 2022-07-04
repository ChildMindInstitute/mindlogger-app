//
//  ResultView.swift
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 27.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

enum ButtonType {
  case ok
  case next
  case finish
}

class ResultView: UIView {
  private lazy var textLabel: UITextView = {
    let textView = UITextView()
    textView.translatesAutoresizingMaskIntoConstraints = false
    textView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    textView.textAlignment = .center
    textView.font = .systemFont(ofSize: 50.0, weight: .regular)
    textView.textColor = .black
    textView.sizeToFit()
    textView.isScrollEnabled = false
    textView.isEditable = false
    return textView
  }()

  private lazy var finishButton: UIButton = {
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.backgroundColor = UIColor(red: 37, green: 95, blue: 158)
    button.layer.cornerRadius = 5.0
    button.setTitle("OK", for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: 30.0, weight: .regular)
    button.addTarget(self, action: #selector(finishButtonAction), for: .touchUpInside)
    button.setTitleColor(.gray, for: .highlighted)
    button.setContentHuggingPriority(.required, for: .vertical)
    return button
  }()

  private var closure: (() -> Void)?

  override init(frame: CGRect) {
    super.init(frame: frame)
    self.backgroundColor = .white
    setupConstraint()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  func configureView(text: String, typeButton: ButtonType, avrgTime: Int, procentCorrect: Int, isLast: Bool = false, closureFinish: @escaping () -> Void) {
    guard let parametersGame = ParameterGameManager.shared.getParameters() else { return }
    switch typeButton {
    case .ok:
      if procentCorrect >= 75 || isLast {
        let textAttr = ("<font size=\"+3\"><p>You responded correctly on <strong>" + String(procentCorrect) + "%</strong> of trials.</p><p>Your average response time was <strong>" + String(avrgTime) + "ms</strong>.</p> <p>\(parametersGame.continueText[0])</p></font>").htmlToAttributedString
        textLabel.attributedText = textAttr
        finishButton.setTitle("Continue", for: .normal)
      } else {
        let textAttr = ("<font size=\"+3\"><p>You responded correctly on <strong>" + String(procentCorrect) + "%</strong> of trials.</p><p>Your average response time was <strong>" + String(avrgTime) + "ms</strong>.</p> <p> \(parametersGame.restartText[0])</p> <p>\(parametersGame.restartText[1])</p></font>").htmlToAttributedString
        textLabel.attributedText = textAttr
        finishButton.setTitle("OK", for: .normal)
      }

    case .next:
      let textAttr = ("<font size=\"+3\"><p>You responded correctly on <strong>" + String(procentCorrect) + "%</strong> of trials.</p><p>Your average response time was <strong>" + String(avrgTime) + "ms</strong>.</p> <p>\(parametersGame.continueText[0])</p></font>").htmlToAttributedString
      textLabel.attributedText = textAttr
      finishButton.setTitle("Continue", for: .normal)
    case .finish:
      let textAttr = ("<font size=\"+3\"><p>You responded correctly on <strong>" + String(procentCorrect) + "%</strong> of trials.</p><p>Your average response time was <strong>" + String(avrgTime) + "ms</strong>.</p> <p>Press the button below to finish.</p></font>").htmlToAttributedString
      textLabel.attributedText = textAttr
      finishButton.setTitle("Finish", for: .normal)
    }
    closure = closureFinish
    textLabel.centerVertically()
  }

  @objc func finishButtonAction(sender: UIButton!) {
    guard let closure = closure else { return }
    closure()
  }
}

private extension ResultView {
  func setupConstraint() {
    self.addSubview(textLabel)
    self.addSubview(finishButton)

    NSLayoutConstraint.activate([
      textLabel.bottomAnchor.constraint(equalTo: finishButton.topAnchor),
      textLabel.centerYAnchor.constraint(equalTo: self.centerYAnchor),
      textLabel.leadingAnchor.constraint(equalTo: self.leadingAnchor),
      textLabel.trailingAnchor.constraint(equalTo: self.trailingAnchor),

      finishButton.leadingAnchor.constraint(equalTo: self.leadingAnchor, constant: 60),
      finishButton.trailingAnchor.constraint(equalTo: self.trailingAnchor, constant: -60),
      finishButton.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -20)
    ])
  }
}


extension String {
    var htmlToAttributedString: NSMutableAttributedString? {
        guard let data = data(using: .utf8) else { return nil }
        do {
          let paragraph = NSMutableParagraphStyle()
          paragraph.alignment = .center
          let attribute = try NSMutableAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.html, .characterEncoding:String.Encoding.utf8.rawValue], documentAttributes: nil)
          attribute.addAttributes([.paragraphStyle: paragraph], range: NSMakeRange(0, attribute.length))
            return attribute
        } catch {
            return nil
        }
    }
    var htmlToString: String {
        return htmlToAttributedString?.string ?? ""
    }
}
