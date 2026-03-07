package com.rujulw.timbre.service;

import com.rujulw.timbre.dto.SpotifyTokenResponse;
import com.rujulw.timbre.dto.SpotifyUserDTO;
import com.rujulw.timbre.model.User;
import com.rujulw.timbre.repository.UserRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User syncUser(SpotifyUserDTO spotifyUser, SpotifyTokenResponse tokens) {
        return userRepository.findBySpotifyId(spotifyUser.getId())
                .map(existing -> updateUser(existing, spotifyUser, tokens))
                .orElseGet(() -> createUser(spotifyUser, tokens));
    }

    private User createUser(SpotifyUserDTO spotifyUser, SpotifyTokenResponse tokens) {
        User user = new User();
        user.setSpotifyId(spotifyUser.getId());
        return updateUser(user, spotifyUser, tokens);
    }

    private User updateUser(User user, SpotifyUserDTO spotifyUser, SpotifyTokenResponse tokens) {
        user.setDisplayName(spotifyUser.getDisplayName());
        user.setEmail(spotifyUser.getEmail());

        if (spotifyUser.getImages() != null && !spotifyUser.getImages().isEmpty()) {
            user.setProfileImageUrl(spotifyUser.getImages().get(0).getUrl());
        }

        user.setAccessToken(tokens.getAccessToken());
        user.setRefreshToken(tokens.getRefreshToken());
        user.setTokenExpiresAt(Instant.now().plusSeconds(tokens.getExpiresIn()));

        return userRepository.save(user);
    }
}
