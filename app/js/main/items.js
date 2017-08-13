'use strict'

const Items = {
    getImage: (url) => {
        if (!url) return Promise.resolve(false);

        return new Promise(resolve => {
            let cache = new Image();
            cache.src = url;
            
            cache.onload = () => {
                resolve(true);
            }
            cache.onerror = (e) => {
                resolve(false);
            }
        });
    },

    constructMovie: (movie) => {
        let d = {
            image: Images.reduce(movie.movie.images.fanart) || movie.movie.images.poster,
            id: movie.movie.ids.slug,
            data: JSON.stringify(movie),
            rating: Misc.percentage(movie.movie.rating),
            size: DB.get('small_items') ? {sm: 6, md: 4, lg: 3} : {sm: 12, md: 6, lg: 4}
        }

        let item = `<div class="grid-item col-sm-${d.size.sm} col-md-${d.size.md} col-lg-${d.size.lg}" id="${d.id}">`+
            `<span class="data">${d.data}</span>`+
            `<div class="fanart">`+
                `<div class="corner-rating"><span></span></div>`+
                `<img class="base" src="images/placeholder.png">`+
                `<div class="shadow"></div>`+
                `<div class="titles">`+
                    `<h3>${movie.movie.title}<span class="year">${movie.movie.year}</span></h3>`+
                `</div>`+
            `</div>`+
            `<div class="quick-icons">`+
                `<div class="actions">`+
                    `<div class="watched trakt-icon-check-thick tooltipped i18n" title="${i18n.__('Mark as watched')}" onClick="Items.markAsWatched(this)"></div>`+
                    `<div class="trailer fa fa-youtube-play tooltipped i18n" title="${i18n.__('Watch trailer')}" onClick="Interface.playTrailer('${movie.movie.trailer}')"></div>`+
                    `<div class="play trakt-icon-play2-thick tooltipped i18n" title="${i18n.__('Watch now')}" onClick="Details.trakt.movie(this)"></div>`+
                `</div>`+
                `<div class="metadata">`+
                    `<div class="percentage tooltipped i18n" title="${i18n.__('Rate this')}" onClick="Items.rate('${d.id}')">`+
                        `<div class="fa fa-heart"></div>`+
                        `${d.rating}&nbsp%`+
                `</div>`+
            `</div>`+
        `</div>`;

        Items.getImage(d.image).then(state => {
            state && $(`#${d.id} .fanart`).css('background-image', `url('${d.image}')`) && $(`#${d.id} .fanart img`).css('opacity', '0');
            !movie.movie.trailer && $(`#${d.id} .trailer`).hide();
        })

        return item;
    },
    constructShow: (show) => {
        let d = {
            image: Images.reduce(show.show.images.fanart) || show.show.images.poster,
            id: show.show.ids.slug,
            sxe: `s${Misc.pad(show.next_episode.season)}e${Misc.pad(show.next_episode.number)}`,
            data: JSON.stringify(show),
            rating: Misc.percentage(show.show.rating),
            size: DB.get('small_items') ? {sm: 6, md: 4, lg: 3} : {sm: 12, md: 6, lg: 4}
        }

        let item = `<div class="grid-item col-sm-${d.size.sm} col-md-${d.size.md} col-lg-${d.size.lg}" id="${d.id}">`+
            `<span class="data">${d.data}</span>`+
            `<div class="fanart">`+
                `<div class="corner-rating"><span></span></div>`+
                `<img class="base" src="images/placeholder.png">`+
                `<div class="shadow"></div>`+
                `<div class="titles">`+
                    `<h4>`+
                        `<span class="sxe">${d.sxe}</span>`+
                        `<span class="unseen tooltipped i18n" title="${i18n.__('This episode and %s other(s) left to watch', show.unseen - 1)}">+${show.unseen - 1}</span>`+
                        `<span class="eptitle">${show.next_episode.title}</span>`+
                    `</h4><br/>`+
                    `<h3>${show.show.title}<span class="year">${show.show.year}</span></h3>`+
                `</div>`+
            `</div>`+
            `<div class="quick-icons">`+
                `<div class="actions">`+
                    `<div class="watched trakt-icon-check-thick tooltipped i18n" title="${i18n.__('Mark as watched')}" onClick="Items.markAsWatched(this)"></div>`+
                    `<div class="trailer fa fa-youtube-play tooltipped i18n" title="${i18n.__('Watch trailer')}" onClick="Interface.playTrailer('${show.show.trailer}')"></div>`+
                    `<div class="play trakt-icon-play2-thick tooltipped i18n" title="${i18n.__('Play now')}" onClick="Details.trakt.episode(this)"></div>`+
                `</div>`+
                `<div class="metadata">`+
                    `<div class="percentage tooltipped i18n" title="${i18n.__('Rate this')}" onClick="Items.rate('${d.id}')">`+
                        `<div class="fa fa-heart"></div>`+
                        `${d.rating}&nbsp;%`+
                `</div>`+
            `</div>`+
        `</div>`;

        Items.getImage(d.image).then(state => {
            state && $(`#${d.id} .fanart`).css('background-image', `url('${d.image}')`) && $(`#${d.id} .fanart img`).css('opacity', '0');
            !show.show.trailer && $(`#${d.id} .trailer`).hide();
            !(show.unseen - 1) && $(`#${d.id} .unseen`).hide();
        });

        return item;
    },
    constructLocalMovie: (movie) => {
        let d = {
            id: Misc.slugify(movie.path),
            data: JSON.stringify(movie)
        }

        let item = `<div class="local-item" onClick="Details.local.movie(this)" id="${d.id}">`+
            `<span class="data">${d.data}</span>`+
            `<span class="title">${movie.metadata.movie.title}</span>`+
        `</div>`;

        return item;
    },
    constructLocalUnmatched: (file) => {
        let d = {
            id: Misc.slugify(file.path),
            data: JSON.stringify(file)
        }

        let item = `<div class="local-item" onClick="Details.local.unmatched(this)" id="${d.id}">`+
            `<span class="data">${d.data}</span>`+
            `<span class="title">${file.filename}</span>`+
        `</div>`;

        return item;
    },
    constructLocalShow: (show) => {
        let d = {
            id: Misc.slugify(show.metadata.show.title) + '-local'
        };

        let seasons = function () {
            let str = String();

            for (let s in show.seasons) {
                str += `<div class="season s${s}" onClick="Interface.locals.showEpisodes('${d.id}', ${s})"><span class="title">${i18n.__('Season %s',s)}</span>`;

                for (let e in show.seasons[s].episodes) {
                    let sxe = `S${Misc.pad(s)}E${Misc.pad(e)}`;
                    let title = show.seasons[s].episodes[e].metadata.episode.title;

                    // attach show information
                    let data = show.seasons[s].episodes[e];
                    data.metadata.show = show.metadata.show;

                    str += `<div class="episode e${e}" onClick="Details.local.episode(this)" id="${Misc.slugify(show.seasons[s].episodes[e].path)}" onClick="event.stopPropagation()"><span class="data">${JSON.stringify(data)}</span><span class="e-title">${sxe} - ${title}</span></div>`;
                }
                str += `</div>`;
            }

            return str;
        }();

        let item = `<div class="local-item" id="${d.id}" onClick="Interface.locals.showSeasons('${d.id}')">`+
            `<span class="title">${show.metadata.show.title}</span>`+
            `<div class="seasons">${seasons}</div>`+
        `</div>`;

        return item;
    },

    markAsWatched: (elm) => {
        let id = $(elm).context.offsetParent.id || $(elm).context.id;
        let data = JSON.parse($(`#${id} .data`).text());

        let type, model;
        
        if (data.movie) {
            type = 'movies';
            model = data.movie;
        } else {
            type = 'episodes';
            model = data.next_episode;
        }

        let post = {};
        let item = {ids: model.ids};
        post[type] = [item];

        console.info('Mark as watched:', model.ids.slug);
        Trakt.client.sync.history.add(post);

        $(elm).addClass('selected');
        $(`#${id}`).append('<div class="item-spinner"><div class="fa fa-spin fa-refresh"></div>');

        setTimeout(() => {
            Trakt.reload(true);
        }, 500);
    },

    applyRatings: (ratings) => {
        $('.corner-rating span').text('');
        $('.corner-rating').hide();

        for (let item of ratings) {
            if (['show', 'movie'].indexOf(item.type) === -1) continue;

            $(`#${item[item.type].ids.slug} .corner-rating span`).text(item.rating).parent().show();
            // do the rating
        }
    },

    rate: (slug) => {
        let $this = $(`#${slug} .percentage`);
        $('.popover').remove();

        console.log('show/hide popup for', slug);

        if (!$this.attr('initialized')) {
            console.log('building a new popup');
            let isRated = $(`#${slug} .corner-rating span`).text();

            let content = '';
            for (let i = 10; i > 0; i--) {
                let id = "rating-" + i + '-' + Date.now();

                content += `<input id="${id}" type="radio" class="rating-${i}" name="rating" value="${i}" ${isRated == i ? 'checked=1' : ''}/>`+
                    `<label for="${id}" title="" class="rating-${i}">${i}</label>`
            }

            $this.popover({
                placement: 'bottom',
                trigger: 'focus',
                html: true
            }).on('shown.bs.popover', () => {
                setTimeout(() => {
                    document.getElementsByClassName('popover-content')[0].innerHTML = '<div class="rating-hearts">' + content + '</div>';

                    $('.popover').find('label').off('mouseover').on('mouseover', function () {
                        let t = $("#" + $(this).attr("for"));
                        let e = t.val();
                        $('.popover-title').text(isRated == e ? i18n.__('Unrate this') : e + '/10');
                    }).off('mouseleave').on('mouseleave', () => {
                        $('.popover-title').text($this.data('original-title'));
                    }).off('click').on('click', function (e) {
                        e.preventDefault();

                        let t = $("#" + $(this).attr("for"));
                        let score = t.val();

                        let item = JSON.parse($(`#${slug} .data`).text());
                        if (isRated == score) {
                            Trakt.rate('remove', item);
                        } else {
                            Trakt.rate('add', item, score);
                        }

                        $this.removeAttr('initialized');
                        $this.popover('destroy');
                    })
                }, 0);
            });

            $this.attr('initialized', 1);
        }

        $this.popover('toggle');
    }
}