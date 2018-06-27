import paramalama from "paramalama";



export default ( blockJson, imageJson ) => {
    const params = paramalama( blockJson.url );
    const url = blockJson.url.replace( /\?.*?$/, "" );
    const id = ((blockJson.resolvedBy === "youtube" && params.v) ? params.v : url.split( "/" ).pop());
    const qrs = (blockJson.resolvedBy === "vimeo" ? `?api=1&player_id=${id}` : `?modestbranding=1&enablejsapi=1`);
    const path = (blockJson.resolvedBy === "vimeo" ? "https://player.vimeo.com/video/" : "https://www.youtube.com/embed/");
    const source = `${path}${id}${qrs}`;
    const aspect = (blockJson.height || 9) / (blockJson.width || 16) * 100;
    const original = `${(blockJson.width || 16)}x${(blockJson.height || 9)}`;
    const svgIcon = require( `../../../blocks/svg-play.block` );

    return `
        <div class="embed js-embed">
            <div class="embed__aspect" style="padding-bottom:${aspect}%;">
                ${(blockJson.resolvedBy === "youtube") ? `<div id="${id}" class="embed__element js-embed-iframe js-media-node"></div>` : `<iframe id="${id}" class="embed__element js-embed-iframe js-media-node" data-src="${source}" data-original="${original}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`}
            </div>
            <div class="embed__poster js-embed-poster js-lazy-image -cover -text--center" data-img-src="${imageJson.src}?format=${imageJson.imageResolution || 'original'}"></div>
            <div class="embed__playbtn js-embed-playbtn">
                ${svgIcon}
            </div>
        </div>
    `;
};
