<?php

/**
 * Plugin Name: WP How to - WordPress Tutorial Videos
 * Description: 'WP How to' helps you use WordPress to its full potential, by providing you with the access to abundance of YouTube video tutorials for 300+ most searched topics related to WordPress and 10.000+ most popular WordPress plugins, from your admin dashboard screen. You don't need to feel lost or overwhelmend with all of the different options WordPress provides.
 * Author:      Ivan Maljukanovic
 * Author URI:  https://imoptimal.com
 * Version:     1.0.2
 * Requires at least: 4.9.8
 * Requires PHP: 5.6
 * License: GNU General Public License v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.en.html
 * Text Domain: how-to-wp
 * Domain Path: /lang
 * @package     how-to-wp
 * @fs_not_free_only /lib/functions.php, /premium-files/
 */
namespace How_to_WP;

// Exit if accessed directly.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
// Auto deactivate the free version when activating the paid one

if ( function_exists( 'wphowto_fs' ) ) {
    wphowto_fs()->set_basename( false, __FILE__ );
} else {
    
    if ( !function_exists( 'wphowto_fs' ) ) {
        // Freemius SDK related code
        function wphowto_fs()
        {
            global  $wphowto_fs ;
            
            if ( !isset( $wphowto_fs ) ) {
                // Include Freemius SDK.
                require_once dirname( __FILE__ ) . '/freemius/start.php';
                $wphowto_fs = fs_dynamic_init( array(
                    'id'             => '10447',
                    'slug'           => 'how-to-wp',
                    'type'           => 'plugin',
                    'public_key'     => 'pk_3675023cf9ef7646d8f382a06006a',
                    'is_premium'     => false,
                    'premium_suffix' => 'Premium',
                    'has_addons'     => false,
                    'has_paid_plans' => true,
                    'trial'          => array(
                    'days'               => 3,
                    'is_require_payment' => true,
                ),
                    'menu'           => array(
                    'first-path' => 'plugins.php',
                    'contact'    => false,
                    'support'    => false,
                ),
                    'is_live'        => true,
                ) );
            }
            
            return $wphowto_fs;
        }
        
        // Init Freemius.
        wphowto_fs();
        // Signal that SDK was initiated.
        do_action( 'wphowto_fs_loaded' );
        // Unistall function (needs to be here in order to collect the data)
        function wphowto_fs_plugin_uninstall()
        {
            global  $wpdb ;
            $favs_table_name = $wpdb->prefix . 'wp_how_to_favs';
            $wpdb->query( "DROP TABLE IF EXISTS {$favs_table_name}" );
            delete_option( "wp_how_to_plugins_db_version" );
        }
        
        wphowto_fs()->add_action( 'after_uninstall', 'wphowto_fs_plugin_uninstall' );
    }
    
    
    if ( !class_exists( 'How_to_WP' ) ) {
        class How_to_WP
        {
            // Plugin version number
            private  $version = '1.0.2' ;
            // Database table version number
            private  $db_version = '1.0' ;
            public function __construct()
            {
                $this->init();
            }
            
            // Init function separated from default construct func
            public function init()
            {
                register_activation_hook( __FILE__, array( $this, 'create_database_tables' ) );
                add_action( 'wp_ajax_insert_into_database', array( $this, 'insert_into_database' ) );
                add_action( 'admin_enqueue_scripts', array( $this, 'admin_assets' ) );
                add_action( 'admin_footer', array( $this, 'slide_in_section' ) );
            }
            
            /**
             * Creating custom database for plugin data (youtube videos retrieved via javascript)
             *
             * @since    1.0.0
             * */
            public function create_database_tables()
            {
                global  $wpdb ;
                $charset_collate = $wpdb->get_charset_collate();
                $favs_table_name = self::get_favs_table_name();
                $fav_sql = "CREATE TABLE {$favs_table_name} (\n                        id mediumint(9) NOT NULL AUTO_INCREMENT,\n                        stored_on TINYTEXT NOT NULL,\n                        fav_vid_data LONGTEXT NOT NULL,\n                        PRIMARY KEY  (id)\n                        ) {$charset_collate};";
                require_once ABSPATH . 'wp-admin/includes/upgrade.php';
                dbDelta( $fav_sql );
                add_option( 'wp_how_to_favs_db_version', $this->db_version );
            }
            
            /**
             * Inserting data retrieved via javascript into custo database table
             *
             * @since    1.0.0
             * */
            public function insert_into_database()
            {
                // Security check - verify set nonce
                if ( !wp_verify_nonce( $_POST["wp_how_to_favs_nonce"], "wp_how_to_favs_nonce" ) ) {
                    exit( "Access denied!" );
                }
                global  $wpdb ;
                $table_name = self::get_favs_table_name();
                // Remove existing data
                $wpdb->query( $wpdb->prepare( "DELETE FROM {$table_name}" ) );
                // Data processing
                $data = $_POST["wp_how_to_favs_data"];
                // Custom function to sanitize individual data strings
                function custom_data_sanitizing( $initial_data )
                {
                    $modified_data = [];
                    $modified_props = [];
                    // Split initial data and sanitize it
                    $fav_vid_props = $initial_data['favLink'];
                    $fav_link_type = sanitize_text_field( $fav_vid_props['type'] );
                    $fav_link_url = sanitize_text_field( $fav_vid_props['link'] );
                    $fav_vid_title = sanitize_text_field( $initial_data['favTitle'] );
                    $fav_vid_div_id = sanitize_text_field( $initial_data['favDivId'] );
                    $fav_vid_page_link = sanitize_url( $initial_data['favPageLink'] );
                    // Combine sanitized data
                    $modified_props['type'] = $fav_link_type;
                    $modified_props['link'] = $fav_link_url;
                    $modified_data['favLink'] = $modified_props;
                    $modified_data['favTitle'] = $fav_vid_title;
                    $modified_data['favDivId'] = $fav_vid_div_id;
                    $modified_data['favPageLink'] = $fav_vid_page_link;
                    return $modified_data;
                }
                
                // Sanitize array data
                $sanitized_data = [];
                foreach ( $data as $fav_video => $video_data ) {
                    $sanitized_item = custom_data_sanitizing( $video_data );
                    array_push( $sanitized_data, $sanitized_item );
                }
                $sanitized_json_data = wp_json_encode( $sanitized_data );
                $current_time = $_POST["wp_how_to_timestamp"];
                $sanitized_time = sanitize_text_field( $current_time );
                $wpdb->insert( $table_name, array(
                    'stored_on'    => $sanitized_time,
                    'fav_vid_data' => $sanitized_json_data,
                ) );
            }
            
            /**
             * Get data from favs database table to be sent and displayed to end users (through javascript)
             *
             * @since    1.0.0
             * */
            public function get_favs_database_data()
            {
                global  $wpdb ;
                $table_name = self::get_favs_table_name();
                $table_data = $wpdb->get_results( "SELECT * FROM {$table_name}" );
                $validated_data = [];
                
                if ( !empty($table_data) ) {
                    $db_stored_time = esc_html( $table_data['0']->stored_on );
                    $db_fav_videos = esc_html( $table_data['0']->fav_vid_data );
                    $validated_data['stored_on'] = $db_stored_time;
                    $validated_data['fav_vid_data'] = $db_fav_videos;
                }
                
                return $validated_data;
            }
            
            /**
             * Get localized/translated strings to be sent and displayed to end users (through javascript)
             *
             * @since    1.0.0
             * */
            public function get_translated_strings()
            {
                $text_domain = 'how-to-wp';
                // Declare individual strings
                $plugin_icon_title = esc_attr__( 'Open/Close video tutorials', $text_domain );
                $library_icon_title = esc_attr__( 'Open/Close video library page', $text_domain );
                $settings_icon_title = esc_attr__( 'Open/Close settings page', $text_domain );
                $close_x = esc_attr__( 'Close this page', $text_domain );
                $library_plugins_title = esc_html__( 'Video selection for your installed plugins', $text_domain );
                $search_title = esc_html__( 'Find any tutorial using search by category', $text_domain );
                $search_button = esc_html__( 'Search', $text_domain );
                $results_loading = esc_html__( 'Loading results', $text_domain );
                $results_done = esc_html__( 'Result for the searched term', $text_domain );
                $results_count = esc_html__( 'Items found', $text_domain );
                $library_categories_title = esc_html__( 'Tutorial category links', $text_domain );
                $premium_content_link = esc_html__( 'Buy Premium License', $text_domain );
                $library_favourites_title = esc_html__( 'Favourite videos you stored (up to 100 items)', $text_domain );
                $library_history_title = esc_html__( 'Your recent watch history (last 100 items)', $text_domain );
                $store_db_button = esc_html__( 'Store to database', $text_domain );
                $get_db_button = esc_html__( 'Get from database', $text_domain );
                $store_instruction = esc_html__( 'Store all your favourite videos into database, so they wont be lost if you empty your browser cache. Those videos stored will also be available on other browsers or devices you are using.', $text_domain );
                $no_data_stored = esc_html__( 'INFO: No items stored yet!', $text_domain );
                $time_of_storage = esc_html__( 'INFO: Last time of storage', $text_domain );
                $storage_length = esc_html__( 'Number of favourite videos stored', $text_domain );
                $get_instruction = esc_html__( 'Get all your favourite videos previously stored in the database.', $text_domain );
                $reposition_button = esc_html__( 'Reposition player', $text_domain );
                $resize_button = esc_html__( 'Resize player', $text_domain );
                $reposition_instruction = esc_html__( 'Click and hold the button below in order to reposition this window vertically.', $text_domain );
                $resize_instruction = esc_html__( 'Click the button below to resize the player.', $text_domain );
                $opacity_instruction = esc_html__( 'Select the window opacity below.', $text_domain );
                // Associate those individual strings with keys
                $translated_strings = array(
                    'plugin_icon_title'        => $plugin_icon_title,
                    'library_icon_title'       => $library_icon_title,
                    'settings_icon_title'      => $settings_icon_title,
                    'close_x'                  => $close_x,
                    'library_plugins_title'    => $library_plugins_title,
                    'search_title'             => $search_title,
                    'search_button'            => $search_button,
                    'results_loading'          => $results_loading,
                    'results_done'             => $results_done,
                    'results_count'            => $results_count,
                    'library_categories_title' => $library_categories_title,
                    'premium_content_link'     => $premium_content_link,
                    'library_favourites_title' => $library_favourites_title,
                    'library_history_title'    => $library_history_title,
                    'store_db_button'          => $store_db_button,
                    'get_db_button'            => $get_db_button,
                    'store_instruction'        => $store_instruction,
                    'no_data_stored'           => $no_data_stored,
                    'time_of_storage'          => $time_of_storage,
                    'storage_length'           => $storage_length,
                    'get_instruction'          => $get_instruction,
                    'reposition_button'        => $reposition_button,
                    'resize_button'            => $resize_button,
                    'reposition_instruction'   => $reposition_instruction,
                    'resize_instruction'       => $resize_instruction,
                    'opacity_instruction'      => $opacity_instruction,
                );
                return $translated_strings;
            }
            
            /**
             * Adding css and js files to admin dashboard
             *
             * @since    1.0.0
             * */
            public function admin_assets()
            {
                wp_register_script( 'wp-how-to-youtube-script', 'https://www.youtube.com/player_api', true );
                wp_enqueue_script(
                    'wp-how-to-admin-script',
                    plugin_dir_url( __FILE__ ) . 'assets/admin/js/admin-script.js',
                    [ 'jquery', 'wp-how-to-youtube-script' ],
                    $this->version,
                    true
                );
                // Pass data to js
                $fs_not_free = 'false';
                $plugin_slugs = self::get_plugin_slug();
                $fav_videos = $this->get_favs_database_data();
                $translated_strings = $this->get_translated_strings();
                wp_localize_script( 'wp-how-to-admin-script', 'plugin_data', array(
                    'fs_not_free'          => $fs_not_free,
                    'plugin_slugs'         => $plugin_slugs,
                    'fav_videos'           => $fav_videos,
                    'translated_strings'   => $translated_strings,
                    'ajax_url'             => admin_url( 'admin-ajax.php' ),
                    'wp_how_to_favs_nonce' => wp_create_nonce( 'wp_how_to_favs_nonce' ),
                ) );
                wp_enqueue_style(
                    'wp-how-to-admin-style',
                    plugin_dir_url( __FILE__ ) . 'assets/admin/css/admin-style.css',
                    [],
                    $this->version
                );
            }
            
            /**
             * Get plugin slugs from folder or main php file name
             *
             * @since    1.0.0
             */
            public static function get_plugin_slug()
            {
                if ( !function_exists( 'get_plugins' ) ) {
                    require_once ABSPATH . 'wp-admin/includes/plugin.php';
                }
                $all_plugins = get_plugins();
                if ( empty($all_plugins) ) {
                    return [];
                }
                foreach ( $all_plugins as $pluginFile => $pluginData ) {
                    // Strip filename and slashes so we can get the slug
                    
                    if ( false !== strpos( $pluginFile, '/' ) ) {
                        $slugs[] = substr( $pluginFile, 0, strpos( $pluginFile, '/' ) );
                    } else {
                        $slugs[] = sanitize_title( $pluginData['Name'] );
                    }
                
                }
                return $slugs;
            }
            
            /**
             * Display slide-in section on all admin pages.
             *
             * @since    1.0.0
             */
            public function slide_in_section()
            {
                include_once plugin_dir_path( __FILE__ ) . '/assets/admin/partials/slide-in-section.php';
            }
            
            /**
             * Get custom database table name for fav videos (used in multiple other class methods)
             *
             * @since    1.0.0
             * */
            public static function get_favs_table_name()
            {
                global  $wpdb ;
                $table_name = $wpdb->prefix . 'wp_how_to_favs';
                return $table_name;
            }
        
        }
        $wp_how_to_object = new How_to_WP();
    }

}
