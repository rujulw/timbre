package com.rujulw.timbre.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class SpotifyTrackDTO {

    private String id;
    private String name;
    private int popularity;

    @JsonProperty("duration_ms")
    private long durationMs;

    @JsonProperty("external_urls")
    private ExternalUrls externalUrls;

    private List<Artist> artists;
    private Album album;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPopularity() {
        return popularity;
    }

    public void setPopularity(int popularity) {
        this.popularity = popularity;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }

    public ExternalUrls getExternalUrls() {
        return externalUrls;
    }

    public void setExternalUrls(ExternalUrls externalUrls) {
        this.externalUrls = externalUrls;
    }

    public List<Artist> getArtists() {
        return artists;
    }

    public void setArtists(List<Artist> artists) {
        this.artists = artists;
    }

    public Album getAlbum() {
        return album;
    }

    public void setAlbum(Album album) {
        this.album = album;
    }

    public static class Artist {
        private String name;

        @JsonProperty("external_urls")
        private ExternalUrls externalUrls;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public ExternalUrls getExternalUrls() {
            return externalUrls;
        }

        public void setExternalUrls(ExternalUrls externalUrls) {
            this.externalUrls = externalUrls;
        }
    }

    public static class Album {
        private String id;
        private String name;
        private List<Image> images;

        @JsonProperty("external_urls")
        private Map<String, String> externalUrls;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<Image> getImages() {
            return images;
        }

        public void setImages(List<Image> images) {
            this.images = images;
        }

        public Map<String, String> getExternalUrls() {
            return externalUrls;
        }

        public void setExternalUrls(Map<String, String> externalUrls) {
            this.externalUrls = externalUrls;
        }
    }

    public static class Image {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class ExternalUrls {
        private String spotify;

        public String getSpotify() {
            return spotify;
        }

        public void setSpotify(String spotify) {
            this.spotify = spotify;
        }
    }
}
