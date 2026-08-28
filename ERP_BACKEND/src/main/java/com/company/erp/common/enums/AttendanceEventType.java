package com.company.erp.common.enums;

public enum AttendanceEventType {
    CHECK_IN,
    CHECK_OUT;

    public static AttendanceEventType fromString(String value) {
        if (value == null) {
            return null;
        }

        return switch (value.trim().toUpperCase()) {
            case "CHECK_IN", "CHECKIN", "IN" -> CHECK_IN;
            case "CHECK_OUT", "CHECKOUT", "OUT" -> CHECK_OUT;
            default -> null;
        };
    }
}
