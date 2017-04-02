import {MAX_SIZE, DEFAULT_SETTINGS} from './config'

// Полифил чтобы работал Firefox
global.browser = global.chrome;

let settings = browser.storage.sync.get(
        DEFAULT_SETTINGS, function (items) {
            console.log(items);
            settings = items;
        });

// Function to get absolute url from relative
function qualifyURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}
// При наведении должен делаться  запрос на сервер
function OneWEBMListener(event) {
    event.target.removeEventListener('mouseenter', OneWEBMListener);
    const node = event.target;
    let time = event.target.time;

    if (time === undefined) {
        event.target.time = 4;
        time = 0;
    }

    function checkTime() {
        if (time > 0) {
            setWEBMPanel({node: node, message: "Секунд до обновления: " + time});
            time--;
            // event.target.time = time;
        } else {
            clearInterval(intervID);
            event.target.time = 4;
            getOneWEBMData(node);
        }
    }

    // При первом наведении делать запрос, далее добавить таймер
    const intervID = setInterval(checkTime, 1000);
    checkTime();

}
function increaseViewsListener(event) {
    event.target.removeEventListener('click', increaseViewsListener);
    const md5 = event.target.md5;
    if (md5 === undefined) {
        console.log(md5, event.target);
    } else {
        let obj = {};
        obj[md5] = true;
        browser.storage.local.set(obj, function () {
            browser.storage.sync.get({'views': 0}, function (data) {
                let viewsCount = data['views'] + 1;
                browser.storage.sync.set({'views': viewsCount}, function () {
                    console.log('Удачный просмотр');
                })
            })
        });
    }

    let requestHeader = new Headers();
    requestHeader.append('Content-Type', 'application/json');
    requestHeader.append('Accept', 'application/json');

    var request = new Request(`https://devshaft.ru/check/${md5}/view`, {
        headers: requestHeader,
        method: 'POST',
        mode: 'cors'
    });
    fetch(request);
}

// Создаем панель если ее нет и в ней размещаем всю информацию
function setWEBMPanel({node, md5, screamChance, views, likes, dislikes, action, message, viewed} ={}) { // использовать | как сепаратор + добавить подсветку превью на ховер
    let panel = node.querySelector('figcaption > .webm-panel');
    if (panel === null) {
        panel = document.createElement('div');
        panel.className = 'webm-panel';
        const figcaption = node.querySelector('figcaption');
        figcaption.insertBefore(panel, figcaption.children[1]);
    }
    if (screamChance !== undefined) {
        setScreamColor(node, panel, screamChance);
    }
    if (views !== undefined) {
        setViews(panel, views, viewed);
    }
    if (likes !== undefined && dislikes !== undefined) {
        setLikesPanel(panel, md5, likes, dislikes, action)
    }
    if (message !== undefined) {
        setMessage(panel, message);
    }
}

function setLikesPanel(panel, md5 = null, likes, dislikes, action = null) {
    let ratingPanel = panel.querySelector('span.rating');
    if (ratingPanel === null) {
        ratingPanel = document.createElement('span');
        ratingPanel.className = 'rating';
        panel.appendChild(ratingPanel);

        let likesSpan = document.createElement('span');
        createLikeIcon(likesSpan, 'like', action);
        let likeCounter = document.createTextNode(likes);
        likesSpan.appendChild(likeCounter);
        ratingPanel.appendChild(likesSpan);
        setLikesListener(likesSpan.childNodes[0], md5, 'like');

        let dislikesSpan = document.createElement('span');
        createLikeIcon(dislikesSpan, 'dislike', action);
        let dislikeCounter = document.createTextNode(dislikes);
        dislikesSpan.appendChild(dislikeCounter);
        ratingPanel.appendChild(dislikesSpan);
        setLikesListener(dislikesSpan.childNodes[0], md5, 'dislike');
    } else {
        let [likesSpan, dislikesSpan] = ratingPanel.querySelectorAll('span');

        createLikeIcon(likesSpan, 'like', action);
        likesSpan.childNodes[1].nodeValue = likes;

        createLikeIcon(dislikesSpan, 'dislike', action);
        dislikesSpan.childNodes[1].nodeValue = dislikes;
    }

}

