//
//  TestViewManager.m
//  MDCApp
//
//  Created by Volodymyr Nazarkevych on 21.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(RCTFlankerViewManager, RCTViewManager)
RCT_EXTERN_METHOD(setGameParameters:(NSString *)json)
RCT_EXTERN_METHOD(preloadGameImages:(NSString *)json)
RCT_EXTERN_METHOD(startGame:(BOOL *)isFirst isLast:(BOOL *)isLast)
RCT_EXPORT_VIEW_PROPERTY(onEndGame, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(dataJson, NSString)
RCT_EXPORT_VIEW_PROPERTY(onUpdate, RCTDirectEventBlock)
@end
