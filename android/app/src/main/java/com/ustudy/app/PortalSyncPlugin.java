package com.ustudy.app;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "PortalSync")
public class PortalSyncPlugin extends Plugin {
    @PluginMethod
    public void openPortal(PluginCall call) {
        String url = call.getString("url");
        String runnerSource = call.getString("runnerSource");
        String runtimeJson = call.getString("runtimeJson");
        if (url == null || runnerSource == null || runtimeJson == null) {
            call.reject("Thiếu cấu hình đồng bộ Portal.");
            return;
        }

        Intent intent = new Intent(getContext(), PortalSyncActivity.class);
        intent.putExtra(PortalSyncActivity.EXTRA_URL, url);
        intent.putExtra(PortalSyncActivity.EXTRA_RUNNER_SOURCE, runnerSource);
        intent.putExtra(PortalSyncActivity.EXTRA_RUNTIME_JSON, runtimeJson);
        startActivityForResult(call, intent, "handlePortalResult");
    }

    @ActivityCallback
    private void handlePortalResult(PluginCall call, ActivityResult activityResult) {
        if (call == null) return;
        if (activityResult.getResultCode() != Activity.RESULT_OK || activityResult.getData() == null) {
            call.reject("Đã hủy đồng bộ Portal.");
            return;
        }

        String resultPath = activityResult.getData().getStringExtra(PortalSyncActivity.EXTRA_RESULT_PATH);
        if (resultPath == null) {
            call.reject("Không nhận được dữ liệu từ Portal.");
            return;
        }

        File resultFile = new File(resultPath);
        try {
            String cachePath = getContext().getCacheDir().getCanonicalPath();
            String canonicalResultPath = resultFile.getCanonicalPath();
            if (!canonicalResultPath.startsWith(cachePath + File.separator)) {
                call.reject("Đường dẫn kết quả không hợp lệ.");
                return;
            }

            StringBuilder packetJson = new StringBuilder();
            try (
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(resultFile), StandardCharsets.UTF_8)
                )
            ) {
                String line;
                while ((line = reader.readLine()) != null) packetJson.append(line);
            }

            JSObject result = new JSObject();
            result.put("packetJson", packetJson.toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Không thể đọc dữ liệu Portal: " + error.getMessage(), error);
        } finally {
            if (resultFile.exists()) resultFile.delete();
        }
    }
}
