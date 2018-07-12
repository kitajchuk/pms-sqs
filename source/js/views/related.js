export default ( collection, category, items ) => {
    const isPlaylist = (category === "Playlists");

    return `
        <div class="related__label p -text--center -wrap">More in ${category}</div>
        <div class="grid -wrap">
            ${items.map(( item ) => {
                return `
                    <div class="grid__item related__item">
                        <div class="media js-media">
                            <a class="grid__image" href="${item.fullUrl}">
                                <img class="media__node js-media-node image js-lazy-image" data-img-src="${item.assetUrl}" data-variants="${item.systemDataVariants}" data-original-size="${item.originalSize}" />
                            </a>
                            <a class="grid__title p" href="${item.fullUrl}">${item.title}</a>
                            <a class="grid__meta p a ${isPlaylist ? `a--dim` : `a--lit`} -grey" href="${collection.fullUrl}?category=${item.categories[ 0 ]}">${item.categories[ 0 ]}</a>
                        </div>
                    </div>
                `;

            }).join( "" )}
        </div>
    `;
};
