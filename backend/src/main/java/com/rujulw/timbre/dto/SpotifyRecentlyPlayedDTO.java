package com.rujulw.timbre.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SpotifyRecentlyPlayedDTO {

    @JsonProperty("played_at")
    private String playedAt;

    private SpotifyTrackDTO track;
    private Context context;

    public String getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(String playedAt) {
        this.playedAt = playedAt;
    }

    public SpotifyTrackDTO getTrack() {
        return track;
    }

    public void setTrack(SpotifyTrackDTO track) {
        this.track = track;
    }

    public Context getContext() {
        return context;
    }

    public void setContext(Context context) {
        this.context = context;
    }

    public static class Context {
        private String type;
        private String uri;
        private String href;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getUri() {
            return uri;
        }

        public void setUri(String uri) {
            this.uri = uri;
        }

        public String getHref() {
            return href;
        }

        public void setHref(String href) {
            this.href = href;
        }
    }
}
