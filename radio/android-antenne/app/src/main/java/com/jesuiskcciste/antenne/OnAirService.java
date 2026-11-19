package com.jesuiskcciste.antenne;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** Pendant le direct : notification « À l'antenne », micro et connexion gardés actifs. */
public class OnAirService extends Service {
    private static final String CH = "antenne";
    private PowerManager.WakeLock lock;

    @Override
    @SuppressWarnings("deprecation")
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent == null ? "" : intent.getStringExtra("title");
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CH, "À l'antenne", NotificationManager.IMPORTANCE_LOW);
            c.setDescription("Affichée pendant le direct de la radio");
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
        PendingIntent open = PendingIntent.getActivity(this, 1,
            new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        Notification n = b.setSmallIcon(R.drawable.ic_notif)
            .setContentTitle("🔴 À l'antenne · Radio Je suis KCCiste")
            .setContentText(title == null || title.isEmpty() ? "Le direct est en cours." : title)
            .setContentIntent(open)
            .setOngoing(true)
            .build();
        try {
            if (Build.VERSION.SDK_INT >= 30) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
            else startForeground(1, n);
        } catch (Exception e) {
            stopSelf();
            return START_NOT_STICKY;
        }
        if (lock == null) {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            lock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "kccstudio:antenne");
            lock.acquire(6L * 3600_000L);
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        if (lock != null && lock.isHeld()) lock.release();
        lock = null;
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
