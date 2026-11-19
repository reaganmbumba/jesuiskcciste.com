package com.jesuiskcciste.radio;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Bouton « Arrêter l'alarme » de la notification, et alarme exacte du début d'une émission programmée. */
public class AlarmActions extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && AlertService.ACTION_RING.equals(intent.getAction())) {
            if (!AlertService.isEnabled(context)) return;
            Intent s = new Intent(context, AlertService.class).setAction(AlertService.ACTION_RING).putExtras(intent);
            try {
                if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(s); else context.startService(s);
            } catch (Exception ignored) { }
            return;
        }
        AlertService.stopAlarm(context);
    }
}
