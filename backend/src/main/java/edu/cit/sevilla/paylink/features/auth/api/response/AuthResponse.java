package edu.cit.sevilla.paylink.features.auth.api.response;

import edu.cit.sevilla.paylink.enums.Role;

public record AuthResponse(
                String token,
                Long userId,
                String username,
                String email,
                Role role) {
}
