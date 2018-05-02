package lab.childmindinstitute.data;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.sensors.RNSensorsPackage;
import com.imagepicker.ImagePickerPackage;
import com.mybigday.rns3.RNS3Package;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.horcrux.svg.SvgPackage;
import com.futurice.rctaudiotoolkit.AudioPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.otomogroove.OGReactNativeWaveform.OGWavePackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.RNFetchBlob.RNFetchBlobPackage;

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
            new RNSensorsPackage(),
            new ImagePickerPackage(),
            new RNS3Package(),
            new ReactNativePushNotificationPackage(),
            new SvgPackage(),
            new AudioPackage(),
            new RNSoundPackage(),
            new OrientationPackage(),
            new OGWavePackage(),
            new ReactNativeAudioPackage(),
            new VectorIconsPackage(),
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
