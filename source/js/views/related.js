export default ( collection, category, items ) => {
    const isPlaylist = (category === "Playlists");

    return `
        <div class="related__label p -text--center -wrap anim anim--tr js-lazy-anim">More in ${category}</div>
        <div class="related__grid grid">
            ${items.map(( item ) => {
                return `
                    <div class="grid__item related__item anim anim--tr js-lazy-anim">
                        <div class="media js-media">
                            <a class="grid__image" href="${item.fullUrl}">
                                <img class="media__node js-media-node image js-lazy-image" data-img-src="${item.assetUrl}" data-variants="${item.systemDataVariants}" data-original-size="${item.originalSize}" />
                                <div class="grid__image__hover"></div>
                            </a>
                            <div class="grid__info">
                                <a class="grid__title p" href="${item.fullUrl}">${item.title}</a>
                                <a class="grid__meta p a ${isPlaylist ? `a--dim` : `a--lit`} -grey" href="${collection.fullUrl}?category=${item.categories[ 0 ]}">${item.categories[ 0 ]}</a>
                            </div>
                        </div>
                    </div>
                `;

            }).join( "" )}
        </div>
    `;
};
