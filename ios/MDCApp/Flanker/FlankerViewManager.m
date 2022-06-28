//
//  TestViewManager.m
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 21.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(RCTFlankerViewManager, RCTViewManager)
RCT_EXTERN_METHOD(parameterGameType:(int *)blockType json:(NSString *)json)
RCT_EXTERN_METHOD(parameterGame:(BOOL *)isShowAnswers countGame:(int *)countGame index:(int*)index)
RCT_EXPORT_VIEW_PROPERTY(onEndGame, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUpdate, RCTDirectEventBlock)
@end
