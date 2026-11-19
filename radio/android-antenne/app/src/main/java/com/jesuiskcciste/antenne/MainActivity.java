package com.jesuiskcciste.antenne;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Studio Radio KCC : l'antenne de la Radio Je suis KCCiste sur le téléphone de l'animateur.
 * Ouvre la page Antenne du site (micro, musique, appels, sujet, effets, YouTube/Facebook).
 * Pendant le direct, l'écran reste allumé et un service garde le micro actif.
 * Hors direct, la radio automatique continue seule chez les auditeurs.
 */
public class MainActivity extends Activity {
    static final String HOME = "https://jesuiskcciste.com/radio/studio";
    private static final int REQ_MIC = 51;
    private static final int REQ_FILES = 52;
    private WebView web;
    private PermissionRequest pending;
    private ValueCallback<Uri[]> filesCallback;
    private boolean onAir;

    /** Appelé par la page Antenne quand l'émission commence ou se termine. */
    public class Bridge {
        @JavascriptInterface public void onAir(String title) { runOnUiThread(() -> setOnAir(true, title)); }
        @JavascriptInterface public void offAir() { runOnUiThread(() -> setOnAir(false, null)); }
    }

    private void setOnAir(boolean on, String title) {
        onAir = on;
        if (on) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            Intent i = new Intent(this, OnAirService.class).putExtra("title", title == null ? "" : title);
            try { if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i); } catch (Exception ignored) { }
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            stopService(new Intent(this, OnAirService.class));
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#070a12"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        // « KCCRadioDesktop » : la page Antenne s'affiche en plein écran, sans le menu du site
        s.setUserAgentString(s.getUserAgentString() + " KCCRadioDesktop/1 KCCStudioAndroid/1");
        web.addJavascriptInterface(new Bridge(), "KCCStudio");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String host = u.getHost() == null ? "" : u.getHost();
                // seule la page du studio reste dans l'application ; le reste du site s'ouvre dans le navigateur
                if ("https".equals(u.getScheme()) && (host.equals("jesuiskcciste.com") || host.equals("www.jesuiskcciste.com"))
                    && u.getPath() != null && u.getPath().startsWith("/radio/studio")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) {
                    view.loadDataWithBaseURL(null,
                        "<html><body style='background:#070a12;color:#fff;font-family:sans-serif;text-align:center;padding:40px'>"
                        + "<h2>🎙️ Studio Radio KCC</h2><p>Pas de connexion Internet.</p>"
                        + "<p><a style='color:#e8b84a' href='" + HOME + "'>Réessayer</a></p></body></html>",
                        "text/html", "utf-8", null);
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    if (hasMic()) request.grant(request.getResources());
                    else { pending = request; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC); }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                // « + morceaux » et « + bruitage » : choisir des fichiers audio sur le téléphone
                if (filesCallback != null) filesCallback.onReceiveValue(null);
                filesCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("audio/*");
                if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try { startActivityForResult(Intent.createChooser(i, "Choisir des sons"), REQ_FILES); }
                catch (Exception e) { filesCallback = null; return false; }
                return true;
            }
        });

        List<String> need = new ArrayList<>();
        if (!hasMic()) need.add(Manifest.permission.RECORD_AUDIO);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) need.add(Manifest.permission.POST_NOTIFICATIONS);
        if (!need.isEmpty()) requestPermissions(need.toArray(new String[0]), 50);

        web.loadUrl(HOME);
    }

    private boolean hasMic() {
        return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_FILES || filesCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                result = new Uri[n];
                for (int k = 0; k < n; k++) result[k] = data.getClipData().getItemAt(k).getUri();
            } else if (data.getData() != null) result = new Uri[]{data.getData()};
        }
        filesCallback.onReceiveValue(result);
        filesCallback = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_MIC && pending != null) {
            if (hasMic()) pending.grant(pending.getResources()); else pending.deny();
            pending = null;
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web != null && web.canGoBack()) { web.goBack(); return; }
        if (onAir) {
            new AlertDialog.Builder(this)
                .setTitle("Vous êtes à l'antenne")
                .setMessage("Le direct continue si vous quittez l'écran. Pour l'arrêter, utilisez « Terminer l'émission ».")
                .setPositiveButton("Rester", null)
                .setNegativeButton("Réduire", (d, w) -> moveTaskToBack(true))
                .show();
            return;
        }
        moveTaskToBack(true);
    }

    @Override
    protected void onDestroy() {
        stopService(new Intent(this, OnAirService.class));
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
