<?php
/** Slide-in section display code (javascript included after echo code to run properly)
 */
echo "<aside class='wp-how-to slide-in'>
    <div class='options'>
        <div class='icon'></div>
        <div class='library'></div>
        <div class='settings'></div>
    </div>
    <div class='display'>
        <div class='videos'>
            <div class='player'>
                <div id='wp-how-to-player' allowfullscreen></div>
            </div>
            <div class='video-selection'>
                <iframe id='wp-how-to-embed'></iframe>
            </div>
        </div>
        <div class='library-page'>
            <a class='close'>X</a>
            <div class='plugin-pages'>
                <h3></h3>
                <ul class='items'></ul>
            </div>
            <div class='search'>
                <h3></h3>
                <div class='search-form'>
                    <select>
                        <option value='wordpress-topic'>'How to' tutorials</option>
                        <option value='wordpress-plugin'>Plugin tutorials</option>
                        <span></span>
                    </select>
                    <input type='text'></input>
                    <button></button>
                    <div class='result'>
                        <p></p>
                        <ul></ul>
                    </div>
                </div>
                <ul class='items'></ul>
            </div>
            <div class='category-links'>
                <h3></h3>
                <ul class='items'>
                    <li>
                        <a class='topic-category'>'How to' tutorials</a>
                    </li>
                    <li>
                        <a class='plugin-category'>Plugin tutorials</a>
                    </li>
                </ul>
            </div>
            <div class='favourites'>
                <div class='premium-content'>
                    <a href='https://plugin.wphowto.tv/buy-premium/' target='_blank'></a>
                </div>
                <h3></h3>
                <ol class='items'></ol>
                <div class='store'>
                    <button></button>
                    <p></p>
                    <p class='info'></p>
                </div>
                <div class='get'>
                    <button></button>
                    <p></p>
                </div>
            </div>
            <div class='history'>
                <div class='premium-content'></div>
                <h3></h3>
                <ol class='items'></ol>
            </div>
        </div>
        <div class='settings-page'>
            <a class='close'>X</a>
            <div class='reposition'>
                <div class='premium-content'>
                    <a href='https://plugin.wphowto.tv/buy-premium/' target='_blank'></a>
                </div>
                <p></p>
                <button></button>
            </div>
            <div class='resize'>
                <div class='premium-content'></div>
                <p></p>
                <button></button>
            </div>
            <div class='opacity'>
                <div class='premium-content'></div>
                <p></p>
                <input type='range' id='wp-how-to-opacity' name='player-opacity' min='0.5' max='1' step='0.1'>
                <span id='wp-how-to-opacity-output'></span>
            </div>
        </div>
    </div>
    <div class='resizers'>
        <div class='resizer top'></div>
        <div class='resizer bottom'></div>
        <div class='resizer left'></div>
        <div class='overlay'>
            <div class='buttons'>
                <button class='close-resizer'>Close resize option</button>
            </div>
        </div>
    </div>
</aside>";