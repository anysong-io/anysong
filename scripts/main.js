/**
 * anysong
 */
define(function(require) {
    // Third-party dependencies
    var log = require("loglevel");
    var URI = require("urijs");
    var $ = require("jquery");
    // Internal dependencies
    var ui = require("ui");
    var player = require("player");
    log.setLevel("trace");

    log.trace("Starting app");

    var youtubeConfig = {
        key : "AIzaSyDZklGPG1Gu0lUsZ36EMrgoz_T1xd01PxY",
        type: "video",
        part: "id,snippet",
        fields: 'items/id/videoId,items/snippet/title',
        maxResults: 1
    };

    /**
     * Search for a string and pass the id and title of the first result to {callback}
     * @param query
     * @param callback
     */
    window.search = function(query, callback) {
        log.trace("search", arguments);

        if(typeof query !== "string" || typeof callback !== "function") {
            log.error("Invalid arguments provided to 'search' method");
            return;
        }

        var url = new URI("https://www.googleapis.com/youtube/v3/search")
            .query(youtubeConfig)
            .addQuery("q", query);
        log.debug("created search url: "+url);

        $.ajax({
            url: url,
            success: function(data) {
                log.trace("search.ajax.success", arguments);

                if(!data || !data.items || data.items.length === 0) {
                    log.debug("no results while searching for: '"+query+"'.");
                    ui.displaySearchError("Couldn't find anything for that query.");
                } else {
                    callback(data.items[0].id.videoId, data.items[0].snippet.title);
                }
            },
            error: function(jqXHR, errorType, errorMessage) {
                log.trace("search.ajax.error", arguments);
                log.error("error while searching for: '"+query+"'. [type="+errorType+" message="+errorMessage+"]");
                ui.displaySearchError("Oops, we weren't able to complete your search. Please try again.");
            }
        })
    };

    /**
     * Play the given youtube video
     * @param id
     * @param title
     */
    window.play = function(id, title) {
        log.trace("play", arguments);

        player.loadVideoById(id);
        player.playVideo();

        var downloadLink = "<a href='http://youtubeinmp3.com/fetch/?video=http://www.youtube.com/watch?v="
            + id +"' class='download-link icon-arrow-down'></a>&nbsp;&nbsp;";
        ui.setPlayerTitle(downloadLink + title);
        ui.showPlayer();
    };


    ui.onSearch(function(query) {
        search(query, play);
    })
});