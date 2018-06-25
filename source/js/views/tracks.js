export default ( instance, tracks, offset ) => {
    const html = tracks.map(( track, i ) => {
        return `<a class="playlist__tracks__track m" href="${track.permalink_url}" target="_blank">
            <div class="playlist__tracks__number">${i + offset + 1}</div>
            <div class="playlist__tracks__info">${track.user.username} &mdash; ${track.title}</div>
        </a>`;
    });

    return { html: html.join( "" ) };
};
