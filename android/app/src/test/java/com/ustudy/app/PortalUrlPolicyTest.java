package com.ustudy.app;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class PortalUrlPolicyTest {
    @Test
    public void acceptsCanonicalAndNumberedPortalHosts() {
        assertTrue(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal.hcmus.edu.vn/Login.aspx"));
        assertTrue(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal1.hcmus.edu.vn/"));
        assertTrue(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal8.hcmus.edu.vn//Login.aspx"));
        assertTrue(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal27.hcmus.edu.vn/"));
    }

    @Test
    public void rejectsUnsupportedSchemesAndHosts() {
        assertFalse(PortalUrlPolicy.isSupportedPortalUrl("http://new-portal.hcmus.edu.vn/Login.aspx"));
        assertFalse(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal.evil.example/Login.aspx"));
        assertFalse(PortalUrlPolicy.isSupportedPortalUrl("https://new-portal.hcmus.edu.vn.evil.example/Login.aspx"));
    }

    @Test
    public void onlyTreatsNonLoginPagesAsLoggedIn() {
        assertFalse(PortalUrlPolicy.isLoggedInPortalUrl("https://new-portal.hcmus.edu.vn/Login.aspx"));
        assertFalse(PortalUrlPolicy.isLoggedInPortalUrl("https://new-portal7.hcmus.edu.vn/Login.aspx/extra"));
        assertTrue(PortalUrlPolicy.isLoggedInPortalUrl("https://new-portal.hcmus.edu.vn/Student.aspx"));
    }
}
