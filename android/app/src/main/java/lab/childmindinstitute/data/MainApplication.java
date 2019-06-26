package lab.childmindinstitute.data;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import org.reactnative.camera.RNCameraPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.imagepicker.ImagePickerPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.horcrux.svg.SvgPackage;
import com.futurice.rctaudiotoolkit.AudioPackage;
import com.otomogroove.OGReactNativeWaveform.OGWavePackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new VectorIconsPackage(),
            new LottiePackage(),
          new NetInfoPackage(),
          new RNCWebViewPackage(),
          new RNCameraPackage(),
          new RNDeviceInfo(),
          new ImagePickerPackage(),
          new ReactNativePushNotificationPackage(),
          new SvgPackage(),
          new AudioPackage(),
          new OGWavePackage(),
          new ReactNativeAudioPackage(),
          new RNFetchBlobPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
