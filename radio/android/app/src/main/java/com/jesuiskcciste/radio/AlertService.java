package com.jesuiskcciste.radio;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Veille des émissions : toutes les minutes, lit l'état de la radio sur le site.
 * Quand une nouvelle émission passe en direct, une notification apparaît et l'alarme
 * (jingle d'annonce en boucle + vibration) sonne pendant 30 secondes.
 */
public class AlertService extends Service {
    static final String PREFS = "kcc_radio";
    private static final String CH_WATCH = "veille";
    private static final String CH_ALARM = "alarme_direct";
    private static final int ID_WATCH = 1;
    private static final int ID_ALARM = 2;
    private static final long POLL_MS = 60_000L;
    private static final long ALARM_MS = 30_000L;
    private static final long LIVE_MAX_MS = 6L * 3600_000L;
    private static final String STATE_URL =
        "https://anawpwprqvzxgzcpqqwu.supabase.co/rest/v1/site_settings?key=eq.public&select=value";
    private static final String ANON_KEY = "sb_publishable_hnpwDEfVVCC0BhYkxOgdwQ_E745c7rK";

    static final String ACTION_STOP_ALARM = "com.jesuiskcciste.radio.STOP_ALARM";
    static final String ACTION_DISABLE = "com.jesuiskcciste.radio.DISABLE";
    /** Alarme Android programmée à l'heure exacte d'une émission. */
    static final String ACTION_RING = "com.jesuiskcciste.radio.RING";

    private static MediaPlayer player;
    private static Vibrator vibrator;
    private static final Handler main = new Handler(Looper.getMainLooper());
    private static final Runnable autoStop = () -> stopSound();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private volatile boolean running;
    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (!running) return;
            new Thread(() -> check(getApplicationContext()), "kcc-radio-veille").start();
            handler.postDelayed(this, POLL_MS);
        }
    };

    // ---------- démarrage / arrêt ----------

    static boolean isEnabled(Context c) {
        return c.getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean("enabled", true);
    }

    static void setEnabled(Context c, boolean on) {
        c.getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("enabled", on).apply();
    }

    static void start(Context c) {
        if (!isEnabled(c)) return;
        Intent i = new Intent(c, AlertService.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignored) { }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        channels(this);
        Notification n = watchNotification();
        if (Build.VERSION.SDK_INT >= 34) startForeground(ID_WATCH, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(ID_WATCH, n);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_DISABLE.equals(intent.getAction())) {
            setEnabled(this, false);
            stopAlarm(this);
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }
        if (intent != null && ACTION_RING.equals(intent.getAction())) {
            final String key = intent.getStringExtra("key"), sa = intent.getStringExtra("startsAt");
            final String title = intent.getStringExtra("title"), topic = intent.getStringExtra("topic");
            if (key != null) new Thread(() -> ring(getSharedPreferences(PREFS, MODE_PRIVATE), key, sa == null ? "" : sa, title == null ? "" : title, topic == null ? "" : topic)).start();
        }
        if (!running) { running = true; handler.post(tick); }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        handler.removeCallbacks(tick);
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }

    // ---------- notifications ----------

    static void channels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        NotificationChannel w = new NotificationChannel(CH_WATCH, "Veille de la radio", NotificationManager.IMPORTANCE_MIN);
        w.setDescription("Indique que l'alarme des émissions est active");
        w.setShowBadge(false);
        nm.createNotificationChannel(w);
        NotificationChannel a = new NotificationChannel(CH_ALARM, "Émission en direct", NotificationManager.IMPORTANCE_HIGH);
        a.setDescription("Alarme quand une émission de la radio commence");
        a.setSound(null, null); // le son est joué par l'application (jingle d'annonce, 30 s)
        a.enableVibration(false);
        a.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        nm.createNotificationChannel(a);
    }

    private PendingIntent openApp() {
        // « play » : l'application s'ouvre et la radio démarre toute seule (réveil radio)
        Intent i = new Intent(this, MainActivity.class).putExtra("play", true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(this, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private Notification.Builder builder(String channel) {
        return Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, channel) : new Notification.Builder(this);
    }

    @SuppressWarnings("deprecation")
    private Notification watchNotification() {
        Intent off = new Intent(this, AlertService.class).setAction(ACTION_DISABLE);
        PendingIntent pOff = PendingIntent.getService(this, 3, off, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return builder(CH_WATCH)
            .setSmallIcon(R.drawable.ic_notif)
            .setContentTitle("Radio Je suis KCCiste")
            .setContentText("Alarme active : vous serez prévenu dès qu'une émission commence.")
            .setContentIntent(openApp())
            .setOngoing(true)
            .setPriority(Notification.PRIORITY_MIN)
            .addAction(new Notification.Action.Builder(null, "Désactiver l'alarme", pOff).build())
            .build();
    }

    @SuppressWarnings("deprecation")
    private void showLive(String title, String topic) {
        Intent stop = new Intent(this, AlarmActions.class).setAction(ACTION_STOP_ALARM);
        PendingIntent pStop = PendingIntent.getBroadcast(this, 4, stop, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String text = title == null || title.isEmpty() ? "Une émission est en direct maintenant." : "« " + title + " » est en direct maintenant.";
        Notification.Builder b = builder(CH_ALARM)
            .setSmallIcon(R.drawable.ic_notif)
            .setContentTitle("🔴 Radio Je suis KCCiste en direct !")
            .setContentText(text)
            .setStyle(new Notification.BigTextStyle().bigText(topic == null || topic.isEmpty() ? text : text + "\n\nSujet : " + topic))
            .setContentIntent(openApp())
            .setFullScreenIntent(openApp(), true)
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_ALARM)
            .setPriority(Notification.PRIORITY_MAX)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setDeleteIntent(pStop)
            .addAction(new Notification.Action.Builder(null, "🎧 Écouter", openApp()).build())
            .addAction(new Notification.Action.Builder(null, "Arrêter l'alarme", pStop).build());
        try { getSystemService(NotificationManager.class).notify(ID_ALARM, b.build()); } catch (SecurityException ignored) { }
    }

    // ---------- veille ----------

    private void check(Context c) {
        PowerManager pm = (PowerManager) c.getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wl = pm == null ? null : pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "kccradio:veille");
        if (wl != null) wl.acquire(20_000L);
        try {
            HttpURLConnection con = (HttpURLConnection) new URL(STATE_URL).openConnection();
            con.setConnectTimeout(15_000);
            con.setReadTimeout(15_000);
            con.setRequestProperty("apikey", ANON_KEY);
            con.setRequestProperty("Accept", "application/json");
            if (con.getResponseCode() != 200) return;
            String body;
            try (InputStream in = con.getInputStream()) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                body = out.toString("UTF-8");
            }
            JSONObject value = new org.json.JSONArray(body).getJSONObject(0).optJSONObject("value");
            JSONObject radio = value == null ? null : value.optJSONObject("radio");
            JSONObject live = radio == null ? null : radio.optJSONObject("live");
            SharedPreferences p = c.getSharedPreferences(PREFS, MODE_PRIVATE);
            long now = System.currentTimeMillis();
            // Émissions programmées : chaque début à venir reçoit une alarme Android à l'heure exacte
            // (elle sonne même téléphone en veille, sans attendre la vérification de la minute).
            org.json.JSONArray progs = radio == null ? null : radio.optJSONArray("programmes");
            String nowKey = null, nowStart = null, nowTitle = null, nowTopic = null;
            java.util.Set<String> wanted = new java.util.HashSet<>();
            if (progs != null) {
                for (int i = 0; i < progs.length(); i++) {
                    JSONObject o = progs.optJSONObject(i);
                    if (o == null) continue;
                    String startsAt = o.optString("startsAt", o.optString("starts_at", ""));
                    long start = parse(startsAt);
                    double dur = o.optDouble("durationSeconds", o.optDouble("duration_seconds", 0));
                    if (start < 0 || dur <= 0) continue;
                    long end = start + (long) (dur * 1000);
                    String key = "prog:" + o.optString("id", startsAt);
                    String title = o.optString("title", ""), topic = o.optString("topic", "");
                    if (start <= now && now < end && nowKey == null) { nowKey = key; nowStart = startsAt; nowTitle = title; nowTopic = topic; }
                    if (start > now && start - now < 8L * 86_400_000L) {
                        schedule(c, key, startsAt, start, title, topic);
                        wanted.add(key);
                    }
                }
            }
            cancelOthers(c, p, wanted);
            // 1) le direct de l'animateur
            if (live != null) {
                boolean onAir = live.optBoolean("on_air", false);
                String rtc = live.optString("rtc", "");
                String url = live.optString("url", "");
                String started = live.optString("started_at", "");
                if (onAir && (!rtc.isEmpty() || !url.isEmpty()) && fresh(started)) {
                    ring(p, started.isEmpty() ? rtc + url : started, started, live.optString("title", ""), live.optString("topic", ""));
                    return;
                }
            }
            // 2) l'émission programmée en cours (si l'alarme exacte n'a pas pu sonner)
            if (nowKey != null) ring(p, nowKey, nowStart, nowTitle, nowTopic);
        } catch (Exception ignored) {
            // pas de réseau : on réessaie à la minute suivante
        } finally {
            if (wl != null && wl.isHeld()) wl.release();
        }
    }

    private static PendingIntent ringIntent(Context c, String key, String startsAt, String title, String topic) {
        Intent i = new Intent(c, AlarmActions.class).setAction(ACTION_RING)
            .putExtra("key", key).putExtra("startsAt", startsAt).putExtra("title", title).putExtra("topic", topic);
        return PendingIntent.getBroadcast(c, key.hashCode(), i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Alarme exacte au début d'une émission programmée. */
    private void schedule(Context c, String key, String startsAt, long at, String title, String topic) {
        AlarmManager am = (AlarmManager) c.getSystemService(ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = ringIntent(c, key, startsAt, title, topic);
        try {
            if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) {
                am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, openApp()), pi);
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    /** Une émission retirée du programme : son alarme est annulée. */
    private void cancelOthers(Context c, SharedPreferences p, java.util.Set<String> wanted) {
        AlarmManager am = (AlarmManager) c.getSystemService(ALARM_SERVICE);
        java.util.Set<String> before = p.getStringSet("scheduled", new java.util.HashSet<>());
        for (String k : before) {
            if (wanted.contains(k) || am == null) continue;
            Intent i = new Intent(c, AlarmActions.class).setAction(ACTION_RING);
            PendingIntent pi = PendingIntent.getBroadcast(c, k.hashCode(), i, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (pi != null) { am.cancel(pi); pi.cancel(); }
        }
        p.edit().putStringSet("scheduled", new java.util.HashSet<>(wanted)).apply();
    }

    /** Sonne une seule fois par émission (clé déjà vue = rien). */
    private synchronized void ring(SharedPreferences p, String key, String started, String title, String topic) {
        String last = p.getString("last_live", null);
        if (key.equals(last)) return;
        p.edit().putString("last_live", key).apply();
        // première vérification après l'installation : on ne sonne que si l'émission vient de commencer
        if (last == null && !recent(started, 15 * 60_000L)) return;
        main.post(() -> { showLive(title, topic); startAlarm(getApplicationContext()); });
    }

    private static long parse(String iso) {
        if (iso == null || iso.isEmpty()) return -1;
        String s = iso.replace("Z", "+0000").replaceAll("([+-]\\d\\d):(\\d\\d)$", "$1$2");
        s = s.replaceAll("\\.(\\d{3})\\d*", ".$1");
        String[] fmts = {"yyyy-MM-dd'T'HH:mm:ss.SSSZ", "yyyy-MM-dd'T'HH:mm:ssZ"};
        for (String f : fmts) {
            try {
                SimpleDateFormat d = new SimpleDateFormat(f, Locale.US);
                d.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date dt = d.parse(s);
                if (dt != null) return dt.getTime();
            } catch (Exception ignored) { }
        }
        return -1;
    }

    private static boolean fresh(String started) {
        long t = parse(started);
        return t < 0 || System.currentTimeMillis() - t < LIVE_MAX_MS;
    }

    private static boolean recent(String started, long ms) {
        long t = parse(started);
        return t < 0 || System.currentTimeMillis() - t < ms;
    }

    // ---------- alarme 30 s ----------

    static void startAlarm(Context c) {
        stopSound();
        try {
            player = MediaPlayer.create(c, R.raw.alarme_emission,
                new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build(), 0);
            if (player != null) { player.setLooping(true); player.start(); }
        } catch (Exception ignored) { }
        try {
            vibrator = (Vibrator) c.getSystemService(VIBRATOR_SERVICE);
            long[] pattern = {0, 800, 600};
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= 26) vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                else vibrator.vibrate(pattern, 0);
            }
        } catch (Exception ignored) { }
        main.postDelayed(autoStop, ALARM_MS);
    }

    static void stopSound() {
        main.removeCallbacks(autoStop);
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) { }
            player.release();
            player = null;
        }
        if (vibrator != null) { vibrator.cancel(); vibrator = null; }
    }

    /** Arrête le son (la notification reste pour qu'on puisse encore ouvrir l'émission). */
    static void stopAlarm(Context c) {
        stopSound();
    }
}