// Отвечает за отправку запроса на сервер(лайки и дизлайки) и установку новых иконок и счетчика лайков
// TODO: Проверить убираются ли EventListeners сборщиком мусора при замене иконок
function setLikesListener(node, md5, action_type) {
    node.addEventListener('click', function (event) {
        let requestHeader = new Headers();
        requestHeader.append('Content-Type', 'application/json');
        requestHeader.append('Accept', 'application/json');
        let request = new Request(`https://devshaft.ru/check/${md5}/${action_type}`, {
            headers: requestHeader,
            method: 'POST',
            mode: 'cors'
        });
        fetch(request).then((resp)=> {
            return resp.json()
        }).then((data) => {
            parseData(data);
        });
    })
}

function createLikeIcon(panel, cls, action) {
    if (action === cls) {
        createIcon(panel, cls + '-active');
    } else {
        createIcon(panel, cls);
    }
}

function setViews(panel, views, viewed = false) {
    let views_elem = panel.querySelector('span.views');
    if (views_elem === null) {
        views_elem = document.createElement('span');
        views_elem.className = 'views';

        if (viewed === true) {
            createIcon(views_elem, 'eye', 'viewed');
        } else {
            createIcon(views_elem, 'eye');
        }
        let text_el = document.createElement('span');
        views_elem.appendChild(text_el);
        panel.appendChild(views_elem);
    }
    let text_el = views_elem.querySelector('span');
    text_el.innerText = views;
}
//Sets message of webm, accepts webm-panel selector and text
function setMessage(panel, text) {
    var message = panel.querySelector('span.message');
    if (message === null) {
        message = document.createElement('span');
        message.className = 'message';
        panel.appendChild(message);
    }
    message.innerText = text;
    if (text === null) {
        message.remove()
    }
}

// Отвечает за увеличение счетчика просмотров
function setViewListener(node, md5) {
    if (!md5) {
        console.log(node);
    }
    var img = node.querySelector('img.preview');
    img.removeEventListener('click', increaseViewsListener);
    img.md5 = md5;
    img.addEventListener('click', increaseViewsListener);
}

