package com.ustudy.app;

import android.net.Uri;
import java.util.regex.Pattern;

final class PortalUrlPolicy {
    private static final Pattern PORTAL_HOST =
        Pattern.compile("^new-portal\\d*\\.hcmus\\.edu\\.vn$", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOGIN_PATH =
        Pattern.compile("^/+Login\\.aspx(?:/.*)?$", Pattern.CASE_INSENSITIVE);

    private PortalUrlPolicy() {}

    static boolean isSupportedPortalUrl(String value) {
        if (value == null) return false;
        try {
            return isSupportedPortalUri(Uri.parse(value));
        } catch (Exception ignored) {
            return false;
        }
    }

    static boolean isSupportedPortalUri(Uri uri) {
        return uri != null
            && "https".equalsIgnoreCase(uri.getScheme())
            && uri.getHost() != null
            && PORTAL_HOST.matcher(uri.getHost()).matches();
    }

    static boolean isLoggedInPortalUrl(String value) {
        if (!isSupportedPortalUrl(value)) return false;
        String path = Uri.parse(value).getPath();
        return path != null && !LOGIN_PATH.matcher(path).matches();
    }
}
