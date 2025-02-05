define(["qlik", "jquery", "text!./styles.css", "text!./icons.json"], function (qlik, $, cssContent, iconsJson) {
    const icons = JSON.parse(iconsJson); 

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
        paint: function ($element, layout) {
            const html = `
                <div class="icon-filter-extension">
                    <input type="text" id="icon-search" placeholder="Search icons..." />
                    <div id="icon-filter-buttons">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="stroke">Stroke</button>
                        <button class="filter-btn" data-filter="field">Field</button>
                        <button class="filter-btn" data-filter="normal">Regular</button>
                    </div>
                    <div id="icon-grid" class="scroll-container"></div> 
                </div>`;

            $element.html(html);

            const iconGrid = $("#icon-grid");
            icons.forEach((icon) => {
                let iconType = "normal"; 
                let fullIconName = icon.toLowerCase(); 

                if (icon.endsWith("-f")) {
                    iconType = "field"; 
                    fullIconName = icon.toLowerCase(); 
                } else if (icon.endsWith("-s")) {
                    iconType = "stroke"; 
                    fullIconName = icon.toLowerCase(); 
                }

                const iconHTML = `
                    <div class="icon-item" data-type="${fullIconName}" data-subtype="${iconType}">
                        <div class="icon icon-${fullIconName}"></div>
                        <span class="icon-title">${icon}</span> 
                    </div>`;
                iconGrid.append(iconHTML);
            });

            // Apend CSS File to head 
            $( '<style>' ).html(cssContent).appendTo( 'head' );

            // Filter BTN
            $("#icon-search").on("input", function () {
                const query = $(this).val().toLowerCase();
                filterIcons();
            });

            $(".filter-btn").on("click", function () {
                $(".filter-btn").removeClass("active");
                $(this).addClass("active");
                filterIcons();
            });

            function filterIcons() {
                const query = $("#icon-search").val().toLowerCase();
                const selectedFilter = $(".filter-btn.active").data("filter");

                $("#icon-grid .icon-item").each(function () {
                    const type = $(this).data("type");
                    const subtype = $(this).data("subtype");
                    let showIcon = true;

                    if (selectedFilter !== "all" && subtype !== selectedFilter) {
                        showIcon = false;
                    }

                    if (type.indexOf(query) === -1) { 
                        showIcon = false;
                    }

                    if (showIcon) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }

            filterIcons();
        },
    };
});