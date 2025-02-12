define(["qlik", "jquery", "text!./styles.css", "text!./icons.json"], function (qlik, $, cssContent, iconsJson) {
    "use strict";
    
    const icons = JSON.parse(iconsJson);
    
    function generateIconHTML(icon) {
        let iconType = "Normal";
        let displayName = icon;
        let fullIconName = icon.toLowerCase();

        if (icon.endsWith("-F")) {
            iconType = "Field";
            displayName = icon.slice(0, -2) + iconType;
        } else if (icon.endsWith("-S")) {
            iconType = "Stroke";
            displayName = icon.slice(0, -2) + iconType;
        }

        return `
            <div class="icon-item" data-type="${fullIconName}" data-subtype="${iconType.toLowerCase()}" data-icon-name="${displayName}">
                <div class="icon icon-${fullIconName}"></div>
                <span class="icon-title">${displayName}</span>
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
    }
    
    function copyToClipboard(iconName, $iconItem) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName).then(() => {
                showCopiedMessage($iconItem);
            }).catch(console.error);
        } else {
            console.warn("Clipboard API not supported in this browser.");
        }
    }

    function showCopiedMessage($iconItem) {
        const $message = $('<div class="copied-tooltip">Copied!</div>').appendTo($iconItem);
        $message.fadeIn(200).delay(1000).fadeOut(200, function () {
            $(this).remove();
        });
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
            const html = `
                <div class="icon-filter-extension">
                    <input type="text" id="icon-search" placeholder="Search icons..." />
                    <div id="icon-filter-buttons">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="Stroke">Stroke</button>
                        <button class="filter-btn" data-filter="Field">Field</button>
                        <button class="filter-btn" data-filter="normal">Regular</button>
                    </div>
                    <div id="icon-grid" class="scroll-container"></div>
                </div>`;
            
            $element.html(html);
            
            const iconGrid = $("#icon-grid");
            iconGrid.html(icons.map(generateIconHTML).join(""));
            
            $('<style>').html(cssContent).appendTo('head');

            $("#icon-search").on("input", filterIcons);
            $(".filter-btn").on("click", function () {
                $(".filter-btn").removeClass("active");
                $(this).addClass("active");
                filterIcons();
            });
            
            $("#icon-grid").on("click", ".icon-item", function () {
                copyToClipboard($(this).data("icon-name"), $(this));
            });
            
            filterIcons();
        },
    };
});
