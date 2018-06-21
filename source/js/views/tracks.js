export default ( instance ) => {
    const html = instance.json.tracks.map(( track, i ) => {
        return `<div class="playlist__tracks__track m">
            <div class="playlist__tracks__number">${i + 1}</div>
            <div class="playlist__tracks__info">${track.user.username} &mdash; ${track.title}</div>
        </div>`;
    });

    return { html: html.join( "" ) };
};
