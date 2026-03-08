package com.rujulw.timbre.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SpotifyArtistDTO {

    private String id;
    private String name;
    private int popularity;
    private List<String> genres;
    private List<Image> images;

    @JsonProperty("external_urls")
    private SpotifyTrackDTO.ExternalUrls externalUrls;

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

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
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

    public static class Image {
        private String url;
        private int height;
        private int width;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public int getHeight() {
            return height;
        }

        public void setHeight(int height) {
            this.height = height;
        }

        public int getWidth() {
            return width;
        }

        public void setWidth(int width) {
            this.width = width;
        }
    }
}
