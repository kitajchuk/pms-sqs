export default ( module ) => {
    let meow = module.defaultCategory;
    const html = `<div class="menu__wrap">
        <a class="menu__a menu__a--${module.defaultCategory} js-menu-category js-menu--everything p a a--lit ${module.json.categoryFilter ? "" : "is-active"} -grey" data-cat="${module.defaultCategory}" href="${module.json.collection.fullUrl}">${module.defaultCategory}</a>
        ${module.json.collection.categories.reverse().map(( category ) => {
            const cat = category.toLowerCase();
            const isCat = (module.json.categoryFilter && module.json.categoryFilter === category);

            if ( isCat ) {
                meow = cat;
            }

            return `<a class="menu__a menu__a--${cat} js-menu-category js-menu--${cat} p a a--lit ${isCat ? "is-active" : ""} -grey" data-cat="${cat}" href="${module.json.collection.fullUrl}?category=${category}">${category}</a>`;

        }).join( "" )}
    </div>`;

    return {
        meow,
        html
    };
};
