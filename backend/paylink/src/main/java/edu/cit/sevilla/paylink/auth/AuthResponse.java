package edu.cit.sevilla.paylink.auth;

import edu.cit.sevilla.paylink.user.Role;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        String email,
        Role role
) {
}
