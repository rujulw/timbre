package com.rujulw.timbre.dto;

import java.util.List;

public class SpotifyPager<T> {

    private List<T> items;

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }
}
