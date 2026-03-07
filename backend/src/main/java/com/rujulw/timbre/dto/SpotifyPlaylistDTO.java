package com.rujulw.timbre.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SpotifyPlaylistDTO {

    private String id;
    private String name;
    private List<Image> images;

    @JsonProperty("external_urls")
    private SpotifyTrackDTO.ExternalUrls externalUrls;

    private Tracks tracks;

    @JsonProperty("public")
    private Boolean publicPlaylist;

    private Boolean collaborative;

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

    public SpotifyTrackDTO.ExternalUrls getExternalUrls() {
        return externalUrls;
    }

    public void setExternalUrls(SpotifyTrackDTO.ExternalUrls externalUrls) {
        this.externalUrls = externalUrls;
    }

    public Tracks getTracks() {
        return tracks;
    }

    public void setTracks(Tracks tracks) {
        this.tracks = tracks;
    }

    public Boolean getPublicPlaylist() {
        return publicPlaylist;
    }

    public void setPublicPlaylist(Boolean publicPlaylist) {
        this.publicPlaylist = publicPlaylist;
    }

    public Boolean getCollaborative() {
        return collaborative;
    }

    public void setCollaborative(Boolean collaborative) {
        this.collaborative = collaborative;
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

    public static class Tracks {
        private Integer total;

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }
    }
}
