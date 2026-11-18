package com.jesuiskcciste.radio;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Bouton « Arrêter l'alarme » de la notification (ou notification balayée). */
public class AlarmActions extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        AlertService.stopAlarm(context);
    }
}
