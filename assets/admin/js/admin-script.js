var wpHowTo_fsNotFree = plugin_data.fs_not_free;
var wpHowTo_icon = document.querySelector('.wp-how-to.slide-in .icon');
// Hide slide-in show/hide icon until the player api has loaded
wpHowTo_icon.style.display = 'none';
// Declare vars to be used later (inside document.ready function)
var wpHowTo_player;
var wpHowTo_timePassed;
var wpHowTo_websiteBase = 'https://wphowto.tv';
var wpHowTo_licenseHandle = 'wp-how-to-premium-license';
var wpHowTo_premiumLicense = JSON.parse(localStorage.getItem(wpHowTo_licenseHandle));
// Initial license detection
if (wpHowTo_premiumLicense === null) {
    localStorage.setItem(wpHowTo_licenseHandle, JSON.stringify(wpHowTo_fsNotFree));
}
var wpHowTo_embeddedWebsite = document.getElementById("wp-how-to-embed");
var wpHowTo_lastWatchedHandle = 'wp-how-to-last-watched';
var wpHowTo_timeHandle = 'wp-how-to-time-passed';
var wpHowTo_pageWidth = window.innerWidth;
var wpHowTo_pageHeight = window.innerHeight;
var wpHowTo_lastWatchedLink = JSON.parse(localStorage.getItem(wpHowTo_lastWatchedHandle));
// Youtube API player declaration
function onYouTubeIframeAPIReady() {
    wpHowTo_player = new YT.Player('wp-how-to-player', {
        height: '100%',
        width: '100%',
        videoId: 'yC6ZfIF',
        playerVars: {
            'playsinline': 1,
            'origin': 'https://www.youtube.com',
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
// Adjust embed youtube links to fit player iframe api
function wpHowTo_adjustLinks(link) {
    var modifiedLink = {};
    var videoLinkPrepend = 'https://www.youtube.com/embed/';
    var videoLinkAppend = '?feature=oembed';
    var listLinkAppend = 'https://www.youtube.com/embed/videoseries?list=';
    if (link.indexOf(videoLinkAppend) !== -1) {
        var removedAppend = link.replace(videoLinkAppend, '');
        var removePrepend = removedAppend.replace(videoLinkPrepend, '');
        modifiedLink['type'] = 'video';
        modifiedLink['link'] = removePrepend;
    } else if (link.indexOf(listLinkAppend) !== -1) {
        modifiedLink['type'] = 'playlist';
        modifiedLink['link'] = link.replace(listLinkAppend, '');
    }
    return modifiedLink;
}
// On player load event
function onPlayerReady() {
    // Show slide-in show/hide icon
    wpHowTo_icon.style.display = 'block';
    // Set the player link
    var wpHowTo_storedTime = JSON.parse(localStorage.getItem(wpHowTo_timeHandle));
    var wpHowTo_startAt;
    if (wpHowTo_storedTime === null) {
        wpHowTo_startAt = 0;
        localStorage.setItem(wpHowTo_timeHandle, JSON.stringify(wpHowTo_startAt));
    } else {
        wpHowTo_startAt = Math.round(parseInt(wpHowTo_storedTime));
    }
    if (wpHowTo_lastWatchedLink === null) {
        // 'WP How to' features preview
        var wpHowTo_defaultLink = 'EnjFu9FbPas';
        wpHowTo_player.cueVideoById({
            videoId: wpHowTo_defaultLink,
            startSeconds: wpHowTo_startAt,
        });
    } else {
        var wpHowTo_lastWatchedObject = wpHowTo_lastWatchedLink;
        if (wpHowTo_lastWatchedObject.videoLink.type === 'video') {
            wpHowTo_player.cueVideoById({
                videoId: wpHowTo_lastWatchedObject.videoLink.link,
                startSeconds: wpHowTo_startAt
            });
        } else { // Playlist
            wpHowTo_player.loadPlaylist({
                listType: 'playlist',
                index: 0,
                list: wpHowTo_lastWatchedObject.videoLink.link,
                startSeconds: wpHowTo_startAt
            });
        }
        wpHowTo_embeddedWebsite.src = wpHowTo_lastWatchedObject.pageLink;
        // Send data back to iframe
        var dataSentBack = {};
        dataSentBack['wpHowTo_selectedVideoDiv'] = wpHowTo_lastWatchedObject.divId;
        wpHowTo_embeddedWebsite.addEventListener("load", function() {
            this.contentWindow.postMessage(dataSentBack, '*');
        });
    }
}
// On player change event
function onPlayerStateChange(event) {
    // Added in order for this event not to trigger more than once per interval
    if (event.data == 1) {
        // Get time every 5 secs
        setInterval(function() {
            wpHowTo_timePassed = wpHowTo_player.getCurrentTime();
            // Store it to localStorage
            localStorage.setItem(wpHowTo_timeHandle, JSON.stringify(wpHowTo_timePassed));
        }, 5000);
    }
}

jQuery(document).ready(function($) {
    var ajaxUrl = plugin_data.ajax_url;
    // Select elements
    var icon = $('.wp-how-to.slide-in .icon');
    var slideIn = $('.wp-how-to.slide-in');
    var videos = $('.wp-how-to.slide-in .videos');
    var videoPlayer = $('#wp-how-to-player');
    var library = $('.wp-how-to.slide-in .library');
    var libraryPage = $('.wp-how-to.slide-in .library-page');
    var libraryClose = $('.wp-how-to.slide-in .library-page .close');
    var pluginPagesParent = $('.wp-how-to.slide-in .plugin-pages .items');
    var libPluginsTitle = $('.wp-how-to.slide-in .plugin-pages h3');
    var searchTitle = $('.wp-how-to.slide-in .search h3');
    var searchSelect = document.querySelector('.wp-how-to.slide-in .search select');
    var searchInput = document.querySelector('.wp-how-to.slide-in .search input');
    var searchButton = $('.wp-how-to.slide-in .search button');
    var resultInfo = $('.wp-how-to.slide-in .search .result p');
    var resultList = $('.wp-how-to.slide-in .search .result ul');
    var libCategoriesTitle = $('.wp-how-to.slide-in .category-links h3');
    var topicCategoryLink = $('.wp-how-to.slide-in .category-links .topic-category');
    var topicsLink = wpHowTo_websiteBase + '/tutorials/wordpress-topic/';
    topicCategoryLink.attr('href', topicsLink);
    var pluginCategoryLink = $('.wp-how-to.slide-in .category-links .plugin-category');
    var pluginsLink = wpHowTo_websiteBase + '/tutorials/wordpress-plugin/';
    pluginCategoryLink.attr('href', pluginsLink);
    var premiumOverlay = $('.wp-how-to.slide-in .premium-content');
    // Remove overlay if premium license activated
    if (wpHowTo_fsNotFree === 'true') {
        premiumOverlay.css('display', 'none');
    }
    var buyPremiumLinks = $('.wp-how-to.slide-in .premium-content a');
    var libFavTitle = $('.wp-how-to.slide-in .favourites h3');
    var favSection = $('.wp-how-to.slide-in .favourites .items');
    var favStoreButton = $('.wp-how-to.slide-in .favourites .store button');
    var favStoreInstruction = $('.wp-how-to.slide-in .favourites .store p');
    var favGetButton = $('.wp-how-to.slide-in .favourites .get button');
    var favGetInstruction = $('.wp-how-to.slide-in .favourites .get p');
    var favInfo = $('.wp-how-to.slide-in .favourites .info');
    var libHistoryTitle = $('.wp-how-to.slide-in .history h3');
    var historySection = $('.wp-how-to.slide-in .history .items');
    var settings = $('.wp-how-to.slide-in .settings');
    var settingsPage = $('.wp-how-to.slide-in .settings-page');
    var settingsClose = $('.wp-how-to.slide-in .settings-page .close');
    var repositionButton = document.querySelector('.wp-how-to.slide-in .settings-page .reposition button');
    var repositionInstruction = $('.wp-how-to.slide-in .settings-page .reposition p');
    var resizeButton = $('.wp-how-to.slide-in .settings-page .resize button');
    var resizeInstruction = $('.wp-how-to.slide-in .settings-page .resize p');
    var vanillaSlideIn = document.querySelector('.wp-how-to.slide-in');
    var resizablePlayer = document.querySelector('.wp-how-to.slide-in .videos .player');
    var resizableVideoSelect = document.querySelector('.wp-how-to.slide-in .videos .video-selection');
    var closeResizer = document.querySelector('.wp-how-to.slide-in .close-resizer');
    var opacityInput = document.querySelector('#wp-how-to-opacity');
    var opacityOutput = document.querySelector('#wp-how-to-opacity-output');
    var opacityInstruction = $('.wp-how-to.slide-in .settings-page .opacity p');
    // Handle translated strings sent from php
    var translatedStrings = plugin_data.translated_strings;
    icon.attr('title', translatedStrings.plugin_icon_title);
    library.attr('title', translatedStrings.library_icon_title);
    settings.attr('title', translatedStrings.settings_icon_title);
    libraryClose.attr('title', translatedStrings.close_x);
    settingsClose.attr('title', translatedStrings.close_x);
    libPluginsTitle.text(translatedStrings.library_plugins_title);
    searchTitle.text(translatedStrings.search_title);
    searchButton.text(translatedStrings.search_button);
    searchButton.attr('title', translatedStrings.search_button);
    libCategoriesTitle.text(translatedStrings.library_categories_title);
    buyPremiumLinks.text(translatedStrings.premium_content_link);
    buyPremiumLinks.attr('title', translatedStrings.premium_content_link);
    libFavTitle.text(translatedStrings.library_favourites_title);
    libHistoryTitle.text(translatedStrings.library_history_title);
    favStoreButton.text(translatedStrings.store_db_button);
    favStoreButton.attr('title', translatedStrings.store_db_button);
    favGetButton.text(translatedStrings.get_db_button);
    favGetButton.attr('title', translatedStrings.get_db_button);
    favStoreInstruction.text(translatedStrings.store_instruction);
    favGetInstruction.text(translatedStrings.get_instruction);
    repositionButton.textContent = translatedStrings.reposition_button;
    repositionButton.title = translatedStrings.reposition_button;
    resizeButton.text(translatedStrings.resize_button);
    resizeButton.attr('title', translatedStrings.resize_button);
    repositionInstruction.text(translatedStrings.reposition_instruction);
    resizeInstruction.text(translatedStrings.resize_instruction);
    opacityInstruction.text(translatedStrings.opacity_instruction);
    // Handle localStorage
    var installedPluginsHandle = 'wp-how-to-installed-plugins';
    var lsInstalledPlugins = JSON.parse(localStorage.getItem(installedPluginsHandle));
    var topicJsonHandle = 'wp-how-to-wordpress-topic';
    var lsTopicJson = localStorage.getItem(topicJsonHandle);
    var pluginJsonHandle = 'wp-how-to-wordpress-plugin';
    var lsPluginJson = JSON.parse(localStorage.getItem(pluginJsonHandle));
    var favouritesHandle = 'wp-how-to-favourite-videos';
    var lsFavVideos = JSON.parse(localStorage.getItem(favouritesHandle));
    var databaseInfoHandle = 'wp-how-to-database-info';
    var lsDatabaseInfo = JSON.parse(localStorage.getItem(databaseInfoHandle));
    var historyHandle = 'wp-how-to-history-videos';
    var lsVideosHistory = JSON.parse(localStorage.getItem(historyHandle));
    var repositionHandle = 'wp-how-to-reposition';
    var lsReposition = JSON.parse(localStorage.getItem(repositionHandle));
    var resizeWidthHandle = 'wp-how-to-resize-width';
    var lsResizeWidth = JSON.parse(localStorage.getItem(resizeWidthHandle));
    var resizeHeightHandle = 'wp-how-to-resize-height';
    var lsResizeHeight = JSON.parse(localStorage.getItem(resizeHeightHandle));
    var opacityHandle = 'wp-how-to-opacity';
    var lsOpacity = JSON.parse(localStorage.getItem(opacityHandle));
    // Handle license change
    if (wpHowTo_premiumLicense !== wpHowTo_fsNotFree) {
        // Remove localStorage items related to premium license
        if (wpHowTo_fsNotFree === 'false') {
            localStorage.removeItem(repositionHandle);
            localStorage.removeItem(resizeWidthHandle);
            localStorage.removeItem(resizeHeightHandle);
            localStorage.removeItem(opacityHandle);
            localStorage.removeItem(favouritesHandle);
        }
        // Reset the license storage
        localStorage.setItem(wpHowTo_licenseHandle, JSON.stringify(wpHowTo_fsNotFree));
    }
    var initialPosition, verticalCoordinate, horizontalCoordinate;
    // Open/close slide-in window
    icon.on('click touchstart touchmove', function() {
        openClose();
        initialPlayerResize(wpHowTo_pageWidth, wpHowTo_pageHeight);
        adjustPosition(wpHowTo_pageWidth);
    });
    /** Re-adjust position of slide-in section
     * @param {number} - pageWidth - current resolution/browser window width
     */
    function adjustPosition(pageWidth) {
        vanillaSlideIn.style.right = 0;
        var slideInWidth = parseFloat(getComputedStyle(vanillaSlideIn, null).getPropertyValue('width')
            .replace('px', ''));
        if (slideIn.hasClass('clicked')) {
            vanillaSlideIn.style.left = (pageWidth - slideInWidth - 15) + 'px';
        } else {
            vanillaSlideIn.style.left = (pageWidth - 40) + 'px';
        }
    }
    // On browser window resolution change
    window.addEventListener('resize', function() {
        var resizedWidth = window.innerWidth;
        var resizedHeight = window.innerHeight;
        wpHowTo_pageWidth = resizedWidth;
        wpHowTo_pageHeight = resizedHeight;
        initialPlayerResize(wpHowTo_pageWidth, wpHowTo_pageHeight);
        adjustPosition(wpHowTo_pageWidth);
    });
    // Open other tabs
    function openTab(tabIcon, tabPage) {
        tabIcon.on('click touchstart touchmove', function() {
            if (tabPage.hasClass('clicked')) {
                $(this).removeClass('clicked');
                tabPage.removeClass('clicked');
            } else {
                $(this).addClass('clicked');
                tabPage.addClass('clicked');
            }
        });
    }
    openTab(library, libraryPage);
    openTab(settings, settingsPage);
    // Close tab page on 'X' click
    function closeTab(closeButton, tabPage, tabIcon) {
        closeButton.on('click touchstart touchmove', function() {
            tabPage.removeClass('clicked');
            tabIcon.removeClass('clicked');
            // Issue with iframe (blank on library tab closing)
            setTimeout(function() {
                var lastWatchedVideo = JSON.parse(localStorage.getItem(
                    wpHowTo_lastWatchedHandle));
                if (lastWatchedVideo === null) {
                    wpHowTo_embeddedWebsite.src = wpHowTo_websiteBase;
                } else {
                    var wpHowTo_lastWatchedObject = lastWatchedVideo;
                    wpHowTo_embeddedWebsite.src = wpHowTo_lastWatchedObject.pageLink;
                    // Send data back to iframe
                    var dataSentBack = {};
                    dataSentBack['wpHowTo_selectedVideoDiv'] = wpHowTo_lastWatchedObject.divId;
                    wpHowTo_embeddedWebsite.addEventListener("load", function() {
                        this.contentWindow.postMessage(dataSentBack, '*');
                    });
                }
            }, 500);
        });
    }
    closeTab(libraryClose, libraryPage, library);
    closeTab(settingsClose, settingsPage, settings);
    /* Installed plugins video section */
    var installedPlugins = plugin_data.plugin_slugs;
    var pluginsUrlBase = wpHowTo_websiteBase + '/wordpress-plugin/';
    var pluginUrls = [];
    // Check if url exists (no 404 error)
    function urlExists(url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        if (http.status != 404) {
            return true;
        } else {
            return false;
        }
    }
    // Check if more than 30 days have passed
    function isMoreThan30DaysAgo(currentTime) {
        //                   days  hours min  sec  ms
        var thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        var ThirtyDaysAgo = new Date().getTime() - thirtyDaysInMs;

        if (ThirtyDaysAgo > currentTime) {
            return true;
        } else {
            return false;
        }
    }
    /** Get url from plugin slug and combine data
     * @param {array} - pluginSlugs - array of installed plugin slugs
     * @param {string} - urlBase - url base (without appended plugin slugs)
     * @param {boolean} - needToCheck - true/false if installed plugins list has changed or not
     * @param {integer} - timePassed - check if more than 30 days have passed from the last storage to localStorage
     */
    var currentTime = new Date().getTime();

    function getPluginUrl(pluginSlugs, urlBase, needToCheck, timePassed) {
        pluginSlugs.forEach(function(plugin) {
            var pluginData = {};
            if (typeof plugin === 'string') {
                pluginData['slug'] = plugin;
                var completeUrl = urlBase + plugin;
                pluginData['url'] = completeUrl;
                var checkAgain = isMoreThan30DaysAgo(timePassed);
                if (needToCheck === true || checkAgain === true) {
                    if (urlExists(completeUrl) === false) {
                        pluginData['exists'] = 'error-404';
                    } else {
                        pluginData['exists'] = 'exists';
                    }
                    var timestamp = new Date().getTime();
                    pluginData['checkTime'] = timestamp;
                }
            } else {
                // Is an object (stored in localStorage)
                pluginData['slug'] = plugin.slug;
                pluginData['url'] = plugin.url;
                pluginData['exists'] = plugin.exists;
            }
            pluginUrls.push(pluginData);
        });
        return pluginUrls;
    }
    // Capitalize link display title
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // Append links to DOM
    function appendLinks(items, parentEl) {
        var allAppends = "";
        items.forEach(function(item) {
            if (item.slug) {
                var slug = item.slug;
                var text = slug.split('-').join(' ');
                var title = capitalizeFirstLetter(text);
                var exists = item.exists;
                var info = '';
                if (exists === 'error-404') {
                    info += ' <span> - No tutorials found for this plugin!</span>'
                }
                var anchorEl = '<li><a class="' + item.exists + '" href="' + item.url + '">' + title +
                    '</a>' + info + '</li>';
                allAppends += anchorEl;
            } else if (item.videoLink) {
                var divId = item.divId;
                var link = item.pageLink + '#' + item.divId;
                var title = item.videoTitle;
                var type = item.videoLink.type;
                var anchorEl = '<li class="' + divId + '"><a class="' + type + '" href="' + link +
                    '">' +
                    title +
                    '</a></li>';
                allAppends += anchorEl;
            } else if (item.favLink) {
                var divId = item.favDivId;
                var link = item.favPageLink + '#' + item.favDivId;
                var title = item.favTitle;
                var type = item.favLink.type;
                var anchorEl = '<li class="' + divId + '"><a class="' + type + '" href="' + link +
                    '">' +
                    title +
                    '</a></li>';
                allAppends += anchorEl;
            }
        });
        parentEl.append(allAppends);
    }
    var storedSlugs = [];
    // Check difference between stored and installed plugin slugs
    function checkSlugDifference(lsData, extractedSlugs) {
        if (lsData) {
            lsData.forEach(function(plugin) {
                var slug = plugin.slug;
                extractedSlugs.push(slug);
            });
            return extractedSlugs;
        }
    }

    var check = checkSlugDifference(lsInstalledPlugins, storedSlugs);
    if (lsInstalledPlugins === null) {
        // Initial storage
        var links = getPluginUrl(installedPlugins, pluginsUrlBase, true, currentTime);
        appendLinks(links, pluginPagesParent);
        localStorage.setItem(installedPluginsHandle, JSON.stringify(links));
    } else if (JSON.stringify(check) !== JSON.stringify(installedPlugins)) {
        // Plugins list changed (items added or removed)
        localStorage.removeItem(installedPluginsHandle);
        var links = getPluginUrl(installedPlugins, pluginsUrlBase, true, currentTime);
        appendLinks(links, pluginPagesParent);
        localStorage.setItem(installedPluginsHandle, JSON.stringify(links));
    } else {
        // No changes detected
        var links = getPluginUrl(lsInstalledPlugins, pluginsUrlBase, false, currentTime);
        appendLinks(links, pluginPagesParent);
    }

    // Get search input value
    var typedTerm = searchInput.value;
    searchInput.addEventListener('change', function() {
        typedTerm = this.value;
    });
    // Get category selected
    var selectedCategory = searchSelect.value;
    searchSelect.addEventListener('change', function() {
        selectedCategory = this.value;
    });
    // Helper function for data conversion
    function convertTextToArray(storedText) {
        var arrayFromText = [];
        var searchItemsArray = storedText.split('},');
        var lastItem = searchItemsArray.length - 1;
        searchItemsArray.forEach(function(item, index) {
            if (index === lastItem) { // Last item
                // Change the quotes to default ones!
                item = item.replace(/“|”|″/g, '"');
                // Remove line breaks
                item = item.replace(/(\r\n|\n|\r)/gm, "");
                // Remove extra spaces
                item = item.replace(/  /g, " ");
                arrayFromText.push(item);
            } else { // All other items
                // Change the quotes to default ones!
                item = item.replace(/“|”|″/g, '"');
                // Remove line breaks
                item = item.replace(/(\r\n|\n|\r)/gm, "");
                // Remove extra spaces
                item = item.replace(/  /g, " ");
                item = item + '}';
                arrayFromText.push(item);
            }
        });
        return arrayFromText;
    }
    // Helper function for data search and display
    function displaySearchResults(localStorageHandle, categoryLink) {
        // Compare stored data with search input
        var searchItems = JSON.parse(localStorage.getItem(localStorageHandle));
        var matchingItems = [];
        searchItems.forEach(function(item) {
            // If there's a match
            var title = item.title;
            var lowerCaseTitle = title.toLowerCase();
            var lowerCaseTerm = typedTerm.toLowerCase();
            if (lowerCaseTitle.indexOf(lowerCaseTerm) !== -1) {
                matchingItems.push(item);
            }
        });
        // Display found results
        var resultCount = matchingItems.length;
        var resultTitle = translatedStrings.results_done + ' "' + typedTerm + '" (' + translatedStrings.results_count + ': ' + resultCount + ')';
        resultInfo.text(resultTitle);
        resultList.empty();
        matchingItems.forEach(function(item) {
            var slug = item.slug;
            var urlBase = 'https://wphowto.tv/';
            var fullSrc = urlBase + categoryLink + slug;
            var title = item.title;
            var itemLink = '<li><a class="matched-item" href=' + fullSrc + '>' + title + '</a></li>';
            resultList.append(itemLink);
        });
        // Change embedded webpage source on click
        var links = $('.wp-how-to.slide-in .matched-item');
        links.on('click', function(e) {
            e.preventDefault();
            var clickedLink = e.target;
            var link = clickedLink.href;
            wpHowTo_embeddedWebsite.src = link;
            // Close the library tab
            libraryPage.removeClass('clicked');
            library.removeClass('clicked');
        });
    }
    // Search functionality - get and display data on search button click
    searchButton.on('click', function() {
        var filePath;
        var lsData;
        var lsHandle;
        var itemCategoryLink;
        // Set full file (post) path
        if (selectedCategory === 'wordpress-topic') {
            lsHandle = topicJsonHandle;
            lsData = lsTopicJson;
            filePath = 'https://plugin.wphowto.tv/wordpress-topic-json';
            itemCategoryLink = 'wordpress-topic/';
        } else if (selectedCategory === 'wordpress-plugin') {
            lsHandle = pluginJsonHandle;
            lsData = lsPluginJson;
            filePath = 'https://plugin.wphowto.tv/wordpress-plugin-json';
            itemCategoryLink = 'wordpress-plugin/';
        } else {
            return;
        }
        // Loading text
        resultInfo.text(translatedStrings.results_loading);
        // Get json data
        var checkAgain = isMoreThan30DaysAgo(currentTime);
        if (lsData === null || checkAgain === true) {
            fetch(filePath)
                .then(function(result) {
                    if (result.status != 200) {
                        throw new Error("Bad Server Response");
                    }
                    // Ajax call succesful
                    return result.text();
                })
                .then(function(html) {
                    // Convert the HTML string into a document object
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');
                    // Get the image file
                    var jsonData = doc.querySelector('#json-data').textContent;
                    var modifiedArray = convertTextToArray(jsonData);
                    localStorage.setItem(lsHandle, modifiedArray);
                }).then(function() {
                    displaySearchResults(lsHandle, itemCategoryLink);
                })
                .catch(function(error) {
                    console.log(error);
                });
        } else { // Data already stored in localStorage
            displaySearchResults(lsHandle, itemCategoryLink);
        }
    });

    // Initial favourite/history videos append
    if (lsFavVideos === null) {
        favSection.html('<span>No items stored!</span>');
    } else {
        appendLinks(lsFavVideos, favSection);
    }
    if (lsVideosHistory === null) {
        historySection.html('<span>No items watched!</span>');
    } else {
        appendLinks(lsVideosHistory, historySection);
    }
    // Library page links opening in slide-in
    var clickedLink;

    function openLibraryLinks(links) {
        links.on('click', function(e) {
            e.preventDefault();
            clickedLink = e.target;
            // Update link check of error 404 pages if clicked and doesn't return 404 error (website updated in the meantime)
            if (clickedLink.classList.contains('error-404')) {
                var clickedUrl = clickedLink.href;
                if (urlExists(clickedUrl) === true) {
                    if (lsInstalledPlugins) {
                        lsInstalledPlugins.forEach(function(plugin) {
                            var storedUrl = plugin.url;
                            if (clickedUrl === storedUrl) {
                                var itemIndex = lsInstalledPlugins.indexOf(plugin);
                                plugin['exists'] = 'exists';
                                lsInstalledPlugins.splice(itemIndex, 1, plugin);
                                localStorage.setItem(installedPluginsHandle, JSON.stringify(
                                    lsInstalledPlugins));
                            }
                        });
                    }
                }
            }
            // Handle data transfer with iframe
            var videoType = clickedLink.classList[0];
            var parentNode = clickedLink.parentNode;
            var parentClasses = parentNode.classList;
            wpHowTo_embeddedWebsite.src = clickedLink.href;
            wpHowTo_embeddedWebsite.addEventListener("load", function() {
                if (parentClasses.length > 0) {
                    // Highlight video link within the iframe
                    var dataSentBack = {};
                    var divId = parentClasses[0];
                    dataSentBack['wpHowTo_selectedLibraryItem'] = divId;
                    this.contentWindow.postMessage(dataSentBack, '*');
                    // Play the video
                    if (videoType === 'video') {
                        wpHowTo_player.cueVideoById({
                            videoId: divId
                        });
                    } else if (videoType === 'playlist') {
                        wpHowTo_player.loadPlaylist({
                            listType: 'playlist',
                            index: 0,
                            list: divId
                        });
                    }
                }
            });
            // Close the library tab
            libraryPage.removeClass('clicked');
            library.removeClass('clicked');
        });
    }
    var libraryLinks = $('.wp-how-to.slide-in .library-page a');
    openLibraryLinks(libraryLinks);

    // Handle the premium license buy link - remove previous events
    buyPremiumLinks.off();

    // Get database info
    var dbData = plugin_data.fav_videos;
    var storedTime = dbData.stored_on;
    var favVideosText = dbData.fav_vid_data;
    if (typeof favVideosText !== 'undefined') { // If db not undefined
        var dbFavVideosArray = favVideosText.replace(/&quot;/g, '"');
        var favVideos = JSON.parse(dbFavVideosArray);
        var dbItemsLength = favVideos.length;
        var dbInfo = {};
        dbInfo['storedTime'] = storedTime;
        dbInfo['itemsLength'] = dbItemsLength;
        localStorage.setItem(databaseInfoHandle, JSON.stringify(dbInfo));
    }
    // Show database info for favourite videos stored
    if (lsDatabaseInfo === null) {
        var noDataInfo = translatedStrings.no_data_stored;
        var noData = '<p><b>' + noDataInfo + '</b></p>';
        favInfo.html(noData);
    } else {
        var timeOfStorage = translatedStrings.time_of_storage;
        var storageLength = translatedStrings.storage_length;
        var time = lsDatabaseInfo.storedTime;
        var numOfItems = lsDatabaseInfo.itemsLength;
        var appendData = '<p><b>' + timeOfStorage + ' - ' + time +
            '. ' + storageLength + ' - ' +
            numOfItems + '.</b></p>';
        favInfo.html(appendData);
    }

    /** Sending the data to be stored through PHP
     * @param {string} - nonce - security string
     * @param {string} - favVidsData - send stringified fav videos related data from localStorage back to db (useful for transfering on other devices)
     * @param {string} - timestamp - self explanatory
     */
    function transferJsonDataToPhp(nonce, favVidsData, timestamp) {
        $.ajax({
            type: "POST",
            url: ajaxUrl,
            async: false,
            data: { // Data object
                'action': 'insert_into_database',
                'wp_how_to_favs_nonce': nonce,
                'wp_how_to_favs_data': favVidsData,
                'wp_how_to_timestamp': timestamp,
            },
            success: function() {
                console.log('Ajax POST successful!');
            },
            error: function(errormessage) {
                console.log('Ajax POST failed!');
            }
        });
    }

    /** Prepend item to array, and limit it to a number of items (used with favourite and watched history videos)
     * @param {object} - addedItem - object item added to limited array of video items
     * @param {array} - array - limited array of video items
     * @param {integer} - numOfItems - number set as the limit of items the array above can store
     */
    function prependAndLimit(addedItem, array, numOfItems) {
        var valueArr = array.map(function(item) {
            if (item.favDivId) {
                return item.favDivId
            } else {
                return item.divId;
            }
        });
        var isDuplicate = valueArr.some(function(item, idx) {
            return valueArr.indexOf(item) != idx
        });
        if (isDuplicate === false) {
            var newArray = array.slice();
            newArray.unshift(addedItem);
            var limitedArray = newArray.slice(0, numOfItems);
            return limitedArray;
        } else {
            array.shift();
            array.unshift(addedItem);
            return array;
        }
    }

    // Store fav videos to db
    var wpHowToNonce = plugin_data.wp_how_to_favs_nonce;
    var timestamp = new Date();
    // Format timestamp
    function formatedTimestamp(passedNewDate) {
        var date = passedNewDate.toISOString().split('T')[0];
        var time = passedNewDate.toTimeString().split(' ')[0];
        var dateNtime = date + ' ' + time;
        return dateNtime;
    }
    var formatedTime = formatedTimestamp(timestamp);
    favStoreButton.on('click', function() {
        if (wpHowTo_fsNotFree === 'true') {
            var favVideosArray = JSON.parse(localStorage.getItem(favouritesHandle));
            var data = '';
            if (favVideosArray === null) {
                return;
            } else {
                data = favVideosArray;
            }
            transferJsonDataToPhp(wpHowToNonce, data, formatedTime);
        }
    });
    // Get stored fav videos from db
    favGetButton.on('click', function() {
        if (wpHowTo_fsNotFree === 'true') {
            var lsFavVideos = JSON.parse(localStorage.getItem(favouritesHandle));
            var dbData = plugin_data.fav_videos;
            var favVideosText = dbData.fav_vid_data;
            var dbFavVideosArray = favVideosText.replace(/&quot;/g, '"');
            var dbFavVideos = JSON.parse(dbFavVideosArray);
            if (lsFavVideos === null) {
                // Store the first item to localStorage
                var startingArray = [];
                dbFavVideos.forEach(function(video) {
                    startingArray.push(video);
                });
                favSection.html('');
                appendLinks(startingArray, favSection);
                var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                openLibraryLinks(libraryWithAddedLinks);
                localStorage.setItem(favouritesHandle, JSON.stringify(startingArray));
            } else {
                // Append to existing data
                var limitedArray;
                dbFavVideos.forEach(function(video) {
                    var lsArray = JSON.parse(localStorage.getItem(favouritesHandle));
                    limitedArray = prependAndLimit(video, lsArray, 100);
                    localStorage.setItem(favouritesHandle, JSON.stringify(limitedArray));
                });
                favSection.html('');
                appendLinks(limitedArray, favSection);
                var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                openLibraryLinks(libraryWithAddedLinks);
                localStorage.setItem(favouritesHandle, JSON.stringify(limitedArray));
            }
        }
    });

    /* Vertical reposition section */
    var slide = document.querySelector('.wp-how-to.slide-in');
    if (lsReposition === null) {
        // Initial position
        var defaultPos = '10%';
        slide.style.top = defaultPos;
        localStorage.setItem(repositionHandle, JSON.stringify(defaultPos));
    } else {
        // Set position stored in localStorage
        slide.style.top = lsReposition;
    }
    // Mouse click
    repositionButton.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (wpHowTo_fsNotFree === 'true') {
            initialPosition = slide.offsetTop;
            verticalCoordinate = e.pageY;
            this.addEventListener('mousemove', dragIt, false);
            window.addEventListener('mouseup', function() {
                repositionButton.removeEventListener('mousemove', dragIt, false);
            }, false);
        }
    }, false);
    // Touch screen
    repositionButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (wpHowTo_fsNotFree === 'true') {
            initialPosition = slide.offsetTop;
            var touch = e.touches;
            verticalCoordinate = touch[0].pageY;
            this.addEventListener('touchmove', swipeIt, {
                passive: true
            });
            window.addEventListener('touchend', function(e) {
                e.preventDefault();
                repositionButton.removeEventListener('touchmove', swipeIt, {
                    passive: true
                });
            }, false);
        }
    }, {
        passive: true
    });
    // Drag function
    function dragIt(e) {
        var positionNum = initialPosition + e.pageY - verticalCoordinate;
        var heightPercentage = positionNum * 100 / wpHowTo_pageHeight;
        var percent = heightPercentage.toFixed(2) + '%';
        if (heightPercentage < 10) {
            var notLessThan = '10%';
            localStorage.setItem(repositionHandle, JSON.stringify(notLessThan));
        } else if (heightPercentage > 90) {
            var notBiggerThan = '90%';
            localStorage.setItem(repositionHandle, JSON.stringify(notBiggerThan));
        } else {
            localStorage.setItem(repositionHandle, JSON.stringify(percent));
        }
        slide.style.top = percent;
    }
    // Swipe (touch) function
    function swipeIt(e) {
        var contact = e.touches;
        var positionNum = initialPosition + e.pageY - verticalCoordinate;
        var heightPercentage = positionNum * 100 / wpHowTo_pageHeight;
        var percent = heightPercentage.toFixed(2) + '%';
        if (heightPercentage < 10) {
            var notLessThan = '10%';
            localStorage.setItem(repositionHandle, JSON.stringify(notLessThan));
        } else if (heightPercentage > 90) {
            var notBiggerThan = '90%';
            localStorage.setItem(repositionHandle, JSON.stringify(notBiggerThan));
        } else {
            localStorage.setItem(repositionHandle, JSON.stringify(percent));
        }
        slide.style.top = percent;
    }

    /* Resize player section */
    /** Set the initial slide-in section and player dimensions
     * @param {number} - currentPageWidth - current resolution/browser window width
     * @param {number} - currentPageHeight - current resolution/browser window height
     */
    function initialPlayerResize(currentPageWidth, currentPageHeight) {
        if (lsResizeWidth === null || lsResizeHeight === null) {
            // Initial size (equal to those set in css file)
            let defaultWidth = 300;
            let defaultHeight = 300;
            vanillaSlideIn.style.width = defaultWidth + 'px';
            vanillaSlideIn.style.height = defaultHeight + 'px';
            let playerHeight = defaultHeight * 66 / 100;
            resizablePlayer.style.height = playerHeight + 'px';
            let videoSelectHeight = defaultHeight * 33 / 100;
            resizableVideoSelect.style.height = videoSelectHeight + 'px';
            let videoSelectWidth = defaultWidth * 95 / 100;
            resizableVideoSelect.style.width = videoSelectWidth + 'px';
            resizablePlayer.style.width = videoSelectWidth + 'px';
            localStorage.setItem(resizeWidthHandle, JSON.stringify(defaultWidth));
            localStorage.setItem(resizeHeightHandle, JSON.stringify(defaultHeight));
        } else {
            // Set size stored in localStorage
            var notWiderThan = currentPageWidth - 40;
            var notHigherThan = currentPageHeight - 40;
            if (lsResizeWidth > currentPageWidth) {
                vanillaSlideIn.style.width = notWiderThan + 'px';
                vanillaSlideIn.style.height = lsResizeHeight + 'px';
                let playerHeight = lsResizeHeight * 66 / 100;
                resizablePlayer.style.height = playerHeight + 'px';
                let videoSelectHeight = lsResizeHeight * 33 / 100;
                resizableVideoSelect.style.height = videoSelectHeight + 'px';
                let videoSelectWidth = notWiderThan * 95 / 100;
                resizableVideoSelect.style.width = videoSelectWidth + 'px';
                resizablePlayer.style.width = videoSelectWidth + 'px';
            } else if (lsResizeHeight > currentPageHeight) {
                vanillaSlideIn.style.width = lsResizeWidth + 'px';
                vanillaSlideIn.style.height = notHigherThan + 'px';
                let playerHeight = notHigherThan * 66 / 100;
                resizablePlayer.style.height = playerHeight + 'px';
                let videoSelectHeight = notHigherThan * 33 / 100;
                resizableVideoSelect.style.height = videoSelectHeight + 'px';
                let videoSelectWidth = lsResizeWidth * 95 / 100;
                resizableVideoSelect.style.width = videoSelectWidth + 'px';
                resizablePlayer.style.width = videoSelectWidth + 'px';
            } else if (lsResizeWidth > currentPageWidth && lsResizeHeight > currentPageHeight) {
                vanillaSlideIn.style.width = notWiderThan + 'px';
                vanillaSlideIn.style.height = notHigherThan + 'px';
                let playerHeight = notHigherThan * 66 / 100;
                resizablePlayer.style.height = playerHeight + 'px';
                let videoSelectHeight = notHigherThan * 33 / 100;
                resizableVideoSelect.style.height = videoSelectHeight + 'px';
                let videoSelectWidth = notWiderThan * 95 / 100;
                resizableVideoSelect.style.width = videoSelectWidth + 'px';
                resizablePlayer.style.width = videoSelectWidth + 'px';
            } else {
                vanillaSlideIn.style.width = lsResizeWidth + 'px';
                vanillaSlideIn.style.height = lsResizeHeight + 'px';
                let playerHeight = lsResizeHeight * 66 / 100;
                resizablePlayer.style.height = playerHeight + 'px';
                let videoSelectHeight = lsResizeHeight * 33 / 100;
                resizableVideoSelect.style.height = videoSelectHeight + 'px';
                let videoSelectWidth = lsResizeWidth * 95 / 100;
                resizableVideoSelect.style.width = videoSelectWidth + 'px';
                resizablePlayer.style.width = videoSelectWidth + 'px';
            }
        }
    }
    // Initiate resize functionality
    resizeButton.on('click', function() {
        libraryPage.removeClass('clicked');
        library.removeClass('clicked');
        settingsPage.removeClass('clicked');
        settings.removeClass('clicked');
        $('.wp-how-to.slide-in .resizers').css('display', 'block');
        slideIn.css('background-color', 'rgba(0, 0, 0, 0.5)');
    });
    /** Set the initial slide-in section and player dimensions
     * @param {string} - selector - querySelector for item that needs to be resized (it must be absolute or fixed)
     */

    function makeResizablePlayerOnClick(selector) {
        var selectedEl = document.querySelector(selector);
        var resizers = document.querySelectorAll('.resizer');
        var minimum_size = 300;
        var original_width = 0;
        var original_height = 0;
        var original_x = 0;
        var original_y = 0;
        var original_mouse_x = 0;
        var original_mouse_y = 0;
        for (let i = 0; i < resizers.length; i++) {
            let currentResizer = resizers[i];
            currentResizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                original_width = parseFloat(getComputedStyle(selectedEl, null).getPropertyValue('width')
                    .replace('px', ''));
                original_height = parseFloat(getComputedStyle(selectedEl, null).getPropertyValue(
                        'height')
                    .replace('px', ''));
                original_x = selectedEl.getBoundingClientRect().left;
                original_y = selectedEl.getBoundingClientRect().top;
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);
            });

            function resize(e) {
                if (currentResizer.classList.contains('left')) {
                    var width = original_width - (e.pageX - original_mouse_x);
                    if (width > minimum_size) {
                        selectedEl.style.width = width + 'px';
                        selectedEl.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
                        let videoSelectWidth = width * 95 / 100;
                        resizableVideoSelect.style.width = videoSelectWidth + 'px';
                        resizablePlayer.style.width = videoSelectWidth + 'px';
                        localStorage.setItem(resizeWidthHandle, JSON.stringify(width));
                    }
                } else if (currentResizer.classList.contains('top')) {
                    var height = original_height - (e.pageY - original_mouse_y);
                    if (height > minimum_size) {
                        selectedEl.style.height = height + 'px';
                        selectedEl.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
                        let videoSelectHeight = height * 33 / 100;
                        resizableVideoSelect.style.height = videoSelectHeight + 'px';
                        let playerHeight = height * 66 / 100;
                        resizablePlayer.style.height = playerHeight + 'px';
                        localStorage.setItem(resizeHeightHandle, JSON.stringify(height));
                    }
                } else if (currentResizer.classList.contains('bottom')) {
                    var height = original_height + (e.pageY - original_mouse_y);
                    if (height > minimum_size) {
                        selectedEl.style.height = height + 'px';
                        let videoSelectHeight = height * 33 / 100;
                        resizableVideoSelect.style.height = videoSelectHeight + 'px';
                        let playerHeight = height * 66 / 100;
                        resizablePlayer.style.height = playerHeight + 'px';
                        localStorage.setItem(resizeHeightHandle, JSON.stringify(height));
                    }

                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize)
            }
        }
    }
    // Touch events
    function makeResizablePlayerOnTouch(selector) {
        var selectedEl = document.querySelector(selector);
        var resizers = document.querySelectorAll('.resizer');
        var minimum_size = 300;
        var original_width = 0;
        var original_height = 0;
        var original_x = 0;
        var original_y = 0;
        var original_mouse_x = 0;
        var original_mouse_y = 0;
        for (let i = 0; i < resizers.length; i++) {
            let currentResizer = resizers[i];
            currentResizer.addEventListener('touchstart', function(e) {
                e.preventDefault();
                original_width = parseFloat(getComputedStyle(selectedEl, null).getPropertyValue('width')
                    .replace('px', ''));
                original_height = parseFloat(getComputedStyle(selectedEl, null).getPropertyValue(
                        'height')
                    .replace('px', ''));
                original_x = selectedEl.getBoundingClientRect().left;
                original_y = selectedEl.getBoundingClientRect().top;
                var touch = e.touches;
                var verticalCoord = touch[0].pageY;
                var horizontalCoord = touch[0].pageX;
                original_mouse_x = horizontalCoord;
                original_mouse_y = verticalCoord;
                window.addEventListener('touchmove', resize);
                window.addEventListener('touchend', stopResize);
            });

            function resize(e) {
                var touch = e.touches;
                var verticalCoord = touch[0].pageY;
                var horizontalCoord = touch[0].pageX;
                if (currentResizer.classList.contains('left')) {
                    var width = original_width - (horizontalCoord - original_mouse_x);
                    if (width > minimum_size) {
                        selectedEl.style.width = width + 'px';
                        selectedEl.style.left = original_x + (horizontalCoord - original_mouse_x) + 'px';
                        let videoSelectWidth = width * 95 / 100;
                        resizableVideoSelect.style.width = videoSelectWidth + 'px';
                        resizablePlayer.style.width = videoSelectWidth + 'px';
                        localStorage.setItem(resizeWidthHandle, JSON.stringify(width));
                    }
                } else if (currentResizer.classList.contains('top')) {
                    var height = original_height - (verticalCoord - original_mouse_y);
                    if (height > minimum_size) {
                        selectedEl.style.height = height + 'px';
                        selectedEl.style.top = original_y + (verticalCoord - original_mouse_y) + 'px';
                        let videoSelectHeight = height * 33 / 100;
                        resizableVideoSelect.style.height = videoSelectHeight + 'px';
                        let playerHeight = height * 66 / 100;
                        resizablePlayer.style.height = playerHeight + 'px';
                        localStorage.setItem(resizeHeightHandle, JSON.stringify(height));
                    }
                } else if (currentResizer.classList.contains('bottom')) {
                    var height = original_height + (verticalCoord - original_mouse_y);
                    if (height > minimum_size) {
                        selectedEl.style.height = height + 'px';
                        let videoSelectHeight = height * 33 / 100;
                        resizableVideoSelect.style.height = videoSelectHeight + 'px';
                        let playerHeight = height * 66 / 100;
                        resizablePlayer.style.height = playerHeight + 'px';
                        localStorage.setItem(resizeHeightHandle, JSON.stringify(height));
                    }

                }
            }

            function stopResize() {
                window.removeEventListener('touchmove', resize)
            }
        }
    }
    if (wpHowTo_fsNotFree === 'true') {
        makeResizablePlayerOnClick('.wp-how-to.slide-in');
        makeResizablePlayerOnTouch('.wp-how-to.slide-in');
    }
    // Close resizing overlay
    closeResizer.addEventListener('click', function() {
        $('.wp-how-to.slide-in .resizers').css('display', 'none');
        slideIn.css('background-color', 'transparent');
        adjustPosition(wpHowTo_pageWidth);
    });

    /* Opacity settings */
    if (lsOpacity === null) {
        // Initial opacity
        var defaultOpacity = 1;
        vanillaSlideIn.style.opacity = defaultOpacity;
        opacityInput.value = defaultOpacity;
        opacityOutput.innerHTML = defaultOpacity;
        localStorage.setItem(opacityHandle, JSON.stringify(defaultOpacity));
    } else {
        vanillaSlideIn.style.opacity = lsOpacity;
        opacityInput.value = lsOpacity;
        opacityOutput.innerHTML = lsOpacity;
    }
    // use 'change' instead to see the difference in response
    opacityInput.addEventListener('input', function() {
        if (wpHowTo_fsNotFree === 'true') {
            var selectedOpacity = opacityInput.value;
            opacityOutput.innerHTML = selectedOpacity;
            vanillaSlideIn.style.opacity = selectedOpacity;
            localStorage.setItem(opacityHandle, JSON.stringify(selectedOpacity));
        }
    }, false);

    var clicked = false;
    // Helper function to add/remove clicked class
    function openClose() {
        if (slideIn.hasClass('clicked')) {
            slideIn.removeClass('clicked');
            libraryPage.removeClass('clicked');
            library.removeClass('clicked');
            settingsPage.removeClass('clicked');
            settings.removeClass('clicked');
        } else {
            slideIn.addClass('clicked');
        }
        // Only on first click!
        if (clicked === false) {
            clicked = true;
            // Send data back to iframe
            if (wpHowTo_lastWatchedLink) {
                var lastWatchedObject = wpHowTo_lastWatchedLink;
                var dataSentBack = {};
                dataSentBack['wpHowTo_selectedVideoDiv'] = lastWatchedObject.divId;
                wpHowTo_embeddedWebsite.contentWindow.postMessage(dataSentBack, '*');
            }
        }
    }

    /* Embedded website related code */
    wpHowTo_embeddedWebsite.src = wpHowTo_websiteBase;
    window.addEventListener(
        "message",
        function(event) {
            if (event.origin == wpHowTo_websiteBase) {
                // On video link selection
                if (event.data.wpHowTo_videoLink) {
                    var lastWatched = wpHowTo_adjustLinks(event.data.wpHowTo_videoLink);
                    var videoTitle = event.data.wpHowTo_videoTitle;
                    var divId = event.data.wpHowTo_divId;
                    var pageLink = event.data.wpHowTo_pageLink;
                    // Play the video
                    if (lastWatched.type === 'video') {
                        wpHowTo_player.cueVideoById({
                            videoId: lastWatched.link
                        });
                    } else { // Playlist
                        wpHowTo_player.loadPlaylist({
                            listType: 'playlist',
                            index: 0,
                            list: lastWatched.link
                        });
                    }
                    // Store it to localStorage
                    var modifiedData = {};
                    modifiedData['videoLink'] = lastWatched;
                    modifiedData['videoTitle'] = videoTitle;
                    modifiedData['divId'] = divId;
                    modifiedData['pageLink'] = pageLink;
                    localStorage.setItem(wpHowTo_lastWatchedHandle, JSON.stringify(modifiedData));
                    var lsHistoryVideos = JSON.parse(localStorage.getItem(historyHandle));
                    if (lsHistoryVideos === null) {
                        // Store the first item to localStorage
                        var startingArray = [];
                        startingArray.push(modifiedData);
                        historySection.html('');
                        appendLinks(startingArray, historySection);
                        var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                        openLibraryLinks(libraryWithAddedLinks);
                        localStorage.setItem(historyHandle, JSON.stringify(startingArray));
                    } else {
                        // Append to existing data
                        var limitedArray = prependAndLimit(modifiedData, lsHistoryVideos, 100);
                        historySection.html('');
                        appendLinks(limitedArray, historySection);
                        var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                        openLibraryLinks(libraryWithAddedLinks);
                        localStorage.setItem(historyHandle, JSON.stringify(limitedArray));
                    }
                }
                // On favourite button click
                if (event.data.wpHowTo_favLink) {
                    var favLink = wpHowTo_adjustLinks(event.data.wpHowTo_favLink);
                    var favDivId = event.data.wpHowTo_favDivId;
                    var favTitle = event.data.wpHowTo_favTitle;
                    var favPageLink = event.data.wpHowTo_favPageLink;
                    var favAdded = event.data.wpHowTo_added;
                    var lsFavVideos = JSON.parse(localStorage.getItem(favouritesHandle));
                    var modifiedData = {};
                    modifiedData['favLink'] = favLink;
                    modifiedData['favTitle'] = favTitle;
                    modifiedData['favDivId'] = favDivId;
                    modifiedData['favPageLink'] = favPageLink;
                    if (lsFavVideos === null) {
                        if (favAdded === 'true') {
                            // Store the first item to localStorage
                            var startingArray = [];
                            startingArray.push(modifiedData);
                            favSection.html('');
                            appendLinks(startingArray, favSection);
                            var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                            openLibraryLinks(libraryWithAddedLinks);
                            localStorage.setItem(favouritesHandle, JSON.stringify(startingArray));
                        }
                    } else {
                        if (favAdded === 'true') {
                            // Append to existing data
                            var limitedArray = prependAndLimit(modifiedData, lsFavVideos, 100);
                            favSection.html('');
                            appendLinks(limitedArray, favSection);
                            var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                            openLibraryLinks(libraryWithAddedLinks);
                            localStorage.setItem(favouritesHandle, JSON.stringify(limitedArray));
                        } else if (favAdded === 'false') {
                            // If favourite is removed
                            lsFavVideos.forEach(function(video) {
                                // Find the video to remove
                                var storedVideoId = video.favDivId;
                                var clickedVideoId = favDivId;
                                if (storedVideoId.indexOf(clickedVideoId) !== -1) {
                                    var indexOfVideo = lsFavVideos.indexOf(video);
                                    lsFavVideos.splice(indexOfVideo, 1);
                                }
                            });
                            favSection.html('');
                            appendLinks(lsFavVideos, favSection);
                            var libraryWithAddedLinks = $('.wp-how-to.slide-in .library-page a');
                            openLibraryLinks(libraryWithAddedLinks);
                            localStorage.setItem(favouritesHandle, JSON.stringify(lsFavVideos));
                        }
                    }
                }
            }
        });

    // Send data back to iframe
    wpHowTo_embeddedWebsite.addEventListener("load", function() {
        var dataSentBack = {};
        // Signal to iframe if the license is premium or not
        dataSentBack['wpHowTo_freemiusLicense'] = wpHowTo_fsNotFree;
        var lsFavVideos = JSON.parse(localStorage.getItem(favouritesHandle));
        // Highlight all links added to favs
        if (lsFavVideos) {
            var justIds = [];
            lsFavVideos.forEach(function(video) {
                justIds.push(video.favDivId);
            });
            dataSentBack['wpHowTo_favVideoIds'] = justIds;
        }
        this.contentWindow.postMessage(dataSentBack, '*');
    });
});