// Красит элемент в нужный цвет в зависимости от шанса скримера
function setScreamColor(node, panel, screamChance) {
    var scream = panel.querySelector('span.scream');
    if (scream === null) {
        scream = document.createElement('span');
        scream.className = 'scream';
        panel.appendChild(scream);
    }
    const img = node.querySelector('.webm-file');
    let clsHighlight = " ";
    if (settings.alwaysHighlight) {
        clsHighlight = "-const ";
    }
    if (screamChance == null) {
        img.className += ' blue-shadow' + clsHighlight;
        scream.style.background = '#3DBFFF';
        createIcon(scream, 'volume-mute');
    } else if (screamChance == 0) {
        img.className += ' green-shadow' + clsHighlight;
        scream.style.background = '#45D754';
        createIcon(scream, 'volume-low');
    } else if (screamChance == 0.5) {
        img.className += ' yellow-shadow' + clsHighlight;
        scream.style.background = 'yellow';
        createIcon(scream, 'volume-medium');
    } else if (screamChance == 0.8) {
        img.className += ' orange-shadow' + clsHighlight;
        scream.style.background = 'orange';
        createIcon(scream, 'volume-high');
    } else if (screamChance == 1.0) {
        img.className += ' red-shadow' + clsHighlight;
        scream.style.background = 'red';
        createIcon(scream, 'volume-scream');
    }
}
function createIcon(node, name, cls) {
    let icon = node.querySelector('img');
    if (icon === null) {
        icon = document.createElement('img');
        icon.className = 'glyphicon';
        if (cls !== undefined) {
            icon.className = icon.className + ' ' + cls;
        }
        node.appendChild(icon);
    }
    icon.setAttribute('src', browser.runtime.getURL('icons/' + name + '.svg'));
}
// В зависимости от полученных с сервера данных обрабатывает посты в треде
// data - объект с данными одной webm
function parseData(data) {
    let md5 = data.md5;
    let viewed = false; // Была ли уже просмотрена ШЕБМ
    browser.storage.local.get(md5, function (info) {
        if (info[md5] === true) {
            viewed = true;
        }
        // Значит есть информация о лайках - Обновить только ее
        if (data.action || data.action === null) {
            window.webm_data[md5].data = Object.assign(window.webm_data[md5].data, data);
        } else {
            window.webm_data[md5].data = data;
        }
        let nodes = window.webm_data[md5].elems;
        nodes.forEach((node)=> {
            // Обрабатываем только новые ноды
            if (data.message) {
                console.log(data.message);
                setWEBMPanel({node, message: data.message});
                node.removeEventListener('mouseenter', OneWEBMListener);
                node.addEventListener('mouseenter', OneWEBMListener);
            } else {
                var screamChance = data["screamer_chance"];
                node.removeEventListener('mouseenter', OneWEBMListener);
                setWEBMPanel({
                    node,
                    md5: data.md5,
                    screamChance: screamChance,
                    views: data.views,
                    likes: data.likes,
                    dislikes: data.dislikes,
                    action: data.action,
                    message: null,
                    viewed: viewed
                });
                setViewListener(node, md5);
            }
        })
    });
}

// Получить данный об одной вебм с сервера через get запрос и затем нужные элементы
// node - figure.image селектор
function getOneWEBMData(node) {
    var div = node.querySelector('div.image-link');
    var a = div.querySelector('a');
    var md5 = div.id.split('-').pop();
    var url = encodeURIComponent(qualifyURL(a.getAttribute('href')));
    var request = new Request(`https://devshaft.ru/check?md5=${md5}&url=${url}`, {
        method: 'GET',
        mode: 'cors'
    });
    fetch(request).then(function (resp) {
        return resp.json()
    }).then(function (json) {
        parseData(json);
    })
}

// Получить данный о нескольких вебм с сервера через POST запрос и затем подсветить нужные элементы
function getAllWEBMData(nodes) {
    var data = []; // Данные которые отправляем на сервер

    nodes.forEach(function (node) {
        var div = node.querySelector('div');
        var a = div.querySelector('a');
        if (a.getAttribute('href').slice(-5) == ".webm") {
            var size = parseInt(node.querySelector('figcaption.file-attr > span.filesize').innerText.substring(1, 30).split(',')[0]);
            var md5 = div.id.split('-').pop();
            var url = qualifyURL(a.getAttribute('href'));
            var webm = {md5: md5, url: url};
            if (size < MAX_SIZE) {
                if (window.webm_data[md5] === undefined) {
                    window.webm_data[md5] = {elems: [], data: {}};
                }
                window.webm_data[md5].elems.push(node);
                data.push(webm);
            } else {
                setWEBMPanel({node, message: 'Слишком большой размер'})
            }
        }
    });
    // Если нет ничего нового, то останавливаем функцию
    if (data.length === 0) {
        return
    }
    var requestHeader = new Headers();
    requestHeader.append('Content-Type', 'application/json');
    requestHeader.append('Accept', 'application/json');
    var request = new Request('https://devshaft.ru/check', {
        method: 'POST',
        headers: requestHeader,
        mode: 'cors',
        body: JSON.stringify(data)
    });
    fetch(request).then(function (resp) {
        // console.log(resp);
        return resp.json()
    }).then(function (json) {
        json.forEach(function (data) {
            parseData(data);
        })
    })
}

module.exports = {getOneWEBMData, getAllWEBMData};
