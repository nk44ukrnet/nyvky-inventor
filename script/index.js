(function () {
    //current year
    let currentYear = document.querySelectorAll('.currentYear');
    if (currentYear) {
        for (let year of currentYear) {
            year.innerHTML = new Date().getFullYear() + '';
        }
    }
    //sending form
    let documentForm = document.forms['send-to-google-sheet'];
    if (documentForm) {
        documentForm.addEventListener('submit', e => {
            e.preventDefault();
            let btn = documentForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            const form1result = document.querySelector('#form1result');
            fetch('https://script.google.com/macros/s/AKfycbxp_ARWh28mKoQtjpk7GSXmlZa_V4bACidp_xvRiKFSxNXOV31XzX9W_NIS5NWYKIpMmA/exec', {
                method: 'post',
                body: new FormData(documentForm)
            })
                .then(res => {
                    if (res.ok && (res.status <= 200 && res.status < 300)) {
                        form1result.innerHTML = 'Форму успішно надіслано!';
                        console.log(res);
                        documentForm.reset();
                    } else {
                        throw new Error('Помилка, не вдалося надіслати форму!');
                    }
                })
                .catch(err => {
                    form1result.innerHTML = 'Не вдалося надіслати форму. Виникла помилка серверу. Спробуйте пізніше';
                    console.log(err);
                })
                .finally(after => {
                    btn.disabled = false;
                    setTimeout(() => {
                        form1result.innerHTML = '';
                    }, 5000)
                })
        })
    }
    // news
    //news template
    function newsTemplate({date, title, text}) {
        return `
        <div class="news__item">
                    <h4 class="fs-5 text">${title} <code>${date}</code></h4>
                    <p>
                        ${text}
                    </p>
                </div>
        `;
    }

    //
    let news = document.getElementById('newsInner'),
        newsInner = document.getElementById('newsInner');
    //try to fetch news
    fetch('https://opensheet.vercel.app/152DauEcmrDXYZnVjrDrXN_CpBcXT-2N2Nv-oIIn2RbE/news')
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error('не вдалося завантажити новини...')
            }
        })
        .then(res => {
            const arr = res;
            newsInner.innerHTML = '';
            if(arr.length > 3) {
                const shortArr = arr.slice().slice(-3);
                for(let item of shortArr) {
                    console.log(item);
                    newsInner.innerHTML += newsTemplate({date: item.date, title: item.title, text: item.text})
                }
            } else {
                for(let item of arr) {
                    console.log(item);
                    newsInner.innerHTML += newsTemplate({date: item.date, title: item.title, text: item.text})
                }
            }
        })
        .catch(err => {
            console.log(err);
            news.classList.add('d-none');
        })
})()