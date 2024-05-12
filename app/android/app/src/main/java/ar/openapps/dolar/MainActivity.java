package ar.openapps.dolar;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // from https://stackoverflow.com/questions/77863738/capacitor-on-android-unable-to-scale-down-page-using-viewport

    // Grab WebView
    WebView webView = (WebView) findViewById(R.id.webview);
    WebSettings webSettings = webView.getSettings();

    // The Magic
    webSettings.setUseWideViewPort(true);
    webSettings.setLoadWithOverviewMode(true);
  }
}
