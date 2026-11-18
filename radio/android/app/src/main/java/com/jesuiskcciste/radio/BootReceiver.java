package com.jesuiskcciste.radio;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Relance la veille des émissions après un redémarrage du téléphone ou une mise à jour. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        AlertService.start(context);
    }
}
