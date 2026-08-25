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
            java.net.URI uri = new java.net.URI(value);
            return isSupportedPortalLocation(uri.getScheme(), uri.getHost());
        } catch (Exception ignored) {
            return false;
        }
    }

    static boolean isSupportedPortalUri(Uri uri) {
        return uri != null && isSupportedPortalLocation(uri.getScheme(), uri.getHost());
    }

    static boolean isLoggedInPortalUrl(String value) {
        if (!isSupportedPortalUrl(value)) return false;
        try {
            String path = new java.net.URI(value).getPath();
            return path != null && !LOGIN_PATH.matcher(path).matches();
        } catch (Exception ignored) {
            return false;
        }
    }

    private static boolean isSupportedPortalLocation(String scheme, String host) {
        return "https".equalsIgnoreCase(scheme)
            && host != null
            && PORTAL_HOST.matcher(host).matches();
    }
}
