define([
    "qlik",
    "jquery",
    "text!./core-ui.css"
], function (qlik, $, cssCoreUIContent) {
    "use strict";

    // Configuration variables for file URLs
    const iconsJsonUrl = "https://qlikreleasestoragepub.blob.core.windows.net/release/icons.json";
    const stylesCssUrl = "https://qlikreleasestoragepub.blob.core.windows.net/release/styles.css";
    
    // Initialize variables to store loaded data
    let icons = [];
    let remoteResourcesLoaded = false;
    
    function loadExternalResources() {
        return Promise.all([
            // Load the icons JSON file
            $.getJSON(iconsJsonUrl).then(function(data) {
                icons = data;
                return data;
            }).catch(function(error) {
                console.error("Failed to load icons JSON:", error);
                return [];
            }),
            
            // Load and append the external CSS
            $.get(stylesCssUrl).then(function(cssContent) {
                $('<style>').html(cssContent).appendTo('head');
                return cssContent;
            }).catch(function(error) {
                console.error("Failed to load external CSS:", error);
                return null;
            })
        ]).then(function(results) {
            remoteResourcesLoaded = true;
            return results;
        });
    }

    function generateIconHTML(icon) {
        let iconType = "normal";
        let displayName = icon;
        let fullIconName = icon.toLowerCase();

        if (icon.endsWith("-f")) {
            iconType = "filled";
            displayName = icon.slice(0, -2) + "Filled";
        } else if (icon.endsWith("-s")) {
            iconType = "stroke";
            displayName = icon.slice(0, -2) + "Stroke";
        }

        return `
            <div class="icon-item" data-type="${fullIconName}" data-subtype="${iconType}" data-icon-name="${displayName}">
                <div class="icon-container">
                    <div class="icon icon-${fullIconName}"></div>
                    <div class="copy-overlay">
                        <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M8 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 0h2a2 2 0 0 1 2 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                    </div>
                </div>
                <span class="icon-title">${displayName}</span>
                <div class="tooltip-mi">Click to copy</div>
            </div>`;
    }

    function filterIcons() {
        const query = $("#icon-search").val().toLowerCase();
        const selectedFilter = $(".filter-btn.active").data("filter");

        $("#icon-grid .icon-item").each(function () {
            const type = $(this).data("type");
            const subtype = $(this).data("subtype");
            const showIcon = (selectedFilter === "all" || subtype === selectedFilter) && type.includes(query);
            $(this).toggle(showIcon);
        });
        updateFilterButtonCounts();
    }

    function updateFilterButtonCounts() {
        const strokeCount = $("#icon-grid .icon-item[data-subtype='stroke']:visible").length;
        const filledCount = $("#icon-grid .icon-item[data-subtype='filled']:visible").length;
        const normalCount = $("#icon-grid .icon-item[data-subtype='normal']:visible").length;
        const allCount = $("#icon-grid .icon-item:visible").length;

        $(".filter-btn[data-filter='all']").text(`All (${allCount})`);
        $(".filter-btn[data-filter='stroke']").text(`Stroke (${strokeCount})`);
        $(".filter-btn[data-filter='filled']").text(`Filled (${filledCount})`);
        $(".filter-btn[data-filter='normal']").text(`Regular (${normalCount})`);
    }

    function copyToClipboard(iconName, $iconItem) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName).then(() => {
                showCopiedMessage($iconItem);
            }).catch(console.error);
        } else {
            // Fallback for browsers without clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = iconName;
            textarea.style.position = 'fixed';  // Prevent scrolling to bottom
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
                document.execCommand('copy');
                showCopiedMessage($iconItem);
            } catch (err) {
                console.error('Fallback: Could not copy text: ', err);
            }
            
            document.body.removeChild(textarea);
        }
    }

    function showCopiedMessage($iconItem) {
        // Remove any existing copied tooltips
        $(".copied-tooltip").remove();
        
        // Add the copied tooltip with animation
        const $message = $('<div class="copied-tooltip success-message">Copied to clipboard!</div>').appendTo($iconItem);
        
        // Add success indicator
        $iconItem.addClass("copy-success");
        
        // Remove success class after animation completes
        setTimeout(function() {
            $iconItem.removeClass("copy-success");
            $message.fadeOut(200, function() {
                $(this).remove();
            });
        }, 1500);
    }

    return {
        initialProperties: {
            version: 1.1,
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                settings: {
                    uses: "settings",
                },
            },
        },
        paint: function ($element) {
            // Add the core UI styles
            if (cssCoreUIContent) {
                $('<style>').html(cssCoreUIContent).appendTo('head');
            }
            
            
            // Create the initial UI with loader
            const html = `
                <div class="icon-filter-extension">
                    <input type="text" id="icon-search" placeholder="Search icons..." style="display: none;" />
                    
                    <div id="icon-filter-buttons" style="display: none;">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="stroke">Stroke</button>
                        <button class="filter-btn" data-filter="filled">Filled</button>
                        <button class="filter-btn" data-filter="normal">Regular</button>
                    </div>
                    
                    <div id="icon-grid" class="scroll-container">
                        <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 200px; width: 100%;">
                            <div class="loading">
                                <div style="text-align: center;">
                                    <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                                    <p style="margin-top: 10px;">Loading icons from online source...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>`;

            $element.html(html);
            
            // Only load from online sources - don't try to use any local files
            loadExternalResources().then(function() {
                const iconGrid = $("#icon-grid");
                
                // Remove the loading spinner
                iconGrid.find(".loading-container").remove();
                
                // Show the search, info banner, and filter controls
                $("#icon-search").show();
                $("#icon-filter-buttons").show();
                $(".info-banner").show();
                
                // Check if icons were loaded successfully
                if (!icons || !Array.isArray(icons) || icons.length === 0) {
                    iconGrid.html("<div class='error'>Failed to load icons from online source. Please check your internet connection and try again.</div>");
                    return;
                }
                
                // Add the icons to the grid
                iconGrid.html(icons.map(generateIconHTML).join(""));
                filterIcons();
                updateFilterButtonCounts();
                
                // Attach event handlers
                $("#icon-search").on("input", filterIcons);
                $(".filter-btn").on("click", function () {
                    $(".filter-btn").removeClass("active");
                    $(this).addClass("active");
                    filterIcons();
                });

                $("#icon-grid").on("click", ".icon-item", function () {
                    copyToClipboard($(this).data("icon-name"), $(this));
                });
            }).catch(function(error) {
                console.error("Error loading online resources:", error);
                $("#icon-grid").html("<div class='error'>An error occurred while loading online resources. Please check your internet connection and try again.</div>");
            });
        },
    };
});