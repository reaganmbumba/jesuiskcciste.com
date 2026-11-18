package com.jesuiskcciste.radio;

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
import android.os.PowerManager;
import android.provider.Settings;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Radio Je suis KCCiste : l'application des auditeurs.
 * Elle ouvre la page radio du site (écouter le direct, lire le sujet, voir les auditeurs,
 * appeler l'émission) et lance la veille qui sonne une alarme quand une émission commence.
 */
public class MainActivity extends Activity {
    static final String HOME = "https://jesuiskcciste.com/radio/app";
    private static final int REQ_MIC = 41;
    private static final int REQ_NOTIF = 42;
    private WebView web;
    private PermissionRequest pending;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0b0e16"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " KCCRadioApp/1");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String host = u.getHost() == null ? "" : u.getHost();
                if (("https".equals(u.getScheme()) || "http".equals(u.getScheme())) && host.endsWith("jesuiskcciste.com")
                    && u.getPath() != null && u.getPath().startsWith("/radio/app")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) {
                    view.loadDataWithBaseURL(null,
                        "<html><body style='background:#0b0e16;color:#f5e7b8;font-family:sans-serif;text-align:center;padding:40px'>"
                        + "<h2>📻 Radio Je suis KCCiste</h2><p>Pas de connexion Internet.</p>"
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
        });

        AlertService.stopAlarm(this); // ouvrir l'appli fait taire l'alarme
        web.loadUrl(urlFrom(getIntent()));
        setupAlerts();
    }

    private String urlFrom(Intent i) {
        if (i != null && i.getData() != null && "https".equals(i.getData().getScheme())) {
            String path = i.getData().getPath();
            return path != null && path.startsWith("/radio/app") ? i.getData().toString() : HOME;
        }
        return HOME;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        AlertService.stopAlarm(this);
        if (web != null) web.loadUrl(urlFrom(intent));
    }

    private boolean hasMic() {
        return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    /** Notifications, exemption d'économie de batterie, puis démarrage de la veille. */
    private void setupAlerts() {
        if (!AlertService.isEnabled(this)) {
            new AlertDialog.Builder(this)
                .setTitle("Alarme des émissions")
                .setMessage("L'alarme des émissions en direct est désactivée. La réactiver ?")
                .setPositiveButton("Oui", (d, w) -> { AlertService.setEnabled(this, true); setupAlerts(); })
                .setNegativeButton("Non", null)
                .show();
            return;
        }
        List<String> need = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            need.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (!need.isEmpty()) { requestPermissions(need.toArray(new String[0]), REQ_NOTIF); return; }
        AlertService.start(this);
        askBattery();
    }

    @SuppressLint("BatteryLife")
    private void askBattery() {
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm == null || pm.isIgnoringBatteryOptimizations(getPackageName())) return;
        if (getSharedPreferences(AlertService.PREFS, MODE_PRIVATE).getBoolean("battery_asked", false)) return;
        getSharedPreferences(AlertService.PREFS, MODE_PRIVATE).edit().putBoolean("battery_asked", true).apply();
        new AlertDialog.Builder(this)
            .setTitle("Ne rien manquer")
            .setMessage("Pour que l'alarme sonne même téléphone en veille, autorisez la Radio à fonctionner sans restriction de batterie.")
            .setPositiveButton("Autoriser", (d, w) -> {
                try {
                    startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName())));
                } catch (Exception e) {
                    try { startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)); } catch (Exception ignored) { }
                }
            })
            .setNegativeButton("Plus tard", null)
            .show();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_MIC && pending != null) {
            if (hasMic()) pending.grant(pending.getResources()); else pending.deny();
            pending = null;
        } else if (requestCode == REQ_NOTIF) {
            AlertService.start(this);
            askBattery();
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else moveTaskToBack(true); // la radio continue de jouer en arrière-plan
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
