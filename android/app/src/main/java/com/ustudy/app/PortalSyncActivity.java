package com.ustudy.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.net.http.SslError;
import android.view.Gravity;
import android.view.View;
import android.webkit.SslErrorHandler;
import android.net.http.SslCertificate;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.DateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;
import org.json.JSONObject;

public class PortalSyncActivity extends AppCompatActivity {
    public static final String EXTRA_URL = "portal_url";
    public static final String EXTRA_RUNNER_SOURCE = "portal_runner_source";
    public static final String EXTRA_RUNTIME_JSON = "portal_runtime_json";
    public static final String EXTRA_RESULT_PATH = "portal_result_path";

    private static final Pattern PORTAL_HOST = Pattern.compile("^new-portal\\d+\\.hcmus\\.edu\\.vn$", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOGIN_PATH = Pattern.compile("^/Login\\.aspx(?:/.*)?$", Pattern.CASE_INSENSITIVE);

    private WebView webView;
    private View loadingOverlay;
    private ProgressBar loadingProgress;
    private TextView loadingMessage;
    private Button retryButton;
    private String startUrl;
    private String runnerSource;
    private String runtimeJson;
    private String acceptedCertificateFingerprint;
    private boolean hasMainFrameError;
    private final String bridgeToken = UUID.randomUUID().toString();
    private final AtomicBoolean syncRunning = new AtomicBoolean(false);
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Runnable syncTimeout = () -> {
        if (!syncRunning.compareAndSet(true, false)) return;
        updateStatus("Đồng bộ quá thời gian chờ. Hãy thử lại.", true);
    };

    @Override
    @SuppressLint({ "SetJavaScriptEnabled", "AddJavascriptInterface" })
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startUrl = getIntent().getStringExtra(EXTRA_URL);
        runnerSource = getIntent().getStringExtra(EXTRA_RUNNER_SOURCE);
        runtimeJson = getIntent().getStringExtra(EXTRA_RUNTIME_JSON);
        if (!isSupportedPortalUrl(startUrl) || runnerSource == null || runtimeJson == null) {
            setResult(Activity.RESULT_CANCELED);
            finish();
            return;
        }

        getWindow().setStatusBarColor(Color.rgb(0, 58, 120));
        setContentView(createLayout());

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        String userAgent = webView.getSettings().getUserAgentString();
        webView.getSettings().setUserAgentString(userAgent.replace("; wv", "") + " UStudyMobile/0.2");
        webView.setBackgroundColor(Color.WHITE);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        webView.addJavascriptInterface(new PortalJavascriptBridge(), "UStudyAndroid");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int progress) {
                super.onProgressChanged(view, progress);
                if (!hasMainFrameError && loadingMessage != null && loadingOverlay.getVisibility() == View.VISIBLE) {
                    loadingMessage.setText(progress < 100 ? "Đang tải HCMUS Portal... " + progress + "%" : "Đang hoàn tất...");
                }
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                hasMainFrameError = false;
                showLoading("Đang tải HCMUS Portal...");
                if (syncRunning.getAndSet(false)) cancelSyncTimeout();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!request.isForMainFrame()) return false;
                if (isSupportedPortalUri(uri)) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    showLoadError("Không thể mở liên kết ngoài Portal.");
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (!request.isForMainFrame()) return;
                hasMainFrameError = true;
                showLoadError("Không tải được Portal: " + error.getDescription());
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
                if (!request.isForMainFrame() || errorResponse.getStatusCode() < 400) return;
                hasMainFrameError = true;
                showLoadError("Portal phản hồi lỗi HTTP " + errorResponse.getStatusCode() + ".");
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handlePortalSslError(handler, error);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                CookieManager.getInstance().flush();
                if (!hasMainFrameError) hideLoading();
                if (isLoggedInPortalUrl(url)) {
                    view.postDelayed(() -> injectSyncLauncher(), 500);
                }
            }
        });
        webView.loadUrl(startUrl);
    }

    private View createLayout() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(8), 0, dp(8), 0);
        toolbar.setBackgroundColor(Color.rgb(0, 74, 152));
        root.addView(toolbar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56)));

        ImageButton backButton = new ImageButton(this);
        backButton.setImageResource(android.R.drawable.ic_media_previous);
        backButton.setColorFilter(Color.WHITE);
        backButton.setBackgroundColor(Color.TRANSPARENT);
        backButton.setContentDescription("Quay lại");
        backButton.setOnClickListener(view -> handleBack());
        toolbar.addView(backButton, new LinearLayout.LayoutParams(dp(48), dp(48)));

        TextView title = new TextView(this);
        title.setText("HCMUS Portal");
        title.setTextColor(Color.WHITE);
        title.setTextSize(17);
        title.setTypeface(title.getTypeface(), android.graphics.Typeface.BOLD);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        ImageButton closeButton = new ImageButton(this);
        closeButton.setImageResource(android.R.drawable.ic_menu_close_clear_cancel);
        closeButton.setColorFilter(Color.WHITE);
        closeButton.setBackgroundColor(Color.TRANSPARENT);
        closeButton.setContentDescription("Đóng Portal");
        closeButton.setOnClickListener(view -> cancelAndFinish());
        toolbar.addView(closeButton, new LinearLayout.LayoutParams(dp(48), dp(48)));

        FrameLayout content = new FrameLayout(this);
        root.addView(content, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));

        webView = new WebView(this);
        content.addView(webView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        LinearLayout loadingContent = new LinearLayout(this);
        loadingContent.setOrientation(LinearLayout.VERTICAL);
        loadingContent.setGravity(Gravity.CENTER);
        loadingContent.setPadding(dp(28), dp(28), dp(28), dp(28));
        loadingContent.setBackgroundColor(Color.WHITE);
        content.addView(loadingContent, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        loadingOverlay = loadingContent;

        loadingProgress = new ProgressBar(this);
        loadingContent.addView(loadingProgress, new LinearLayout.LayoutParams(dp(40), dp(40)));

        loadingMessage = new TextView(this);
        loadingMessage.setText("Đang tải HCMUS Portal...");
        loadingMessage.setTextColor(Color.rgb(71, 85, 105));
        loadingMessage.setTextSize(14);
        loadingMessage.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams messageParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        messageParams.topMargin = dp(14);
        loadingContent.addView(loadingMessage, messageParams);

        retryButton = new Button(this);
        retryButton.setText("Thử tải lại");
        retryButton.setTextColor(Color.WHITE);
        retryButton.setBackgroundColor(Color.rgb(0, 74, 152));
        retryButton.setVisibility(View.GONE);
        retryButton.setOnClickListener(view -> {
            hasMainFrameError = false;
            showLoading("Đang tải lại HCMUS Portal...");
            webView.loadUrl(webView.getUrl() == null ? startUrl : webView.getUrl());
        });
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(48));
        retryParams.topMargin = dp(18);
        loadingContent.addView(retryButton, retryParams);
        return root;
    }

    private void showLoading(String message) {
        runOnUiThread(() -> {
            if (loadingOverlay == null) return;
            loadingOverlay.setVisibility(View.VISIBLE);
            loadingProgress.setVisibility(View.VISIBLE);
            retryButton.setVisibility(View.GONE);
            loadingMessage.setText(message);
            loadingMessage.setTextColor(Color.rgb(71, 85, 105));
        });
    }

    private void hideLoading() {
        runOnUiThread(() -> {
            if (loadingOverlay != null) loadingOverlay.setVisibility(View.GONE);
        });
    }

    private void showLoadError(String message) {
        runOnUiThread(() -> {
            if (loadingOverlay == null) return;
            loadingOverlay.setVisibility(View.VISIBLE);
            loadingProgress.setVisibility(View.GONE);
            retryButton.setVisibility(View.VISIBLE);
            loadingMessage.setText(message);
            loadingMessage.setTextColor(Color.rgb(185, 28, 28));
        });
    }

    private void handlePortalSslError(SslErrorHandler handler, SslError error) {
        Uri uri = Uri.parse(error.getUrl());
        SslCertificate certificate = error.getCertificate();
        String commonName = certificate == null ? null : certificate.getIssuedTo().getCName();
        Date validFrom = certificate == null ? null : certificate.getValidNotBeforeDate();
        Date validUntil = certificate == null ? null : certificate.getValidNotAfterDate();
        Date now = new Date();
        boolean validDate = validFrom != null && validUntil != null && !now.before(validFrom) && !now.after(validUntil);
        boolean expectedCertificate = "*.hcmus.edu.vn".equalsIgnoreCase(commonName);
        boolean canConfirm = isSupportedPortalUri(uri)
            && error.getPrimaryError() == SslError.SSL_UNTRUSTED
            && expectedCertificate
            && validDate;
        String fingerprint = getCertificateFingerprint(certificate);

        if (canConfirm && !fingerprint.isEmpty() && fingerprint.equals(acceptedCertificateFingerprint)) {
            handler.proceed();
            return;
        }

        if (!canConfirm) {
            handler.cancel();
            hasMainFrameError = true;
            showLoadError(getSslErrorMessage(error));
            return;
        }

        showLoading("Đang chờ xác nhận chứng chỉ Portal...");
        String validUntilLabel = DateFormat.getDateInstance(DateFormat.MEDIUM, new Locale("vi", "VN")).format(validUntil);
        new AlertDialog.Builder(this)
            .setTitle("Xác nhận chứng chỉ HCMUS Portal")
            .setMessage(
                "Android trên máy chưa tin cậy CA của Portal, nhưng chứng chỉ được cấp đúng cho *.hcmus.edu.vn " +
                "và còn hạn đến " + validUntilLabel + ".\n\n" +
                "Chỉ tiếp tục khi thanh địa chỉ đang là new-portal<so>.hcmus.edu.vn."
            )
            .setPositiveButton("Tiếp tục lần này", (dialog, which) -> {
                acceptedCertificateFingerprint = fingerprint;
                hasMainFrameError = false;
                showLoading("Đang tải HCMUS Portal...");
                handler.proceed();
            })
            .setNegativeButton("Hủy", (dialog, which) -> {
                handler.cancel();
                hasMainFrameError = true;
                showLoadError("Bạn đã hủy tải Portal do cảnh báo chứng chỉ.");
            })
            .setOnCancelListener(dialog -> {
                handler.cancel();
                hasMainFrameError = true;
                showLoadError("Bạn đã hủy tải Portal do cảnh báo chứng chỉ.");
            })
            .show();
    }

    private String getCertificateFingerprint(SslCertificate certificate) {
        if (certificate == null) return "";
        try {
            Bundle state = SslCertificate.saveState(certificate);
            byte[] encoded = state == null ? null : state.getByteArray("x509-certificate");
            if (encoded == null) return "";
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(encoded);
            StringBuilder result = new StringBuilder();
            for (byte value : digest) result.append(String.format(Locale.US, "%02X", value));
            return result.toString();
        } catch (Exception ignored) {
            return "";
        }
    }

    private String getSslErrorMessage(SslError error) {
        switch (error.getPrimaryError()) {
            case SslError.SSL_EXPIRED:
                return "Chứng chỉ Portal đã hết hạn.";
            case SslError.SSL_IDMISMATCH:
                return "Tên miền Portal không khớp với chứng chỉ bảo mật.";
            case SslError.SSL_NOTYETVALID:
                return "Chứng chỉ Portal chưa có hiệu lực.";
            case SslError.SSL_DATE_INVALID:
                return "Ngày hiệu lực của chứng chỉ Portal không hợp lệ.";
            case SslError.SSL_UNTRUSTED:
                return "Chứng chỉ không đúng mẫu an toàn của HCMUS Portal.";
            default:
                return "Không thể xác minh chứng chỉ bảo mật của Portal.";
        }
    }

    private void injectSyncLauncher() {
        if (webView == null || !isLoggedInPortalUrl(webView.getUrl())) return;
        String token = JSONObject.quote(bridgeToken);
        String script = "(function(){" +
            "var old=document.getElementById('ustudy-mobile-sync');if(old)old.remove();" +
            "var root=document.createElement('div');root.id='ustudy-mobile-sync';" +
            "root.style.cssText='position:fixed;right:14px;bottom:18px;z-index:2147483647;font-family:Inter,Arial,sans-serif;';" +
            "var btn=document.createElement('button');btn.type='button';btn.textContent='Đồng bộ với UStudy';" +
            "btn.style.cssText='min-height:48px;border:0;border-radius:10px;padding:0 18px;background:#004A98;color:#fff;font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(0,46,96,.28);';" +
            "var note=document.createElement('div');note.style.cssText='display:none;margin-top:7px;max-width:240px;border:1px solid #dbe5ef;border-radius:8px;padding:8px 10px;background:#fff;color:#334155;font-size:12px;line-height:1.4;box-shadow:0 8px 24px rgba(15,23,42,.18);';" +
            "root.appendChild(btn);root.appendChild(note);document.body.appendChild(root);" +
            "window.__USTUDY_MOBILE_SET_STATUS__=function(message,isError){note.style.display='block';note.textContent=message;note.style.color=isError?'#b91c1c':'#334155';btn.disabled=!isError;btn.style.opacity=isError?'1':'.75';if(isError)btn.textContent='Thử lại đồng bộ';};" +
            "btn.onclick=function(){btn.disabled=true;btn.style.opacity='.75';btn.textContent='Đang đồng bộ...';note.style.display='block';note.textContent='Đang thu thập dữ liệu từ Portal';UStudyAndroid.startSync(" + token + ");};" +
            "})();";
        webView.evaluateJavascript(script, null);
    }

    private void runCrawler() {
        if (webView == null || !isLoggedInPortalUrl(webView.getUrl())) {
            syncRunning.set(false);
            updateStatus("Hãy đăng nhập Portal trước khi đồng bộ.", true);
            return;
        }

        String token = JSONObject.quote(bridgeToken);
        String listener = "(function(){" +
            "if(window.__USTUDY_MOBILE_MESSAGE_HANDLER__)window.removeEventListener('message',window.__USTUDY_MOBILE_MESSAGE_HANDLER__);" +
            "window.__USTUDY_MOBILE_MESSAGE_HANDLER__=function(event){var m=event.data;if(event.source!==window||!m||m.channel!=='USTUDY_PORTAL_SYNC')return;" +
            "if(m.type==='USTUDY_PORTAL_SYNC_PROGRESS')UStudyAndroid.onProgress(" + token + ",String(m.message||'Đang đồng bộ...'));" +
            "else if(m.type==='USTUDY_PORTAL_SYNC_RESULT')UStudyAndroid.onSyncResult(" + token + ",JSON.stringify(m.payload));" +
            "else if(m.type==='USTUDY_PORTAL_SYNC_ERROR')UStudyAndroid.onSyncError(" + token + ",String(m.message||'Đồng bộ thất bại'));};" +
            "window.addEventListener('message',window.__USTUDY_MOBILE_MESSAGE_HANDLER__);" +
            "window.__USTUDY_PORTAL_SYNC_RUNTIME__=" + runtimeJson + ";" +
            "})();";
        webView.evaluateJavascript(listener, ignored -> webView.evaluateJavascript(runnerSource, null));
    }

    private void updateStatus(String message, boolean isError) {
        if (webView == null) return;
        String script = "window.__USTUDY_MOBILE_SET_STATUS__&&window.__USTUDY_MOBILE_SET_STATUS__(" +
            JSONObject.quote(message) + "," + isError + ");";
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    private void completeSync(String packetJson) {
        cancelSyncTimeout();
        try {
            File resultFile = File.createTempFile("portal-sync-", ".json", getCacheDir());
            try (FileOutputStream output = new FileOutputStream(resultFile)) {
                output.write(packetJson.getBytes(StandardCharsets.UTF_8));
            }
            Intent result = new Intent();
            result.putExtra(EXTRA_RESULT_PATH, resultFile.getAbsolutePath());
            setResult(Activity.RESULT_OK, result);
            finish();
        } catch (Exception error) {
            syncRunning.set(false);
            updateStatus("Không thể lưu kết quả: " + error.getMessage(), true);
        }
    }

    private boolean isSupportedPortalUrl(String value) {
        if (value == null) return false;
        try {
            return isSupportedPortalUri(Uri.parse(value));
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean isSupportedPortalUri(Uri uri) {
        return uri != null && "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null && PORTAL_HOST.matcher(uri.getHost()).matches();
    }

    private boolean isLoggedInPortalUrl(String value) {
        if (!isSupportedPortalUrl(value)) return false;
        String path = Uri.parse(value).getPath();
        return path != null && !LOGIN_PATH.matcher(path).matches();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void handleBack() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else cancelAndFinish();
    }

    private void cancelAndFinish() {
        cancelSyncTimeout();
        setResult(Activity.RESULT_CANCELED);
        finish();
    }

    private void cancelSyncTimeout() {
        mainHandler.removeCallbacks(syncTimeout);
    }

    @Override
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onDestroy() {
        cancelSyncTimeout();
        if (webView != null) {
            webView.removeJavascriptInterface("UStudyAndroid");
            webView.destroy();
        }
        super.onDestroy();
    }

    private class PortalJavascriptBridge {
        @JavascriptInterface
        public void startSync(String token) {
            if (!bridgeToken.equals(token) || !syncRunning.compareAndSet(false, true)) return;
            mainHandler.postDelayed(syncTimeout, 120_000);
            runOnUiThread(() -> runCrawler());
        }

        @JavascriptInterface
        public void onProgress(String token, String message) {
            if (!bridgeToken.equals(token)) return;
            updateStatus(message, false);
        }

        @JavascriptInterface
        public void onSyncResult(String token, String packetJson) {
            if (!bridgeToken.equals(token) || packetJson == null || packetJson.length() < 2) return;
            runOnUiThread(() -> completeSync(packetJson));
        }

        @JavascriptInterface
        public void onSyncError(String token, String message) {
            if (!bridgeToken.equals(token)) return;
            syncRunning.set(false);
            cancelSyncTimeout();
            updateStatus(message, true);
        }
    }
}
