export default ( module ) => {
    let meow = module.defaultCategory;
    const html = `<div class="menu__wrap">
        <a class="menu__a menu__a--${module.defaultCategory} js-menu-category js-menu--everything ${module.json.categoryFilter ? "" : "is-active"} -grey" data-cat="${module.defaultCategory}" href="${module.json.collection.fullUrl}">
            <span class="menu__text p a a--lit">${module.defaultCategory}</span>
        </a>
        ${module.json.collection.categories.reverse().map(( category ) => {
            const cat = category.toLowerCase();
            const isCat = (module.json.categoryFilter && module.json.categoryFilter === category);

            if ( isCat ) {
                meow = cat;
            }

            return `<a class="menu__a menu__a--${cat} js-menu-category js-menu--${cat} ${isCat ? "is-active" : ""} -grey" data-cat="${cat}" href="${module.json.collection.fullUrl}?category=${category}">
                <span class="menu__text p a a--lit">${category}</span>
            </a>`;

        }).join( "" )}
    </div>`;

    return {
        meow,
        html
    };
};
